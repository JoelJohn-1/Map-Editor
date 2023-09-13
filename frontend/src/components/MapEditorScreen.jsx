import { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import EditBanner from "./EditBanner";
import EditBar from "./EditBar";
import NameRegionModal from "./modals/NameRegionModal";
import Slider from '@mui/material/Slider';

import { useQuery } from "react-query";
import { loadMap, saveMap, updateThumbnail } from "../api/map";

import { MapContainer, GeoJSON } from "react-leaflet";
import ReactLeafletEditabl from 'react-leaflet-editable';
const ReactLeafletEditable = ReactLeafletEditabl.default? ReactLeafletEditabl.default : ReactLeafletEditabl
import * as turf from '@turf/turf'

import "leaflet/dist/leaflet.css";
import "leaflet-editable";

import leafletImage from "leaflet-image"

import * as jsondiffpatch from 'jsondiffpatch'
let patcher = jsondiffpatch.create({
	objectHash: function (obj) {
		return obj.hash;
	}
});

export default function MapEditorScreen() {


	const { isLoading, isSuccess, data } = useQuery("map", slowLoad, { enabled: true, cacheTime: 0 });

	//Get/Set current mode of user
	const [editMode, _setEditMode] = useState(false);
	const editModeRef = useRef(editMode);

	const [splitMode, _setSplitMode] = useState(false);
	const splitModeRef = useRef(splitMode);

	const { id } = useParams();
	const [layer, setLayer] = useState(null);
	const [open, setOpen] = useState(false);

	// Limit amount of points shown "per region"
	const [limitPoints, _setLimitPoints] = useState(20);
	const limitPointsRef = useRef(limitPoints)
	const maxDistance = 5000;
	
	// Last region edited
	const [lastEditedRegion, _lastEditedRegion] = useState(null)
	const lastEditedRegionRef = useRef(lastEditedRegion)
	useEffect(()=> {
		if(data && !editMode) {
			_addToGeoJsonKey(geoJsonKey+1) 
		}
		lastEditedRegionRef.current= lastEditedRegion
		limitPointsRef.current = limitPoints;

	}, [lastEditedRegion, data, limitPoints])



	const close = () => setOpen(false);
	const openNameModal = (event) => {
		if (splitModeRef.current)
			return;
		setLayer(event.target);
		setOpen(true);
	}

	let countryStyle = {
		fillColor: "white",
		fillOpacity: 1,
		color: "black",
		weight: 1,
	};

	async function slowLoad() {
		let res = loadMap({id: id})
		//await new Promise(r => setTimeout(r, 1000))
		return res
	}

	const [ firstLoad, setFirstLoad ] = useState(true)
	//Ref for editor container
	const editRef = useRef();

	//Ref for current map and current geojson
	const mapRef = useRef();
	const geoJsonRef = useRef();

	//Check if event handlers for map have been intialized or not
	const [initialized, setInitialized] = useState(false);
	const [runOnce, setRunOunce] = useState(false);
	//Stores the first point user clicked when splitting a feature
	const [firstPoint, _setFirstPoint] = useState(null);
	const firstPointRef = useRef(firstPoint);
	const setFirstPoint = (data) => {
		firstPointRef.current = data;
		_setFirstPoint(data);
	};

	//Stores all features that are selected
	let selectedLayersRef = new Set();
	let selectedLayers = useRef(selectedLayersRef).current;

	//Stores all features that are being edited
	let selectedFeaturesRef = new Set();
	let selectedFeatures = useRef(selectedFeaturesRef).current

	//Stores all vertices
	let verticesRef = new Set()
	let vertices = useRef(verticesRef).current;

	//Stores all vertices with the same coordinates together
	let [borders, _setBorders] = useState(null);
	let bordersRef = useRef(borders)
	const setBorders = (data) => {
		bordersRef.current = data
		_setBorders(data)
	}

	//Stores all drawn layers in edit mode
	let drawnLayersRef = new Set()
	let drawnLayers = useRef(drawnLayersRef).current

	//Stores all new features to add to map from drawing
	let newFeaturesRef = new Set()
	let newFeatures = useRef(newFeaturesRef).current

	

	//Rerender Map
	const [geoJsonKey, _addToGeoJsonKey] = useState(1);
	const geoJsonKeyRef = useRef(geoJsonKey);
	const setGeoJsonKey = (data) => {
		geoJsonKeyRef.current = data;
		_addToGeoJsonKey(data);
	};

	//Set edit mode
	const setEditMode = (newEditMode) => {
		if (newEditMode === true) {
			Object.values(mapRef.current._layers).forEach(item => {
				if (item.options && item.options.className === "label") {
					item.setOpacity(0)
				}
			})
		} else {
			Object.values(mapRef.current._layers).forEach(item => {
				if (item.options && item.options.className === "label") {
					item.setOpacity(1)
				}
			})
		}
		selectedLayers.clear();
		if (!newEditMode) {
			data.editTps.clearAllTransactions()
		}
		editModeRef.current = newEditMode
		_setEditMode(newEditMode)
	}

	//Set split mode
	const setSplitMode = (newSplitMode) => {
		if (!newSplitMode) {
			mapRef.current.editTools.stopDrawing()
			Object.values(mapRef.current._layers).forEach( layer => {
				if (layer.isPolyline ) {
					layer.remove()
				}
			})
		}

		splitModeRef.current = newSplitMode
		_setSplitMode(newSplitMode)
	}

	//Create a deep clone of a object
	function deepClone(obj, hash = new WeakMap()) {
		// Do not try to clone primitives or functions
		if (Object(obj) !== obj || obj instanceof Function) return obj;
		if (hash.has(obj)) return hash.get(obj); // Cyclic reference
		try { // Try to run constructor (without arguments, as we don't know them)
			var result = new obj.constructor();
		} catch(e) { // Constructor failed, create object without running the constructor
			result = Object.create(Object.getPrototypeOf(obj));
		}
		// Optional: support for some standard constructors (extend as desired)
		if (obj instanceof Map)
			Array.from(obj, ([key, val]) => result.set(deepClone(key, hash), 
													   deepClone(val, hash)) );
		else if (obj instanceof Set)
			Array.from(obj, (key) => result.add(deepClone(key, hash)) );
		// Register in hash    
		hash.set(obj, result);
		// Clone and assign enumerable own properties recursively
		return Object.assign(result, ...Object.keys(obj).map (
			key => ({ [key]: deepClone(obj[key], hash) }) ));
	}

	//Create a deep clone of a vertexes polygons latlngs
	const deepCloneLatLng = (latlngs, type) => {
		if (type == "Polygon") {
			let returnArray = []
			latlngs[0].forEach( vertex => {
				if (vertex.lat !== undefined) {
					returnArray.push([structuredClone(vertex.lat), structuredClone(vertex.lng)])
				} else {
					returnArray.push([structuredClone(vertex[0]), structuredClone(vertex[1])])
				}
			})
			return [returnArray]
		} else {
			let returnArray = []
			latlngs.forEach (outerArray => {
				let intermediateArray = []
				outerArray[0].forEach( vertex => {
					if (vertex.lat) {
						intermediateArray.push([structuredClone(vertex.lat), structuredClone(vertex.lng)])
					} else {
						intermediateArray.push([structuredClone(vertex[0]), structuredClone(vertex[1])])
					}
				})
				returnArray.push([intermediateArray])
			})
			return returnArray
		}
	}

	//Create a clone of a polygon with the new latlngs
	const clonePolygon = (polygon, latlngs,events=null) => {
		let newPolygon = L.polygon(latlngs, {color: 'red'})
		newPolygon.properties = (polygon.feature.properties);
		newPolygon.feature = polygon.feature
		newPolygon.isPolygon = true;
		newPolygon.on("mousemove",handleMouseMove)
		newPolygon.on("mouseout", handleMouseOut)
		return newPolygon
	}

	//Find relative distance between two points for comparison
	const distance = (a, b) => {
		return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
	}
	//Takes in a polygon and a point and returns the vertex with the same coordinates
	const indexOfPointInPolygon = (polygon, point) => {
		let indexOne = -1;
		let indexTwo = -1;
		
		//Case of a multipolygon
		//IndexOne and IndexTwo refer to the outerlevel index and then the innerlevel index respectivly
		if (polygon.feature.geometry.type == "MultiPolygon") {
			polygon._latlngs.forEach((arrayOne, curIndexOne) => {
				arrayOne[0].forEach((vertex, curIndexTwo) => {
					
					if (vertex["lng"] == point[0] && vertex["lat"] == point[1]) {
						indexOne = curIndexOne;
						indexTwo = curIndexTwo
					}
				})
			})
			polygon._latlngs[indexOne][0][indexTwo].__vertex.polygonIndex = indexTwo
			polygon._latlngs[indexOne][0][indexTwo].__vertex.polygonIndexOne = indexOne
			return polygon._latlngs[indexOne][0][indexTwo].__vertex

		} 
		//Case of a single polygon
		else {
			polygon._latlngs.forEach((arrayOne, curIndexOne) => {
				arrayOne.forEach((vertex, curIndexTwo) => {
				
					if (vertex["lng"] == point[0] && vertex["lat"] == point[1]) {
						indexOne = curIndexOne;
						indexTwo = curIndexTwo
					}
				})
			})
			polygon._latlngs[indexOne][indexTwo].__vertex.polygonIndex = indexTwo
			polygon._latlngs[indexOne][indexTwo].__vertex.polygonIndexOne = indexOne
			return polygon._latlngs[indexOne][indexTwo].__vertex
		}
		

	}

	//Determines if a point is inside a polygons bounds
	function isMarkerInsidePolygon(point, poly) {
		

		var polyPoints = poly.getLatLngs()[0];
		if (poly.feature.geometry.type == "MultiPolygon") {
			polyPoints = poly.vertexFeature
		}
		
		var x = point[0], y = point[1];
	
		var inside = false;
		for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
			var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
			var xj = polyPoints[j].lat, yj = polyPoints[j].lng;
	
			var intersect = ((yi > y) != (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) inside = !inside;
		}
	
		return inside;
	};
	
	//Initalize all edit mode event listeners/handlers
	const initializeMapFeatures = () => {
		if (!initialized) {
			setInitialized(true)

			//Selecting Vertex on Click
			mapRef.current.on('editable:vertex:rawclick', function(e) {
				console.log(e.vertex.polygon.feature)
				//Standard edit mode
				if (!splitModeRef.current) {
					e.cancel()
					if (!e.vertex.new) {
						if (e.vertex._icon.style.backgroundColor === "red")
							e.vertex._icon.style.backgroundColor = ""
						else
							e.vertex._icon.style.backgroundColor = "red"
					} 
					//Handle undo redo for creating a vertex
					else {
						e.vertex.new = false
						if (!splitModeRef.current) {
							//Create an old polygon before the current index was created
							let vertex = indexOfPointInPolygon(e.layer, [e.vertex._latlng.lng, e.vertex._latlng.lat])
							let oldLatLng = deepCloneLatLng(e.layer._latlngs, e.layer.feature.geometry.type)	
										
							if (e.layer.feature.geometry.type == "Polygon")
								oldLatLng[vertex.polygonIndexOne].splice(vertex.polygonIndex, 1)
							else
								oldLatLng[vertex.polygonIndexOne][0].splice(vertex.polygonIndex, 1)
							
							let oldPolygon = clonePolygon(e.layer, oldLatLng);
							let newPolygon = clonePolygon(e.layer, deepCloneLatLng(e.layer._latlngs,  e.layer.feature.geometry.type))
							data.editTps.addTransaction(oldPolygon, newPolygon)
						}
					}
				} 
				//Split mode
				else {
					e.cancel()
					//Let user select any vertex on the polygon as the first point to begin splitting and begin drawwing
					if (!editRef.current.drawing) {
						setFirstPoint([e.latlng["lng"], e.latlng["lat"]])
						var polyline = L.polyline( [[e.latlng["lat"], e.latlng["lng"]]], {color: 'blue'}).addTo(mapRef.current);
						polyline.isPolyline = true
						polyline.vertexFeature = e.sourceTarget.latlngs
						polyline.enableEdit()
						polyline._latlngs[0].__vertex.continue()
						
						polyline.feature = e.vertex.feature
						polyline.polygon = e.vertex.polygon
					} 	
				}
			});

			//Delete Vertex on Shift Click
			mapRef.current.on('editable:vertex:shiftclick', function(e) {
				let canDelete = false
				if (e.layer.feature.geometry.type == "Polygon" && e.layer._latlngs[0].length > 3)
					canDelete = true
				else if (e.layer.feature.geometry.type == "MultiPolygon" && e.layer.polygon._latlngs.length > 1)
					canDelete = true

				if (canDelete) {
					let oldPolygon = clonePolygon(e.layer, deepCloneLatLng(e.layer._latlngs, e.layer.feature.geometry.type))
					e.vertex.delete()
					let newPolygon = clonePolygon(e.layer, deepCloneLatLng(e.layer._latlngs, e.layer.feature.geometry.type))
					data.editTps.addTransaction(oldPolygon, newPolygon)
				}
			})

			//Stores and prepares new feature to be added to map when user finishes drawing
			mapRef.current.on('editable:drawing:commit', function(e) {
				//If drawing in split mode
				if (splitModeRef.current) {
					//Get a flattened list of all vertex points in the current polygon
					let polyLayer = L.polygon(e.layer.polygon._latlngs).toGeoJSON()
					let flattenedPoints = null;
					if (e.layer.feature.geometry.type == "Polygon") {
						flattenedPoints = polyLayer.geometry.coordinates.flat();
					} else {
						flattenedPoints = polyLayer.geometry.coordinates.flat().flat();
					}
					//See which point is the closest to the last point the user drew to end the split region
					let pointa = [e.vertex.latlng["lng"], e.vertex.latlng["lat"]]
					let maximum = Number.MAX_SAFE_INTEGER
					let closestPoint = null
					flattenedPoints.forEach( pointB => {
						let curDistance = distance(pointa, pointB)
						if (curDistance < maximum) {
							maximum =curDistance
							closestPoint = pointB
						}
					})
					
					//Finds the vertices of the first point the user draw in split region and the last point the user drew in split region 
					let vertexOne = indexOfPointInPolygon(e.layer.polygon, firstPointRef.current)
					let vertexTwo = indexOfPointInPolygon(e.layer.polygon, closestPoint)
					
					//Split polygon by seperating at two points and making the boundary follow the path the user drew
					splitPolygon(vertexOne, vertexTwo, e.layer)
				} 
				//If drawing normally(creating a new feature)
				else {
					let newFeature = L.polygon(e.vertex.latlngs).toGeoJSON()
					newFeature.properties[data.nameLevel] = "newFeature"
					drawnLayers.add(e.layer)
					newFeatures.add(newFeature)
				}
			})

			mapRef.current.on('editable:vertex:dragstart', function (e) {
				L.DomUtil.setOpacity(e.vertex._icon,1);

				if (!splitModeRef.current) {
					//Save old polyogn data
					e.vertex.oldCoords = deepCloneLatLng(e.layer._latlngs, e.layer.feature.geometry.type)
					e.vertex.originalPosition = [e.vertex.latlng["lat"], e.vertex.latlng["lng"]]
				} else {
					e.vertex.dragging.disable();
				}
			})

			mapRef.current.on('editable:vertex:dragend', function (e) {
				//Get old polygon data
				let oldPolygon = clonePolygon(e.layer, e.vertex.oldCoords)
				
				let updated = false
				let borderUpdate = false;
				const oldPolygons = []
				const newPolygons = []
				if (bordersRef.current[hashLatLng(e.vertex.originalPosition)] !== undefined && !runOnce)  {
					borderUpdate = true;
					bordersRef.current[hashLatLng(e.vertex.originalPosition)].forEach( vertex => {
						if (e.vertex !== vertex) {
							let oldCurPolygon = clonePolygon(vertex.polygon, deepCloneLatLng(vertex.polygon._latlngs, vertex.polygon.feature.geometry.type))
							oldPolygons.push(oldCurPolygon)
							let vertexIndexed = indexOfPointInPolygon(vertex.polygon, [vertex._latlng["lng"], vertex._latlng["lat"]])
							let newLatLngs = deepCloneLatLng(vertex.polygon._latlngs, vertex.polygon.feature.geometry.type)	
							if (vertex.polygon.feature.geometry.type == "MultiPolygon") {
								newLatLngs[vertexIndexed.polygonIndexOne][0][vertex.polygonIndex] = [e.vertex._latlng["lat"], e.vertex._latlng["lng"]] 
							} else {
								newLatLngs[vertexIndexed.polygonIndexOne][vertex.polygonIndex] = [e.vertex._latlng["lat"], e.vertex._latlng["lng"]] 
							}
							vertex.polygon.remove();
							let newCurPolygon = clonePolygon(vertex.polygon, newLatLngs)
							let newCurPolygon2 = clonePolygon(vertex.polygon, newLatLngs)

							newCurPolygon.addTo(mapRef.current)
							newCurPolygon.enableEdit();
							newPolygons.push(newCurPolygon2)
							
							updated = true
						}
					})

				}
				hashBorders();
				if (!borderUpdate) {
					//Save new polygon data
					let newPolygon = clonePolygon(e.layer, deepCloneLatLng(e.layer._latlngs, e.layer.feature.geometry.type))
					data.editTps.addTransaction(oldPolygon, newPolygon)
				} else {
					let newPolygon = clonePolygon(e.layer, deepCloneLatLng(e.layer._latlngs, e.layer.feature.geometry.type))
					oldPolygons.push(oldPolygon)
					newPolygons.push(newPolygon)
					
					data.editTps.addTransaction(oldPolygons, newPolygons)
				}
				
			})

			mapRef.current.on('editable:vertex:new', function (e) {
				//Handles issue with highlighting a vertex when created
				L.DomUtil.setOpacity(e.vertex._icon, 1);
				e.vertex.new = true
				hashBorders();
			})
			
			mapRef.current.on('editable:drawing:click', function (e) {
				if (splitModeRef.current) {
					e.layer.polygon.vertexFeature = e.layer.vertexFeature
					
					let insidePolygon = isMarkerInsidePolygon([e.latlng["lat"], e.latlng["lng"]], e.layer.polygon)
					if (!insidePolygon) {
						e.cancel();
					}
					
					let polyLine = e.layer.toGeoJSON();
					
					let crossesBoundary = false;
					if (e.layer.polygon.feature.geometry.type == "MultiPolygon") {
						e.layer.polygon.feature.geometry.coordinates.forEach(subarray => {
							let line1 = turf.lineString(subarray[0])
							let line2 = turf.lineString([polyLine.geometry.coordinates[0], [e.latlng["lng"], e.latlng["lat"]]])
							let intersects = turf.lineIntersect(line1, line2)
							if (hashLatLng(firstPointRef.current) === hashLatLng(polyLine.geometry.coordinates[0])) {
								if (intersects.features.length > 1) {
									crossesBoundary = true;
								}
							} else {
								if (intersects.features.length > 0) {
									crossesBoundary = true;
								}
							}
						})
					} else {
						e.layer.polygon.feature.geometry.coordinates.forEach(subarray => {
							let line1 = turf.lineString(subarray)
							let line2 = turf.lineString([polyLine.geometry.coordinates[0], [e.latlng["lng"], e.latlng["lat"]]])
							let intersects = turf.lineIntersect(line1, line2)
							if (hashLatLng(firstPointRef.current) === hashLatLng(polyLine.geometry.coordinates[0])) {
								if (intersects.features.length > 1) {
									crossesBoundary = true;
								}
							} else {
								if (intersects.features.length > 0) {
									crossesBoundary = true;
								}
							}
						})
					}
					if (crossesBoundary) {
						e.cancel();
					}
				}	
			})
			mapRef.current.on('editable:vertex:mouseover', function (e) {
				if (mapRef.current.editTools.drawing()) return
				// L.DomUtil.setOpacity(currentVertex._icon,1);
				let vertices = limitPointsRef.current || 5; // show  vertices before and next
				try {
					let list = e.vertex.getVertices(vertices);

					list.forEach((vertex)=> {
						L.DomUtil.setOpacity(vertex.__vertex._icon,1)
					})
				} catch {
					
				}
				
		
			})
			mapRef.current.on('editable:vertex:mouseout', function (e) {
				if (mapRef.current.editTools.drawing()) return

				// L.DomUtil.setOpacity(e.vertex._icon,0);
				let vertices = limitPoints || 5; // show  vertices before and next
				try {
					let list = e.vertex.getVertices(vertices);
					// L.DomUtil.setOpacity(currentVertex._icon,1);
					list.forEach((vertex)=> {
						L.DomUtil.setOpacity(vertex.__vertex._icon,0)
					})
				} catch {

				}
				
			})
		
		
		}
	}

	//Toggles Edit Mode
	const switchEditMode = () => {
		//Normal mode and cleanup
		if (editMode) {
			setEditMode(false)
			clearPolygons()
		//Edit mode and initialize behaviour for polygons
		} else {
			setEditMode(true) // forces rerender
			initializeMapFeatures()
		}
	}
	//Updates all vertexes and border vertexes
	const hashBorders = () => {
		//Handling shared borders
		setBorders(new Set())
		vertices = new Set()
		
		let polygons = getCurPolygons();
		
		polygons.forEach( (polygon, index) => {
			let newVertices = Object.values(polygon.editor.editLayer._layers).filter(object => object._opacity == null);
			newVertices.forEach(vertex => {
				vertex.feature = polygon.feature
				vertex.polygon = polygon
			})
			//Group all vertices
			const newVerticesGroup = newVertices.reduce((newVerticesGroup, item) => {
				const group = (newVerticesGroup[item.group] || []);
				group.push(item);
				newVerticesGroup[hashLatLng(item._latlng)] = group;
				return newVerticesGroup;
			}, {});

			//Store all vertices and recheck for possible broders
			setBorders(new Set())
			Object.keys(newVerticesGroup).forEach(key => {
				//If new vertex position is found
				if (vertices[key] == undefined) {
					vertices[key] = []
					vertices[key].push(...newVerticesGroup[key])
				//Vertex position already contained so its a border vertex
				} else {
					vertices[key].push(...newVerticesGroup[key])
				}
			})

			Object.keys(vertices).forEach(key => {
				if (vertices[key].length > 1) {
					bordersRef.current[key] = vertices[key]
				}
			})
		})
		

	}
	const handleMouseMove = (mouseEvent) => {
		let currentLatLng = mouseEvent.latlng;
		let target = mouseEvent.target;
		// let id = target._leaflet_id;
		let feature = target.feature;
		let geometryType = feature.geometry.type
		
		// let polygon = target.polygon;
		let latlngs;
		// let index = 0;
		if (geometryType === "MultiPolygon" ) {
			latlngs = target._latlngs.flat(2);
		}
		else {
			latlngs = target._latlngs[0];
		}
		let points = [...latlngs]
			.sort((pointA,pointB) => 
			pointA.distanceTo(currentLatLng) - pointB.distanceTo(currentLatLng))
 		// "Clean" the vertices opacity
		for (let i = 0; i < points.length; i++) {
			if (points[i].__vertex) {
				let html = points[i].__vertex._icon;
				L.DomUtil.setOpacity(html,0);
			}
			
			
		}
		points.filter((point)=> 
		point.distanceTo(currentLatLng) < maxDistance)

		for (let i = 0; i < limitPointsRef.current; i++) {
			if (i >= points.length) break;
			let html = points[i].__vertex._icon;
			L.DomUtil.setOpacity(html,1);
		}
	}
	const clearPolygonVertices = (tgt) => {
		let target = tgt;
		let feature = target.feature;
		let geometryType = feature.geometry.type
		
		let latlngs;
		if (geometryType === "MultiPolygon" ) {
			latlngs = target._latlngs.flat(2);
		}
		else {
			latlngs = target._latlngs[0];
		}
		let points = [...latlngs] 
		// "Clean" the vertices opacity
		for (let i = 0; i < points.length; i++) {
			if (points[i].__vertex) {
				let html = points[i].__vertex._icon;
				L.DomUtil.setOpacity(html,0);
			}
		}	
	}
	const handleMouseOut = (mouseEvent) => {
		if (splitModeRef.current) return;
		// Clean the previous region if any
		clearPolygonVertices(mouseEvent.target)

	}
	/* 
	 * Create a semi-unique identifier for every vertex
	 * If two vertices share the same unique identifier they are grouped together as border vertices
	*/
	const hashLatLng = (latlng) => {
		let precision = 10;
		if (latlng.lat) {
			return parseInt('' + (latlng.lat * precision)) / precision + "," + parseInt('' + (latlng.lng * precision)) / precision
		}
		else {
			return parseInt('' + (latlng[0] * precision)) / precision + "," + parseInt('' + (latlng[1] * precision)) / precision
		}
		
	}	

	
	//Create polygon on feature click
	const createPoly = (latlngs, feature) => {
		//Create Polygon
		let poly_coords = deepClone(latlngs);
		var polygon = L.polygon(poly_coords, {color: 'red'}).addTo(mapRef.current);
		polygon.properties = deepClone(feature.properties);
		polygon.feature = feature
		polygon.polygon = polygon
		polygon.isPolygon = true
		polygon.enableEdit()	
		polygon.on("mousemove",handleMouseMove)
		polygon.on("mouseout", handleMouseOut)
		hashBorders();
	}

	//Clear the map of all polygons
	const clearPolygons = () => {
		//Remove modified feature polygons
		let polygons = getCurPolygons()
		polygons.forEach((polygon) => {
			polygon.disableEdit()
			polygon.remove()
		})

		//Remove newly drawn features
		drawnLayers.forEach( layer => {
			layer.remove()
		})
		drawnLayers.clear();

		//Remove newly drawn to be saved features
		newFeatures.clear()

		//Removes all features that were edited from set
		selectedFeatures.clear()
	}

	const getCurPolygons = () => {
		let curPolygons = []
		Object.values(mapRef.current._layers).forEach( layer => {
			if (layer.isPolygon) {
				curPolygons.push(layer)
			}
		})
		return curPolygons
	}
	//Saves the new changes to the map
	const savePolygons = () => {
		//Saves the new modified polygons to the map
		let polygons = getCurPolygons();
		polygons.forEach( polygon => {
			if (data.mapData.includes(polygon.feature)) {
				let oldFeature = data.mapData[data.mapData.indexOf(polygon.feature)]
				let newFeature = L.polygon(polygon._latlngs).toGeoJSON() 
				newFeature.properties = deepClone(oldFeature.properties)
				data.mapData.splice(data.mapData.indexOf(polygon.feature), 1);
				data.mapData.push(newFeature)
			}
		})

		//Add new features to the map
		newFeatures.forEach( feature => {
			data.mapData.push(feature)
		})
		
		clearPolygons();
		setEditMode(false);
		_addToGeoJsonKey(geoJsonKey+1) // This forces rerender the geojson component
	}
	//Allow user to begin splitting a subregion
	const handleSplitFeature = () => {
		if (!splitModeRef.current) {
			mapRef.current.editTools.options["skipMiddleMarkers"] = true
			setSplitMode(true)
			initializeMapFeatures()
			let selectedCountries = Array.from(selectedLayers)
			createPoly(selectedCountries[0]._latlngs, selectedCountries[0].feature)
			selectedLayers.clear()
		} else {
			selectedLayers.clear();
			mapRef.current.editTools.options["skipMiddleMarkers"] = false
			setSplitMode(false)
			clearPolygons();
		}
	}

	//Split polygon between tow vertices
	const splitPolygon = (vertexOne, vertexTwo, splitLine) => {
		let oldMap = deepClone(data.mapData)

		
		//Need to re-order the vertices such that the index of the first vertex is less than the second
		let swapped = false
		if (vertexOne.polygonIndex > vertexTwo.polygonIndex) {
			[vertexOne, vertexTwo] = [vertexTwo, vertexOne]
			swapped = true
		}
	
		//Ready the boundary the user drew to be added to the new polgon
		splitLine._latlngs.shift()
		splitLine._latlngs.reverse()
		splitLine._latlngs.shift()
		if (!swapped) {
			splitLine._latlngs.reverse()
		}

		//Create a new region coordinates with the new user drawn boundary
		let leftCoordinates = null;
		if (vertexOne.polygon.feature.geometry.type == "MultiPolygon") {
			leftCoordinates = (vertexOne.polygon._latlngs[vertexOne.polygonIndexOne][0].slice(vertexOne.polygonIndex, vertexTwo.polygonIndex + 1)).concat(splitLine._latlngs).filter(object => object._opacity == null);
		} else {
			leftCoordinates = (vertexOne.polygon._latlngs[vertexOne.polygonIndexOne].slice(vertexOne.polygonIndex, vertexTwo.polygonIndex + 1)).concat(splitLine._latlngs).filter(object => object._opacity == null);

		}
		
		//Create the other half of the region that was split and save both to the map
		let newPolygon = L.polygon(leftCoordinates).toGeoJSON()
		var differenced = turf.difference(data.mapData[data.mapData.indexOf(vertexOne.polygon.feature)], newPolygon);
		data.mapData.splice(data.mapData.indexOf(vertexOne.polygon.feature), 1)
		data.mapData.push(newPolygon)
		data.mapData.push(differenced)
		newPolygon.properties = deepClone(differenced.properties)

		//Clean up to end split mode
		vertexOne.polygon.remove()
		splitLine.remove()
		setSplitMode(false)
		mapRef.current.editTools.options["skipMiddleMarkers"] = false
		selectedLayers.clear();
		setGeoJsonKey(Date.now())

		data.tps.addTransaction(oldMap, deepClone(data.mapData))
	}
	//Deleted selected features
	const deleteFeature = () => {
		//Delete all selected features
		let selectedCountries = Array.from(selectedLayers)
		if (selectedCountries.length >= data.mapData.length) {
			selectedLayers.clear()
			setGeoJsonKey(Date.now())
			return false;
		}
		else {
			let oldMap = deepClone(data.mapData)
			selectedCountries.forEach((layer)=> {
				if (data.mapData.includes(layer.feature))
					data.mapData.splice(data.mapData.indexOf(layer.feature), 1);
			})
			selectedLayers.clear()
			data.tps.addTransaction(oldMap, deepClone(data.mapData))
			_addToGeoJsonKey(geoJsonKey+1) // This forces rerender the geojson component
			return true;
		}
	}

	//Begin drawing a feature
	const createFeature = () => {
		if (editMode)
			editRef.current.startPolygon();
	}

	//Merge currently selected features
	const mergeFeatures = ( name ) => {
		if (name) {
			//Create a merged feature off of selected features and remove the old ones
			let oldMap = deepClone(data.mapData)
			let selectedCountries = Array.from(selectedLayers)
			let union = selectedCountries[0].feature
			selectedCountries.forEach((layer)=> {
				union = turf.union(union, layer.feature)
				if (data.mapData.includes(layer.feature))
					data.mapData.splice(data.mapData.indexOf(layer.feature), 1);
			})

			if (union.geometry.type === "Polygon") {
				union.geometry.coordinates = [union.geometry.coordinates[0]]
			}

			//Remove selected features and add new feature to map
			selectedLayers.clear()
			union.properties[data.nameLevel] = name;
			data.mapData.push(union);
			data.tps.addTransaction(oldMap, deepClone(data.mapData))
			_addToGeoJsonKey(geoJsonKey+1) // This forces rerender the geojson component

		}
	}

	//Renames current country
	const editCountryName = (name) => {
		if (name) {
			//Modify actual GeoJSON properties
			if (data.mapData.includes(layer.feature)) {
				let oldMap = deepClone(data.mapData)
				data.mapData[data.mapData.indexOf(layer.feature)].properties[data.nameLevel] = name
				data.tps.addTransaction(oldMap, deepClone(data.mapData))
				_addToGeoJsonKey(geoJsonKey+1)
			}
		}
	};

	//Handler for when a feature is clicked
	const handleFeatureClick = (event) => {
		if (splitModeRef.current)
			return;
		//Edit mode behaviour
		if (editModeRef.current) {
			if (!selectedFeatures.has(event.sourceTarget.feature)) {
				createPoly(event.sourceTarget._latlngs, event.sourceTarget.feature);
				selectedFeatures.add(event.sourceTarget.feature)
			}
		//Standard behaviour
		} else {
			const layer = event.sourceTarget;
			//Unhighlight
			if (selectedLayers.has(layer)) {
				selectedLayers.delete(layer);
				event.target.setStyle({
					color: "black",
					fillColor: "white",
					fillOpacity: 1,
				});
				//Highlight
			} else {
				event.target.setStyle({
					color: "green",
					fillColor: "#ffff34",
					fillOpacity: 1,
				});
				selectedLayers.add(layer);
			}
		}
	};

	//Initializes behaviour for each feature
	const onEachFeature = (feature, layer) => {
		//Create names for each region
		layer.bindTooltip("<span style='font-size: " + data.fontSize + "px'>" + layer.feature.properties[data.nameLevel] +"</span>",
			{
				className: "label",
				permanent: true,
				direction: "center",
				
			}
		).openTooltip();
		
		let tooltip = layer.getTooltip();
		tooltip._source.on('mouseover', () => {
			if (!editModeRef.current) {
				tooltip.setOpacity(0.3)

			}
		})
		tooltip._source.on('mouseout', () => {
			if (!editModeRef.current) {
				tooltip.setOpacity(1)

			}
		})

		
		//Handle click and double click behaviour for each region
		layer.on({
			click: handleFeatureClick,
			dblclick: openNameModal,
		});
	};

	//Handler for saving map
	const handleSaveMap = () => {
		let oldMap = deepClone(data.mapData)
		savePolygons();
		saveMap({id: id, mapData: data.mapData })
		//let bounds = mapRef.current.getBounds();

		setTimeout(() => {
			leafletImage(mapRef.current, function (err, canvas) {
				let src = canvas.toDataURL();
				updateThumbnail({ id: id, thumbnail: src });
			});
		}, 250);

		//mapRef.current.fitBounds(bounds)
		
		data.tps.addTransaction(oldMap, deepClone(data.mapData), "save")
	}
	const handleGeoJSONAdd = (layer) => {
		let x = 2;
	}
	function handleSliderChange(event,newValue) {
		_setLimitPoints(newValue);
	}
	
	function saveThumbnail() {
		let newFeatureGroup = L.featureGroup(Object.values(mapRef.current._layers))

		mapRef.current.fitBounds(newFeatureGroup.getBounds());

		
		mapRef.current.setView([
			(Object.values(newFeatureGroup.getBounds())[0].lat + Object.values(newFeatureGroup.getBounds())[1].lat) / 2,
			(Object.values(newFeatureGroup.getBounds())[0].lng + Object.values(newFeatureGroup.getBounds())[1].lng) / 2,
		]);

		setTimeout(() => {
			leafletImage(mapRef.current, function (err, canvas) {
				let src = canvas.toDataURL();
				updateThumbnail({ id: id, thumbnail: src });
			});
		}, 250);
	}

	function KeyPress(e) {
		var evtobj = window.event ? event : e;

		if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
			console.log("REDO")
			redo();
		} else if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
			console.log("UNDO")

			undo();
			
		}
	}

	const printCurPolygon = () => {
		let polygons = getCurPolygons();
		polygons.forEach( poly => {
			console.log("=====================")
			poly._latlngs[0].forEach( vert => {
				console.log(vert)
			})
		})  
	}
	

	let content = "";
	let undo;
	let redo;
	if (isLoading) {
		content = <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}> <CircularProgress size={100} /> </Box>
	} else if (isSuccess) {
		data.mapData["hash"] = 1
		undo = () => {
			if (!editModeRef.current && data.tps.hasTransactionToUndo()) {
				let delta = data.tps.undo().delta;		
				patcher.unpatch(data.mapData, delta);
				setGeoJsonKey(Date.now())
				selectedLayers.clear();
			} else {
				let delta = data.editTps.undo();
				if (delta) {
					if (!Array.isArray(delta.oldPolygon)) {
						let polygons = getCurPolygons();

						polygons.forEach( polygon => {
							if (polygon.feature == delta.oldPolygon.feature) {		
								polygon.removeEventListener("mousemove")
								polygon.removeEventListener("mouseout")				
								polygon.remove()
							}
						}) 
						let poly = clonePolygon(delta.oldPolygon, deepCloneLatLng(delta.oldPolygon._latlngs, delta.oldPolygon.feature.geometry.type))
						poly.addTo(mapRef.current)
						poly.enableEdit();
						hashBorders();
					} else {
						delta.oldPolygon.forEach( curPoly => {
							let polygons = getCurPolygons();

							polygons.forEach( polygon => {
								if (polygon.feature == curPoly.feature) {
									polygon.removeEventListener("mousemove")
									polygon.removeEventListener("mouseout")						
									polygon.remove()
								}
							}) 
							
							let poly = clonePolygon(curPoly, deepCloneLatLng(curPoly._latlngs, curPoly.feature.geometry.type))
							poly.addTo(mapRef.current)
							poly.enableEdit();
						})
						hashBorders();
					}

				}
				
			}
				
		}

		redo = () => {
			if (!editModeRef.current && data.tps.hasTransactionToRedo()) {
				let delta = data.tps.redo().delta;
				patcher.patch(data.mapData, delta);
				setGeoJsonKey(Date.now())
				selectedLayers.clear();
			} else {
				let delta = data.editTps.redo();
				if (delta) {
					if (!Array.isArray(delta.newPolygon)) {
						let polygons = getCurPolygons();
						polygons.forEach( polygon => {
							if (polygon.feature == delta.newPolygon.feature) {	
								polygon.removeEventListener("mousemove")
								polygon.removeEventListener("mouseout")					
								polygon.remove()
							}
						}) 
						let poly = clonePolygon(delta.newPolygon, deepCloneLatLng(delta.newPolygon._latlngs, delta.newPolygon.feature.geometry.type))
						poly.addTo(mapRef.current)
						poly.enableEdit();
						hashBorders();
					} else {
						delta.newPolygon.forEach( curPoly => {
							console.log(curPoly)
							let polygons = getCurPolygons();
							polygons.forEach( polygon => {
								if (polygon.feature == curPoly.feature) {	
									polygon.removeEventListener("mousemove")
									polygon.removeEventListener("mouseout")					
									polygon.remove()
								}
							}) 
							let poly = clonePolygon(curPoly, deepCloneLatLng(curPoly._latlngs, curPoly.feature.geometry.type))
							poly.addTo(mapRef.current)
							poly.enableEdit();
						})
						hashBorders();
					}
					// printCurPolygon()

				}
			}
			
		}

		content = (
		<>
			<EditBanner mapId={id} handleSliderChange={handleSliderChange} editMode={editMode}/>
		
			<NameRegionModal open={open} handleClose={close} setName={editCountryName} />
			<Box>
				<EditBar
					splitMode={splitMode}
					editMode={editMode}
					toggleEditMode={switchEditMode}
					mergeFeatures={mergeFeatures}
					selectedLayers={selectedLayers}
					handleSaveMap={handleSaveMap}
					handleDelete={deleteFeature}
					handleCreate={createFeature}
					handleSplitFeature={handleSplitFeature}
					undo={undo}
					redo={redo}
					mapData={data.mapData}
				/>

				<ReactLeafletEditable ref={editRef} map={mapRef.current}>
					<MapContainer
						attributionControl={false}
						zoomControl={false}
						boxZoom={false}
						editable={true}
						preferCanvas={true}
						doubleClickZoom={false}
						ref={mapRef}
						style={{ height: "93vh" }}
						>
						<GeoJSON
							key={geoJsonKey}
							style={countryStyle}
							data={data.mapData}
							onEachFeature={onEachFeature}
							ref={geoJsonRef}
							onAdd={handleGeoJSONAdd}
						/>
					</MapContainer>
				</ReactLeafletEditable>
			</Box>
			<div id="tempmap" hidden></div>
		</>
		)

		if (firstLoad && mapRef.current) {
			setFirstLoad(false)
			saveThumbnail();
			window.onkeydown = KeyPress;
		}
	}

	return (
		<>
			{content}
		</>
	);
}
