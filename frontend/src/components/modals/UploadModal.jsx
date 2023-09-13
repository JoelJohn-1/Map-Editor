import { Button, Divider, IconButton } from "@mui/material";
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";
import { Close } from "@mui/icons-material";
import { UploadFile } from "@mui/icons-material";
import { read } from 'shapefile';
import { useMutation, useQueryClient } from "react-query"
import { addMap } from "../../api/map";
import * as topojsonclient from "topojson-client";
import * as topojsonserver from "topojson-server"
import * as topojsonsimplify from "topojson-simplify"
import { useNavigate } from "react-router-dom";

export default function UploadModal(props) {
	
	const { open, handleClose } = props;
	const navigate = useNavigate();
	const queryClient = useQueryClient()
	const getSizeInBytes = obj => {
		let str = null;
		if (typeof obj === 'string') {
		  // If obj is a string, then use it
		  str = obj;
		} else {
		  // Else, make obj into a string
		  str = JSON.stringify(obj);
		}
		// Get the length of the Uint8Array
		const bytes = new TextEncoder().encode(str).length;
		return bytes;
	  };

	const simplifyJSON = (json) => {
		let roundedJSON = JSON.parse(JSON.stringify(json, function (key, val) {
			if (typeof val == 'number' && val % 1 !== 0) {
				val = val.toString()
				let pointIndex = val.indexOf(".")
				val = Number(val.substring(0, pointIndex) + val.substring(pointIndex, pointIndex + 5))
				return val
			}
				
			return val;
		}))

		if (getSizeInBytes(roundedJSON) > 10000) {
			var topology = topojsonserver.topology({foo: roundedJSON});
			topology= topojsonsimplify.simplify(topojsonsimplify.presimplify(topology), 0.05)
			roundedJSON = topojsonclient.feature(topology,topology.objects.foo);
		}

		return roundedJSON;

	}
	const addMapMutation = useMutation(addMap, {
        onSuccess: (data) => {
            queryClient.invalidateQueries("maplist")
			navigate("/map/" + data.data.id);
        }
    })

	async function handleUploadSHPDBF(event) {
		const shpReader = new FileReader();
		const dbfReader = new FileReader();

		let shpFile = null;
		let dbfFile = null;
		let shpBuffer = null;

		if (event.target.files[0].name.endsWith(".shp")) {
			shpFile = event.target.files[0];
			dbfFile = event.target.files[1];
		} else {
			shpFile = event.target.files[1];
			dbfFile = event.target.files[0];
		}

		shpReader.readAsArrayBuffer(shpFile, "UTF-8");
		shpReader.onload = e => {
			shpBuffer = e.target.result;
			
			dbfReader.readAsArrayBuffer(dbfFile, "UTF-8");
			dbfReader.onload = async e => {
				let data = await read(shpBuffer, e.target.result)
				data = simplifyJSON(data)
				addMapMutation.mutate({ type: data.type, features: data.features })
				handleClose();
			}
		}
	}

	function handleUploadGeoJSON(event) {
		const fileReader = new FileReader();
		fileReader.readAsText(event.target.files[0], "UTF-8");
		fileReader.onload = async (e) => {
			let loadedJSON = simplifyJSON(JSON.parse(e.target.result));
			addMapMutation.mutate({ type: loadedJSON.type, features: loadedJSON.features })
			handleClose();
		};
	}

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth={true}
			maxWidth="sm"
			PaperProps={{
				style: {
					borderRadius: "7px",
					outline: "0px solid #2F2F2F",
				},
			}}>
			<DialogTitle>
				<IconButton
					onClick={handleClose}
					id="close-button"
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: "gray",
					}}>
					<Close />
				</IconButton>
			</DialogTitle>
			<DialogContentText></DialogContentText>
			<DialogContent>
				<Grid container>
					<Grid
						item
						xs
						sx={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							marginBottom: "40px",
						}}>
						<Box sx={{ marginBottom: "40px", fontSize: "15pt" }}>
							Upload a SHP and DBF file
						</Box>
						<Button
							id="upload-shp-dbf"
							variant="outlined"
							size="large"
							component="label">
							<UploadFile />
							Upload SHP/DBF
							<input type="file" hidden multiple accept=".shp,.dbf" onChange={handleUploadSHPDBF} />
						</Button>
					</Grid>
					<Divider orientation="vertical" flexItem>
						OR
					</Divider>
					<Grid
						item
						xs
						sx={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							marginBottom: "40px",
						}}>
						<Box sx={{ marginBottom: "40px", fontSize: "15pt" }}>
							Upload a GeoJSON file
						</Box>
						<Button
							variant="outlined"
							size="large"
							component="label">
							<UploadFile />
							Upload GeoJSON
							<input type="file" hidden accept=".json" onChange={handleUploadGeoJSON} />
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
}
