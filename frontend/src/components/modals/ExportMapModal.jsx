import { TextField, Button, Stack, Divider, IconButton, Typography } from "@mui/material";
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";
import { Close } from "@mui/icons-material";
import mapApi from "../../api/map"
import { useParams } from 'react-router-dom';

export default function ExportMapModal(props) {
	const { open, handleClose } = props;
	const { id } = useParams();

	async function handleSubmit(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
	}
	async function handleExportGeoJSON(event) {
	
		const mapId = id // placeholder
		const fileName = "Map.geo.json"
		const mimeType = "application/json" 

		const response = await mapApi.post("exportmap", {
			id: mapId,
			geojson: true
		});
		const data = response.data;
		const mapData = {
			type: data.data.type,
			features: data.data.features
		}
		let geoJSON = L.geoJSON(mapData).toGeoJSON();
		geoJSON = JSON.stringify(geoJSON);
		const blob = new Blob([geoJSON], { type: mimeType })
		const url = window.URL.createObjectURL(blob);
		const downloadLink = document.createElement('a');
		downloadLink.href = url;
		downloadLink.download = fileName
		downloadLink.click();
		window.URL.revokeObjectURL(url);
	}
	async function handleExportShape(event) {
	
		const mapId = id
		const fileName = "Untitled.zip"
		const response = await mapApi.post("exportmap", {
			id: mapId,
			geojson: false
		}, {responseType: 'arraybuffer'}); // must be arraybuffer or blob otherwise file will be corrupted
		const data = response.data;
		const blob = new Blob([data],{type:'application/zip'})
		const url = await window.URL.createObjectURL(blob);
		const downloadLink = document.createElement('a');
		downloadLink.href = url;
		downloadLink.download = fileName
		downloadLink.click();
		window.URL.revokeObjectURL(url);


	}
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth={true}
			maxWidth="sm"
			PaperProps={{
				style: {
					borderRadius: "15px",
					outline: "0px solid #2F2F2F",
				},
			}}>
			<DialogTitle>
				<Typography fontSize={"30px"} textAlign={"center"}>
					Export Map
				</Typography>
				<IconButton
					onClick={handleClose}
					id="close-button"
					sx={{
						position: "absolute",
						right: 10,
						top: 15,
						color: "gray",
					}}>
					<Close />
				</IconButton>
			</DialogTitle>
			<Divider sx={{ bgcolor: "#2F2F2F" }} />
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
							marginTop: "40px",
						}}>
						<Button
							variant="contained"
							size="large"
							component="label"
							onClick={handleExportShape}
						>
							Shape/DBF File
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
							marginTop: "40px",
						}}>
						<Button
							variant="contained"
							size="large"
							component="label"
							onClick={handleExportGeoJSON}
						>
							GeoJSON File
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
}
