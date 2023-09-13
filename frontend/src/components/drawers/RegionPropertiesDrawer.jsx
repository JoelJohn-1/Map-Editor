import { useState, useEffect } from "react";
import { Box, Button, IconButton, Drawer, Typography, Snackbar, Alert } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from "react-query"
import { useGetFetchQuery, saveMap } from "../../api/map"
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from "@codemirror/view"
import { json } from "@codemirror/lang-json"
import Ajv from "ajv"

export default function RegionPropertiesDrawer(props) {
	const schema = {
		type: "object",
	}

	const ajv = new Ajv()
	const validate = ajv.compile(schema)

	const { open, handleClose, selectedLayers, mapData, isPublic } = props;
	const data = useGetFetchQuery("map", selectedLayers);
	const [alert, setAlert] = useState(false)
	const [alertMessage, setAlertMessage] = useState("")
	const [alertSeverity, setAlertSeverity] = useState("info")
	const [properties, setProperties] = useState({});
	const { id } = useParams();
	const queryClient = useQueryClient();

	const [firstLoad, setFirstLoad] = useState(false);
	const [originalData, setOriginalData] = useState("")
	const [originalKeys, setOriginalKeys] = useState({})
	useEffect(() => {
		if (!firstLoad && Object.keys(data).length !== 0) {
			setOriginalData(data)
			setFirstLoad(true);
			setOriginalKeys(Object.keys(data))
		} 
		if (data) {
			setProperties(JSON.stringify(data, null, "  "))
		}
	}, [data])
	let myTheme = EditorView.theme({
		".cm-gutters": {
			backgroundColor: "#000",
			color: "#fff",
			border: "none",
			padding: "0px"
		},
		".cm-line": {
			color: "#000"
		},
		".cm-activeLineGutter": {
			backgroundColor: "#008dff"
		},
		"&.cm-focused .cm-selectionBackground, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection": {
			backgroundColor: "#00000033"
		}
	}, { dark: false })

	function refetchData() {
		queryClient.refetchQueries("map");
	}
	
	function handlePropertiesChange(event) {
		// console.log(event);
		setProperties(event);
	}

	// Check if the keys has value
	function checkImportantKeys(parsedData) {
		let integrity = true;
		originalKeys.forEach((key) => {
			if (parsedData[key] === undefined) {
				integrity = false;
			} 
		})
		return integrity
	}
	async function handleSaveProperties() {
		try {
			// Check the keys
			let parsed = JSON.parse(properties)
			let isValid = checkImportantKeys(parsed);
			if (!isValid) {
				setAlertSeverity("error")
				setAlertMessage("Cannot remove original properties!")
				setAlert(true)
				return;
			}
	
			const valid = validate(parsed)

			if (!valid) {
				setAlertSeverity("error")
				setAlertMessage("Invalid Properties!")
				console.log(validate.errors)
			} else {
				let features = mapData
				features[mapData.indexOf(selectedLayers.values().next().value.feature)].properties = parsed;
				saveMap({id: id, mapData: features })

				setAlertSeverity("success")
				setAlertMessage("Successfully changed!")
				//refetchData();
			}
			setAlert(true)

		} catch (error) {
			console.log(error)
			if (error.response) {
				setAlertMessage(error.response.data.error)
			}
			else {
				setAlertMessage("Invalid JSON!")
			}
			setAlertSeverity("error")
			setAlert(true)
		}
	}

	return (
		<Drawer anchor="left" open={open} onClose={handleClose}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Typography sx={{ fontSize: "20pt", marginTop: "10px" }}>
					Region Properties
				</Typography>
				<CodeMirror
					width="500px"
					value={properties}
					extensions={[myTheme, json()]}
					onChange={handlePropertiesChange}
					basicSetup={{
						drawSelection: false,
					}}
					readOnly={isPublic}	

				/>
				<Button
					variant="contained"
					size="large"
					onClick={handleSaveProperties}
					disabled={isPublic}>
					Save
				</Button>
				<IconButton
					onClick={handleClose}
					id="close-button"
					sx={{
						position: "absolute",
						right: 6,
						top: 6,
						color: "gray",
					}}>
					<Close />
				</IconButton>
			</Box>
			<Snackbar
				open={alert}
				onClose={() => setAlert(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				autoHideDuration={3000}
			>
				<Alert severity={alertSeverity}> {alertMessage} </Alert>
			</Snackbar>
		</Drawer>
	);
}
