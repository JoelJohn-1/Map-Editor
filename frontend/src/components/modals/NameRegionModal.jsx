import { TextField, Button, Stack, Divider, IconButton } from "@mui/material";
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react";

export default function NameRegionModal(props) {
	let textFieldStyle = {
		"& label.Mui-focused": {
			color: "primary.main",
		},
		"& .MuiOutlinedInput-root": {
			"& fieldset": {
				borderColor: "#2F2F2F",
				borderRadius: "10px",
			},
			"&:hover fieldset": {
				borderColor: "primary.main",
			},
			"& .Mui-focused fieldset": {
				borderColor: "primary.main",
				borderRadius: "10px",
			},
		},
	};

	const [errorMessage, setErrorMessage] = useState();
	const { open, handleClose, setName } = props;

	async function handleSubmit(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
		setName(formData.get("name"));
		handleClose();
	}

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth={true}
			maxWidth="xs"
			PaperProps={{
				style: {
					borderRadius: "7px",
					outline: "0px solid #2F2F2F",
				},
			}}>
			<DialogTitle>
				Name Region
				<IconButton
					onClick={handleClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: "gray",
					}}>
					<Close />
				</IconButton>
			</DialogTitle>
			<Divider sx={{ bgcolor: "#2F2F2F" }} />
			<Box sx={{ textAlign: "center" }}>{errorMessage}</Box>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<Stack spacing={2} sx={{ alignItems: "center" }}>
						<TextField
							label="Name"
							name="name"
							variant="outlined"
							sx={textFieldStyle}
							fullWidth
						/>
						<Button
							variant="contained"
							type="submit"
							sx={{ width: "50%" }}>
							Submit
						</Button>
					</Stack>
				</form>
			</DialogContent>
		</Dialog>
	);
}
