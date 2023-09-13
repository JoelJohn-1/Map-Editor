import { useState } from "react";
import { Box, Button, IconButton, Drawer, Typography, TextField, Snackbar, Alert } from "@mui/material";
import { Close } from "@mui/icons-material";
import CodeMirror from '@uiw/react-codemirror';
import {EditorView} from "@codemirror/view"
import {json} from "@codemirror/lang-json"
import { useEffect } from "react";
import { updateProperties } from "../../api/map";

export default function MapPropertiesDrawer(props) {

	const { open, handleClose, data, isPublic } = props;
	const [ alert, setAlert ] = useState(false)
	const [ alertMessage, setAlertMessage] = useState("")
	const [ alertSeverity, setAlertSeverity ] = useState("error")
	const [ properties, setProperties ] = useState("{\n\t\n}");

	useEffect(()=>{
		if(data && data.properties){
			setProperties(JSON.stringify(data.properties, null, "  "))
		}
	},[data])


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
			backgroundColor:"#008dff"
		},
		"&.cm-focused .cm-selectionBackground, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection": {
			backgroundColor: "#00000033"
		  }
	  }, {dark: false})

	function handlePropertiesChange(change) {
		setProperties(change);
	}
	
	async function handleSaveProperties() {
		try {
			let payload = {}
			let setData = properties
			if (properties === '') {
				setData = "{\n\t\n}"
			}
			let parsed = JSON.parse(setData) 
			// Check if user added additional properties which is not allowed
			payload = {
				id: data._id,
				map: parsed
			}
			
			let response = await updateProperties(payload);
			setAlertMessage("Successfully changed!")
			setAlertSeverity("success")
			setAlert(true)
			// API call here
		}catch (error) {
			if (error.response) {
				setAlertMessage(error.response.data.error)
			}
			else {
				setAlertMessage("Properties must be valid JSON!")
			}
			setAlertSeverity("error")
			setAlert(true)
		}


	}
	
	return (
		<Drawer anchor="right" open={open} onClose={handleClose}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Typography sx={{ fontSize: "20pt", marginTop: "10px" }}>
					Map Properties
				</Typography>
				<CodeMirror
					width="500px"
					value={properties}
					extensions={[myTheme,json()]}
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
		</Drawer>
	);
}
