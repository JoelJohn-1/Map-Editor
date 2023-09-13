import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import authApi from "../api/auth"

export default function ResetPasswordScreen() {
	let [searchParams, setSearchParams] = useSearchParams();
	let navigate = useNavigate();

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

	async function handleSubmit(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
		await authApi.post("/resetpassword", {
			password: formData.get("password"),
			key: searchParams.get("key")
		})

		navigate("/");
	}

	return (
		<Box
			sx={{
				background: "#0B0B0F",
				display: "flex",
				justifyContent: "center",
				minHeight: "100vh",
			}}>
			<Box
				sx={{
					outline: "2px solid #2F2F2F",
					borderRadius: "10px",
					padding: "20px",
					backgroundColor: "#0E0E13",
					marginTop: "5%",
					display: "flex",
					flexDirection: "column",
					height: "280px",
					width: "400px",
				}}>
				<Typography
					sx={{
						color: "white",
						backgroundColor: "#0E0E13",
						display: "flex",
						justifyContent: "center",
						height: "100px",
						fontFamily: "Montserrat",
						fontSize: "40px",
					}}>
					Reset Password
				</Typography>
				<form onSubmit={handleSubmit}>
					<Stack spacing={2.5}>
						<Typography
							sx={{
								color: "white",
								backgroundColor: "#0E0E13",
								fontFamily: "Montserrat",
								fontSize: "15px",
							}}>
							Enter New Password:
						</Typography>
						<TextField
							id="outlined-basic"
							name="password"
							type="password"
							label="Password"
							variant="outlined"
							sx={textFieldStyle}
						/>
						<Button
							variant="contained"
							type="submit"
							size="large"
							sx={{ borderRadius: "10px" }}>
							Reset Password
						</Button>
					</Stack>
				</form>
			</Box>
		</Box>
	);
}
