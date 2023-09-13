import { TextField, Button, Stack, Divider, IconButton, Snackbar, Alert } from "@mui/material";
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useContext, useState } from "react";
import authApi from "../../api/auth"
// import auth from "../../../../backend/auth";
import AuthContext from "../../contexts/auth";


export default function RegisterModal(props) {
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
	const [ alert, setAlert ] = useState(false)
	const [ alertMessage, setAlertMessage] = useState("")
	const [ alertSeverity, setAlertSeverity ] = useState("success")

	const [errorMessage, setErrorMessage] = useState("");
	const { auth } = useContext(AuthContext)

	const { open, handleClose } = props;

	async function handleSubmit(e) {
		e.preventDefault();
		console.log(e.target)
		let formData = new FormData(e.target);
		await authApi.post("/register", {
			username: formData.get("username"),
			email: formData.get("register-email"),
			password: formData.get("registerPassword"),
		})
		.then((res) => {
			handleClose()
			setAlertMessage("Account created successfully");
			setAlert(true)
		})
		.catch((error) => {
			//console.log(JSON.parse(error.request.response).errorMessage)
			setErrorMessage(JSON.parse(error.request.response).errorMessage);
		})
	}

	return (
		<>
			<Dialog
			id="register-modal"
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
				Create An Account
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
			<Divider sx={{ bgcolor: "#2F2F2F" }} />
			<Box sx={{ textAlign: "center", color: "red", marginTop: "7px", marginBottom: "0px" }}>{errorMessage}</Box>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<Stack spacing={2} sx={{ alignItems: "center" }}>
						<TextField
							label="Username"
							name="username"
							variant="outlined"
							sx={textFieldStyle}
							fullWidth
						/>
						<TextField
							label="Email Address"
							name="register-email"
							type="email"
							variant="outlined"
							sx={textFieldStyle}
							fullWidth
						/>
						<TextField
							label="Password"
							name="registerPassword"
							type="password"
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
