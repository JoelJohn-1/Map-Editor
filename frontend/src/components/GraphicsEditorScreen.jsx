import { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import GraphicsBanner from "./GraphicsBanner";

import { useQuery } from "react-query";
import { loadGraphic, saveGraphic } from "../api/map";
import Select from "react-select";

import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet-editable";
import zIndex from "@mui/material/styles/zIndex";
import "./GraphicalEditor.css"
// import ReactLeafletEditabl from 'react-leaflet-editable';
// const ReactLeafletEditable = ReactLeafletEditabl.default? ReactLeafletEditabl.default : ReactLeafletEditabl
import {SimpleMapScreenshoter} from 'leaflet-simple-map-screenshoter'

import * as jsondiffpatch from 'jsondiffpatch'
let patcher = jsondiffpatch.create({
	objectHash: function (obj) {
		return obj.hash;
	}
});
export default function GraphicsEditorScreen() {
	L.ClickableTooltip = L.Tooltip.extend({
		onAdd: function (map) {
			L.Tooltip.prototype.onAdd.call(this, map);
	
			var el = this.getElement(),
				self = this;
	
			el.addEventListener('click', function() {
				self.fire("click");
			});
			el.style.pointerEvents = 'auto';
		}
	});

	const [alert, setAlert] = useState(false)
	const [alertMessage, setAlertMessage] = useState("")
	const [alertSeverity, setAlertSeverity] = useState("success")
	
	const { id } = useParams();
	const [ firstLoad, setFirstLoad ] = useState(true)

	const [currentFillColor, _setCurrentFillColor] = useState("#FFFFFF");
	const currentFillColorRef = useRef(currentFillColor)
	const setCurrentFillColor = (data) => {
		currentFillColorRef.current = data
		_setCurrentFillColor(data);
	}

	const [backgroundColor, _setBackgroundColor] = useState('#dddddd')
	const backgroundColorRef = useRef(backgroundColor)
	const setBackgroundColor = (data) => {
		backgroundColorRef.current = data
		_setBackgroundColor(data);
	}
	const [fillInside, _setFillInside] = useState(true)
	const fillInsideRef = useRef(fillInside)
	const setFillInside = (alignment) => {
		if (alignment == "nofill") {
			fillInsideRef.current = false
			_setFillInside(false)
		} else {
			fillInsideRef.current = true
			_setFillInside(true)
		}
	}
	
	//Currently selected marker
	const [currentMarker, _setCurrentMarker] = useState(null)
	const currentMarkerRef = useRef(currentMarker) 
	const setCurrentMarker = (data) => {
		currentMarkerRef.current = data
		_setCurrentMarker(data)
	}	

	//Current font size from select menu
	const [currentFontSize, _setCurrentFontSize] = useState("15pt")
	const currentFontSizeRef = useRef(currentFontSize)
	const setCurrentFontSize = (data) => {
		currentFontSizeRef.current = data
		_setCurrentFontSize(data);
	}

	//Current font from select menu
	const [currentFont, _setCurrentFont] = useState("Times New Roman") 
	const currentFontRef = useRef(currentFont)
	const setCurrentFont = (data) => {
		currentFontRef.current = data
		_setCurrentFont(data)
	}

	const [textColor, _setTextColor] = useState("black")
	const textColorRef = useRef(textColor);
	const setTextColor = (data) => {
		textColorRef.current = data;
		_setTextColor(data)
	}

	const [oldTextPositions, _setOldTextPositions] = useState(null)
	const oldTextPositionsRef = useRef(oldTextPositions) 
	const setOldTextPositions = (data) => {
		let clonedDate = deepClone(data)
		oldTextPositionsRef.current = clonedDate;
		_setOldTextPositions(clonedDate)
	}

	const [oldLegend, _setOldLegend] = useState(null)
	const oldLegendRef = useRef(oldLegend) 
	const setOldLegend = (data) => {
		let clonedDate = deepClone(data)
		oldLegendRef.current = clonedDate;
		_setOldLegend(clonedDate)
	}

	
	
	const [oldMap, _setOldMap] = useState(null)
	const oldMapRef = useRef(oldMap)
	const setOldMap = (data) => {
		let clonedData = deepClone(data)
		oldMapRef.current = clonedData;
		_setOldMap(clonedData)
	}

	


	const { isLoading, isSuccess, data } = useQuery("map", async () => loadGraphic({ id: id }), { enabled: true, cacheTime: 0 });

	//Ref for editor container
	const editRef = useRef();

	//Ref for current map and current geojson
	const mapRef = useRef();
	const geoJsonRef = useRef();

	const screenshotter = useRef();


	
	//Rerender Map
	const [geoJsonKey, _addToGeoJsonKey] = useState(1);
	const geoJsonKeyRef = useRef(geoJsonKey);
	const setGeoJsonKey = (data) => {
		geoJsonKeyRef.current = data;
		_addToGeoJsonKey(data);
	};


	// Updates the map data whenever data is changed from either this component or other component with help of react-query
	useEffect(() => {
		if (data) {
			_addToGeoJsonKey(geoJsonKey + 1)
			// little slow for update for some reason 
		}
		const handleEsc = (event) => {
			if (event.keyCode === 27) {
				closeMarkersEditing()
		   }
		 };
		 window.addEventListener('keydown', handleEsc);    return () => {
		   window.removeEventListener('keydown', handleEsc);
		 };

	}, [data])

	function exportAsImage() {
		screenshotter.current
			.takeScreen("image", { mimeType: "image/png" })
			.then((dataUrl) => {
				let link = document.createElement("a");
				link.download = "image.png";
				link.href = dataUrl;
				link.click();
			});
	}

	function KeyPress(e) {
		var evtobj = window.event? event : e
		
		if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
			redo();
		} else if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
			undo();
		}
  }
  
  	document.onkeydown = KeyPress;

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

	function dec2hex (dec) {
		return dec.toString(16).padStart(2, "0")
	  }

	function generateId (len) {
		var arr = new Uint8Array((len || 40) / 2)
		window.crypto.getRandomValues(arr)
		return Array.from(arr, dec2hex).join('')
	  }

	//Handler for when a feature is clicked
	const handleFeatureClick = (event) => {
		setOldMap(data.mapData);
		if (event.originalEvent.ctrlKey) {
			return;
		}

		const layer = event.sourceTarget; 
		if (!fillInsideRef.current) {
			event.target.setStyle({
				color: currentFillColorRef.current.slice(),
				fillOpacity: 1,
			});
			data.mapData[data.mapData.indexOf(layer.feature)].properties["borderColor"] = currentFillColorRef.current.slice();
			data.graphicalTps.addTransaction(deepClone(oldMapRef.current), deepClone(data.mapData), (oldLegendRef.current), (data.legend), (oldTextPositionsRef.current), (data.textPositions), "borderChange");
		} else {
			event.target.setStyle({
				fillColor: currentFillColorRef.current.slice(),
				fillOpacity: 1,
			});
			
			data.mapData[data.mapData.indexOf(layer.feature)].properties["fillColor"] = currentFillColorRef.current.slice();
			loadLegend("")

		}
		event.target.bringToFront();

	};

	//Initializes behaviour for each feature
	const onEachFeature = (feature, layer) => {
		//Create names for each region

		if (layer.feature.properties.fillColor) {
			layer.setStyle({
				fillColor: layer.feature.properties.fillColor,
				fillOpacity: 1,
			})
		} else {
			layer.setStyle({
				fillColor: "#FFFFFF",
				fillOpacity: 1,
			})
		}
		if (layer.feature.properties.borderColor) {
			layer.setStyle({
				color: layer.feature.properties.borderColor,
				fillOpacity: 1,
			})
		} else {
			layer.setStyle({
				color: "#000000",
				fillOpacity: 1,
			})
		}
		//Handle click and double click behaviour for each region
		layer.on({
			click: handleFeatureClick,
		});
	};

	//Updates the currently selected markers font size if any and the currently selected font size
	let updateCurrentMarkerSize = (value) => {
		setCurrentFontSize(value.target.value)
		if (currentMarkerRef.current) {
			currentMarkerRef.current.div.style.fontSize = currentFontSizeRef.current
			updateTextPositions(currentMarkerRef.current, "")

		}
	}

	
	//Updates the currently selected markers font if any and the currently selected font, not sure why its working, think its cause of some css bs with how a font is actually defined
	let updateCurrentMarkerFont= (value) => {
		setCurrentFont(value.target.value)
		if (currentMarkerRef.current) {
			currentMarkerRef.current.div.style.fontFamily = currentFontRef.current
			updateTextPositions(currentMarkerRef.current, "")
		}
	}

	const updateLegend = (color, text, type, lastBatch) => {
		let legendItemRepresentaiton = [color, text];
		let found = false;
		
		data.legend.forEach((legendItem, index) => {
			if (legendItem[0] === color) {
				data.legend[index] = (legendItemRepresentaiton);
				found = true;
			}
		}) 
		if (!found) {
			data.legend.push(legendItemRepresentaiton);
		}
		if (type !== "initialize" && type !== "undo" && type !=="redo" && lastBatch) {
			data.graphicalTps.addTransaction(deepClone(oldMapRef.current), deepClone(data.mapData), deepClone(oldLegendRef.current), deepClone(data.legend), deepClone(oldTextPositionsRef.current), deepClone(data.textPositions), "legendChange");
			setOldLegend(data.legend);
		}
		

	}


	// //Returns true if the two text positions arrays are the same, false otherwise
	// const compareTextPositions = (textPos1, textPos2) => {
	// 	if (textPos1.length != textPos2.length) {
	// 		return false
	// 	}
	// 	let difference = false;
	// 	for (let i = 0; i < textPos1.length; i++) {
	// 		console.log(textPos1[0])
			
	// 		if (textPos1[0][i][0] !== textPos2[0][i][0]) {
	// 			return false
	// 		}
	// 		if (textPos1[0][i][1] !== textPos2[0][i][1]) {
	// 			return false
	// 		}

	// 		let curTextProperties = textPos1[0][i][2];
	// 		if (curTextProperties[0] !==curTextProperties[0] || curTextProperties[1] !== curTextProperties[1]
	// 			|| curTextProperties[2] !== curTextProperties[2] || curTextProperties[3] !== curTextProperties[3]) {
	// 			return false
	// 		}
	// 	}

	// 	return true;
	// }

	
	//Adds marker to database
	const updateTextPositions = (marker, type) => {
		if (!marker._icon) {
			return ;
		}
		let style = marker._icon.firstChild.style
		//Marker will be represented by an array that follows: ["Identifier", [Text, Size, FontFamily], latlng]
		let markerRepresentation = {0: marker.uniqueHash, 1: marker._latlng.toString(), 2: {0: marker.text + "", 1: style.fontSize, 2: style.fontFamily, 3: style.color}}
		let found = false
		data.textPositions.forEach( (markerArray, index) => {
			//markerArray = markerArray[0]
			if (markerArray[0] === marker.uniqueHash ) {
				if (marker.toDelete) {
					data.textPositions.splice(index, 1)
					found = true;
				} else {
					data.textPositions[index] = (markerRepresentation);
					found = true;
				}
			}
		}) 
		if (!found) {
			data.textPositions.push(markerRepresentation);
		}
		if (type !== "initialize" ) {
			data.graphicalTps.addTransaction(oldMapRef.current, deepClone(data.mapData), deepClone(oldLegendRef.current), deepClone(data.legend), deepClone(oldTextPositionsRef.current), deepClone(data.textPositions), "textChange");
			setOldTextPositions(data.textPositions);
		}
		
		setOldTextPositions(data.textPositions);
	}

	//Sets a markers new text after user finishes editing it
	let setMarker = (marker, text, option) => {
		var newText = document.createElement("div");
		newText.innerHTML = text + "";
		if (option !== "dontUpdateStyle") {
			newText.style.fontSize = currentFontSizeRef.current;
			newText.style.fontFamily = currentFontRef.current;
			newText.style.color = textColorRef.current;
		} else {
			console.log(marker)
			newText.style.fontSize = marker.oldFontSize;
			newText.style.fontFamily = marker.oldFontFamily;
			newText.style.color =  marker.oldColor;
		}
 		
		newText.style.width = "max-content";
		newText.style.height = "max-content"
		var myDivIcon = new L.divIcon(
		{
			className: 'my-div-icon',
			html: newText
		});
		marker.text = text + "";
		marker.setIcon(myDivIcon)
		marker.div = newText;
		marker.dragging.enable();
		marker.editing = false;	

		updateTextPositions(marker, "")
	}

	//When user finishes typing and click enters, update the marker
	let updateText = (e, marker, input) => {
		if (e.keyCode == 13) {
			setMarker(marker, input.value, "")
		}
	}

	//Gets the list of all current markers on the map
	let getCurrentMarkers = (e) => {
		let markerArray = []
		Object.values(mapRef.current._targets).forEach(item => {
			if (item.isMarker) {
				markerArray.push(item)
			}
		})
		return markerArray
	}

	//Unselects all markers
	let unselectMarker = (e) => {
		let markers = getCurrentMarkers();
		markers.forEach( marker => {
			if (marker.div) {
				marker.div.style.borderStyle = 'none'
			}
		})
		setCurrentMarker(null)
	}

	//Closer all input forms for any marker
	let closeMarkersEditing = (e) => {
		let markersArray = getCurrentMarkers();
		markersArray.forEach( marker => {
			if (marker.editing) {
				setMarker(marker, marker.text, "dontUpdateStyle")

			}
		})
	}

	//Returns wether or not a marker is currently being edited with the marker that is being edited if so
	let markerBeingEdited = () => {
		let beingEdited = false
		let marker = null;
		Object.values(mapRef.current._targets).forEach(item => {
			if (item.isMarker) {
				if (item.editing) {
					beingEdited = true;
					marker = item;
				}
			}
		})
		return [beingEdited, marker]
	}

	let handleCloseAll = () => {
		closeMarkersEditing();
		unselectMarker();
	}

	//Allow user to create marker by ctrl-clicking anywhere on map
	let createText = (e) => {
		//Handles normal clicking behaviour
		closeMarkersEditing();
		unselectMarker();
		
		//Handles creating the intial input form to create marker
		var input = document.createElement("input");
		input.onkeypress = function (event) {
			updateText(event, newMarker, input)
		};
		input.style.border = 'none'
		input.style.opacity = '50%'
		var initialDiv = new L.divIcon(
		{
			className: 'my-div-icon',
			html: input
		});
		var newMarker = new L.marker(e.latlng, {
			icon : initialDiv,
			draggable: true,
		});

		
		newMarker.addTo(mapRef.current)
		newMarker.dragging.disable();
		newMarker.editing = true
		newMarker.text = ""
		newMarker.isMarker = true
		newMarker.uniqueHash = generateId();
		//Handles when a marker is click
		handleInitializeMarkerBehaviour(newMarker)
	}

	const handleInitializeMarkerBehaviour = (newMarker) => {
		newMarker.on('click', function (e) {
			unselectMarker();
			//Selects marker
			if (!markerBeingEdited()[0]) {
				setCurrentMarker(newMarker)
				newMarker.div.style.borderStyle = 'solid'
				newMarker.div.style.borderColor = '#add8e6'
				newMarker.div.style.borderRadius = "10px"
			}
			//Delete marker
			if (e.originalEvent.shiftKey) {
				newMarker.toDelete = true
				updateTextPositions(newMarker, "")
				newMarker.remove()

			}
		})

		//Handles when a marker is double clicked, if allowed itll open up a input to allow it to be changed
		newMarker.on('dblclick', function (e) {
			if (newMarker.div) {
				newMarker.oldColor = newMarker.div.style.color
				newMarker.oldFontSize = newMarker.div.style.fontSize
				newMarker.oldFontFamily = newMarker.div.style.fontFamily
			}
			
			unselectMarker();
			if (markerBeingEdited()[0] && markerBeingEdited()[1] != newMarker) {
				closeMarkersEditing()
			}

			if (!newMarker.editing) {
				newMarker.dragging.disable();
				newMarker.editing = true
				

				var input = document.createElement("input");
				input.className = "input-box"
				input.value = newMarker.text
				input.style.border = 'none'
				input.style.opacity = '50%'
				
				input.id = "marker" + e.latlng
				input.onkeypress = function (event) {
					updateText(event, newMarker, input)
				};
				var newDiv = new L.divIcon(
				{
					className: 'my-div-icon',
					html: input
				});
				newMarker.setIcon(newDiv)
				newMarker.divIcon = newDiv;

			}
		})

		newMarker.on('dragend', function (e) {
			updateTextPositions(newMarker, "");
		})	
	}
	//Filler for when database is finished, should return the associated name for the color
	let getLegendName = (color) => {
		let returnValue = color + ""
		data.legend.forEach((legendItem, index) => {
			if (legendItem[0] == color) {
				returnValue = legendItem[1] + "";
			}
		}) 
		
		return returnValue
	}
	
	//Sets current color to the color of the legend item clicked
	const handleLegendClick = (event) => {
		event.stopPropagation();
		setCurrentFillColor(event.target.id);
	}
	
	const handleUpdateTextLegend = (event) => {
		if (event.keyCode === 13 ) {
			let color = event.target.id.substring(0, event.target.id.indexOf("-"))
			let newText = event.target.value
			updateLegend(color, newText, "", true)
		}
	}

	//Loads a legend on inital load and anytime a color is added/removed
	const loadLegend = (initialize) => {
		//Gets rid of current legend if there is one
		if (mapRef.current._controlCorners.bottomright.children[0]) {
			mapRef.current._controlCorners.bottomright.children[0].remove()
		}

		//Get colors from current map, which is stored in each features properties
		let colors = new Set()
		data.mapData.forEach( feature => {
			if (feature.properties.fillColor) {
				colors.add(feature.properties.fillColor)
			}
		})
		let colorsArray = Array.from(colors)
		let namesArray = []
		//Create legend
		var legend = L.control({position: 'bottomright'})
	

		legend.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			for (var i = 0; i < colorsArray.length; i++) {
				namesArray.push(getLegendName(colorsArray[i]) + "")
				
				div.innerHTML +=
					'<i id="' + colorsArray[i] + '"style="background:'+ colorsArray[i] + '"></i> <input value="' + getLegendName(colorsArray[i]) + '"id="' + colorsArray[i] + '-label">' + 
					  '</input><br>' ;
			}
			return div;
		};
		

		
		//Add legend to map
		legend.isLegend = true
		legend.addTo(mapRef.current)
		
		let lastBatch = false;

		//Allows user to click on legend items to set current color
		for (var i = 0; i < colorsArray.length; i++) {
			let colorItem = document.getElementById(colorsArray[i])
			colorItem.onclick = function(e){
				handleLegendClick(e);
			};
			let colorLabel = document.getElementById(colorsArray[i] +"-label")
			colorLabel.style.background = "transparent"
			colorLabel.style.border = "none"
			colorLabel.style.width = "150px"
			colorLabel.onkeydown = function(e){
				if (e.keyCode === 13) {
					handleUpdateTextLegend(e);
				}
			}
			if (i === colorsArray.length - 1) {
				lastBatch = true
			}
			updateLegend(colorsArray[i], namesArray[i], initialize, lastBatch)
		}
		
	}

	const loadMarkers = () => {
		data.textPositions.forEach( item => {
			//item = item[0]
			let lat = item[1].substring(item[1].indexOf("(") + 1, item[1].indexOf(","))
			let lng = item[1].substring(item[1].indexOf(",") + 2, item[1].indexOf(")"))
			var marker = new L.marker([lat, lng]);
			var newText = document.createElement("div");
			newText.innerHTML = item[2][0];
			newText.style.fontSize = item[2][1];
			newText.style.fontFamily = item[2][2];
			newText.style.color = item[2][3]
			newText.style.width = "max-content";
			newText.style.height = "max-content"
			var myDivIcon = new L.divIcon(
			{
				className: 'my-div-icon',
				html: newText,
			});
			marker.text = item[2][0];
			marker.setIcon(myDivIcon)
			marker.div = newText;
			marker.addTo(mapRef.current)
			marker.dragging.enable();
			marker.editing = false;	
			marker.isMarker = true
			marker.uniqueHash = item[0]
			handleInitializeMarkerBehaviour(marker)
			updateTextPositions(marker, "initialize")

		})
	}

	const clearMarkers = () => {
		let markers = getCurrentMarkers();
		markers.forEach(marker => {
			marker.remove();
		})
	}
	//Set values for fontsize-menu
	const fontSizeOptions = [
		{ label: "15pt", value: '15pt' },
		{ label: "17pt", value: '17pt' },
		{ label: "19pt", value: '19pt' },
		{ label: "21pt", value: '21pt' },
		{ label: "23pt", value: '23pt' },
		{ label: "25pt", value: '25pt' },
		{ label: "27pt", value: '27pt' },
		{ label: "29pt", value: '29pt' },
		{ label: "31pt", value: '31pt' },
	];
	//Set style for fontsize-menu (no idea how it works i just yoinked it)
	const fontSizeStyles = {
		control: base => ({
		...base,
		fontFamily: "Times New Roman"
		}),
		menu: base => ({
		...base,
		fontFamily: "Times New Roman"
		})
	};

	//Set values for font-menu
	const fontOptions = [
		{ label: "Helvetica", value: 'Helvetica' },
		{ label: "Garamond", value: 'Garamond' },
		{ label: "Futura", value: 'Futura' },
		{ label: "Bodoni", value: 'Bodoni' },
		{ label: "Arial", value: 'Arial' },
		{ label: "Times New Roman", value: 'Times New Roman' },
		{ label: "Verdana", value: 'Verdana' },
		{ label: "Rockwell", value: 'Rockwell' },
		{ label: "Franklin Gothic", value: 'Franklin Gothic' },
		{ label: "Univers", value: 'Univers' },
		{ label: "Frutiger", value: 'Frutiger' },
		{ label: "Avenir", value: 'Avenir' },

	];
	//Set style for fontsize-menu (no idea how it works i just yoinked it)
	const fontStyles = {
		control: base => ({
		...base,
		fontFamily: "Times New Roman"
		}),
		menu: base => ({
		...base,
		fontFamily: "Times New Roman"
		})
	};

	
	const setLeafletBackground = (color) => {
		var container = document.getElementById('my-map-container');
		container.style.background = color
		setBackgroundColor(color)
		data.backgroundColor = color;
		
	}

	const handleSetTextColor = (color) => {
		setTextColor(color)
		if (currentMarkerRef.current) {
			currentMarkerRef.current.div.style.color = textColorRef.current
			updateTextPositions(currentMarkerRef.current, "");

		}

	}

	function saveMap() {
		saveGraphic({id: id, mapData: data.mapData, legend: data.legend, textPositions: data.textPositions, backgroundColor: data.backgroundColor })
		setAlertMessage("Map saved!")
		setAlert(true)
		setAlertSeverity("success")
	}

	let content = "";
	let undo;
	let redo;
	if (isLoading) {
		content = <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}> <CircularProgress size={100} /> </Box>
	} else if (isSuccess) {
		undo = () => {
			let deltas = data.graphicalTps.undo();
			if (deltas) {
				if (deltas.type === "legendChange") {
					jsondiffpatch.unpatch(data.legend, deltas.delta2);
					jsondiffpatch.unpatch(data.mapData, deltas.delta1)
					_addToGeoJsonKey(geoJsonKey+1)
					loadLegend("undo");

				} else if (deltas.type === "textChange") {
					jsondiffpatch.unpatch(data.textPositions, deltas.delta3)
					//data.textPositions = deepClone(deltas.oldTextPositions);
					clearMarkers();
					loadMarkers();
				} else {
					jsondiffpatch.unpatch(data.mapData, deltas.delta1)
					_addToGeoJsonKey(geoJsonKey+1)
				}
			}		
		}

		redo = () => {
			let deltas = data.graphicalTps.redo();
			if (deltas) {
				if (deltas.type === "legendChange") {
					jsondiffpatch.patch(data.legend, deltas.delta2);
					jsondiffpatch.patch(data.mapData, deltas.delta1)
					_addToGeoJsonKey(geoJsonKey+1)
					loadLegend("redo");

				} else if (deltas.type === "textChange") {
					jsondiffpatch.patch(data.textPositions, deltas.delta3)
					//data.textPositions = deepClone(deltas.newTextPositions);
					clearMarkers();
					loadMarkers();
					

				} else {
					jsondiffpatch.patch(data.mapData, deltas.delta1)
					_addToGeoJsonKey(geoJsonKey+1)
				}
			}
		}

		content = (
			<>
				<GraphicsBanner
					mapId={id}
					setCurrentFillColor={setCurrentFillColor}
					setFillInside={setFillInside}
					setLeafletBackground={setLeafletBackground}
					handleSetTextColor={handleSetTextColor}
					backgroundColor={backgroundColor}
					fillInside={fillInside}
					currentFontSize={currentFontSize}
					currentFont={currentFont}
					updateCurrentMarkerSize={updateCurrentMarkerSize}
					updateCurrentMarkerFont={updateCurrentMarkerFont}
					textColor={textColor}
					exportAsImage={exportAsImage}
					saveMap={saveMap}
					currentFillColor={currentFillColor}
				/>
				<Box>
					<MapContainer
							id="my-map-container"
							attributionControl={false}
							zoomControl={false}
							boxZoom={false}
							editable={true}
							preferCanvas={true}
							doubleClickZoom={false}
							ref={mapRef}
							style={{ height: "93vh", zIndex: 0 }}
							zoom={2}
							center={[50, -50]}
						>
							<GeoJSON
								key={geoJsonKey}
								data={data.mapData}
								onEachFeature={onEachFeature}
								ref={geoJsonRef}
							/>
					</MapContainer>
					<Snackbar
						open={alert}
						onClose={() => setAlert(false)}
						anchorOrigin={{ vertical: "top", horizontal: "center" }}
						autoHideDuration={3000}
					>
						<Alert severity={alertSeverity}> {alertMessage} </Alert>
					</Snackbar>
				</Box>
			</>
		);


		if (firstLoad && mapRef.current && geoJsonRef.current) {

			let newFeatureGroup = L.featureGroup(Object.values(geoJsonRef.current._layers))
			mapRef.current.fitBounds(newFeatureGroup.getBounds())

			loadLegend("initialize");
			loadMarkers();
			setFirstLoad(false)
			setOldLegend(data.legend)
			setOldTextPositions(data.textPositions);
			setOldMap(data.mapData)
			if (data.backgroundColor)
				setLeafletBackground(data.backgroundColor);
			mapRef.current.on('dblclick', createText)
			mapRef.current.on('click', handleCloseAll)
			
			screenshotter.current = L.simpleMapScreenshoter({ hidden: true }).addTo(mapRef.current);
		}

	}

	return (
		<>
			{content}
		</>
	);
}