import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import { Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, Divider } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react";
import authApi from "../../api/auth"

export default function PasswordRecoveryModal(props) {
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
	const { open, handleClose } = props;

	async function handleSubmit(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
		let key = Date.now();
		let res = await authApi.post("/sendemail", {
			email: formData.get("email"),
			key: key,
		}, {
			validateStatus: function (status) {
				return status < 500;
			}
		});

		if (res.status != 200)
			setErrorMessage(res.data.errorMessage);
		else
			_handleClose();
	}
	async function _handleClose() {
		setErrorMessage("");
		handleClose();

	}
	return (
		<Dialog
			open={open}
			onClose={_handleClose}
			fullWidth={true}
			maxWidth="xs"
			PaperProps={{
				style: {
					borderRadius: "7px",
					outline: "0px solid #2F2F2F",
				},
			}}>
			<DialogTitle>
				Find your account
				<IconButton
					onClick={_handleClose}
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
			<DialogContentText>
				<Divider sx={{ bgcolor: "#2F2F2F" }} />
				<Box sx={{ textAlign: "center", color: "red" }}>{errorMessage}</Box>
			</DialogContentText>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<Stack spacing={2} sx={{ alignItems: "center" }}>
						<TextField
							label="Email"
							name="email"
							type="email"
							variant="outlined"
							sx={textFieldStyle}
							fullWidth
						/>
						<Button
							id="submitButton"
							variant="contained"
							type="submit"
							size="large"
							sx={{ width: "50%" }}>
							Submit
						</Button>
					</Stack>
				</form>
			</DialogContent>
		</Dialog>
	);
}
