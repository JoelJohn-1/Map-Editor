import { TextField, Button, Stack, Divider, IconButton, Snackbar, Alert } from "@mui/material";
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react"

export default function DeleteRegionModal(props) {
	const { open, handleClose, handleDelete } = props;

	const [ alert, setAlert ] = useState(false)
	const [ alertMessage, setAlertMessage] = useState("")
	const [ alertSeverity, setAlertSeverity ] = useState("error")

	async function handleDeleteRegions(e) {
		e.preventDefault();
		let result = handleDelete();
		handleClose();
		if(!result) {
			setAlertMessage("You cannot delete all regions")
			setAlert(true)
		}
	}

	return (
		<>
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth={true}
			maxWidth="xs"
			PaperProps={{
				style: {
					borderRadius: "15px",
					outline: "0px solid #2F2F2F",
					height: "170px",
				},
			}}>
			<DialogTitle align="center" fontSize={30}>
				Delete selected regions?
			</DialogTitle>
			<Divider sx={{ bgcolor: "#2F2F2F" }} />
			<DialogContent>
				<Stack direction="row" spacing={2} justifyContent="center">
					<Button
						variant="contained"
						type="confirm"
						sx={{ width: "30%", marginRight: "100px" }}
						onClick={handleDeleteRegions}>
						Confirm
					</Button>
					<Button
						variant="contained"
						type="cancel"
						sx={{ width: "30%" }}
						onClick={handleClose}>
						Cancel
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
				<Snackbar
				autoHideDuration={3000}
				onClose={() => setAlert(false)}
				open={alert}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}>
				<Alert
					severity={alertSeverity}>
					{alertMessage}
				</Alert>
			</Snackbar>
			</>
	);
}
