import { useState, useContext } from "react";
import { WorldMap, Grommet } from "grommet";
import { Box, TextField, Button, Stack, Grid, Link, Divider } from "@mui/material";
import RegisterModal from "./modals/RegisterModal"
import PasswordRecoveryModal from "./modals/PasswordRecoveryModal";
import AuthContext from "../contexts/auth";

export default function Homescreen() {
	const [open, setOpen] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const openRegister = () => setOpen("register");
	const openPasswordRecovery = () => setOpen("password");
	const close = () => setOpen("");
	const openStatus = (option) => { return option === open; }
	const { auth } = useContext(AuthContext);

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

	function handleLogin(e) {
		e.preventDefault();
		let formData = new FormData(e.target);

		auth.loginUser(
			formData.get('email'),
			formData.get('password')
		).catch(function (err) {
			setErrorMessage(err.response.data.errorMessage);
		});
	}

	return (
		<Box
			sx={{
				background: "#0B0B0F",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				minHeight: "100vh",
			}}>
			<Box
				sx={{
					color: "white",
					backgroundColor: "#0E0E13",
					width: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "90px",
					fontFamily: "Moul",
					fontSize: "60px",
				}}>
				Maps United
			</Box>
			<Box sx={{ marginTop: "5%", width: "80%" }}>
				<Grid container columnSpacing={10}>
					<Grid item xs={8}>
						<Grommet>
							<WorldMap color="graph-0" />
						</Grommet>
					</Grid>
					<Grid item xs={4}>
						<Box
							sx={{
								outline: "2px solid #2F2F2F",
								borderRadius: "10px",
								height: "80%",
								padding: "20px",
								backgroundColor: "#0E0E13",
								marginTop: "20%",
								textAlign: "center",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
							}}>
							<form onSubmit={handleLogin}>
								<Stack spacing={2}>
									<Box id="errormsg" sx={{ textAlign: "center", color: "red" }}>{errorMessage}</Box>
									<TextField
										id="outlined-basic"
										name="email"
										label="Email"
										type="email"
										variant="outlined"
										defaultValue=""
										sx={textFieldStyle}
									/>
									<TextField
										id="outlined-basic"
										name="password"
										label="Password"
										type="password"
										variant="outlined"
										defaultValue=""
										sx={textFieldStyle}
									/>
									<Button
										id="loginButton"
										variant="contained"
										type="submit"
										size="large"
										sx={{ borderRadius: "10px" }}
									>
										Login
									</Button>
								</Stack>
							</form>
							<Link
								onClick={openPasswordRecovery}
								sx={{ marginTop: "10px" }}>
								Forgot Password?
							</Link>
							<Divider
								variant="middle"
								sx={{ bgcolor: "#2F2F2F", marginTop: "10%" }}
							/>
							<Button
								id="registerButton"
								variant="contained"
								type="submit"
								size="large"
								onClick={openRegister}
								sx={{
									borderRadius: "10px",
									marginTop: "10%",
								}}>
								Create An Account
							</Button>
						</Box>
					</Grid>
					<Grid item xs={8}>
						<Box
							sx={{
								color: "white",
								fontFamily: "Montserrat",
								fontSize: "25px",
								textAlign: "center",
							}}>
							The ultimate map creator's experience. Elegantly
							edit maps. Use other's
							maps as starting points for your own.
							Create detailed graphics.
						</Box>
					</Grid>
				</Grid>
			</Box>
			<RegisterModal open={openStatus("register")} handleClose={close} />
			<PasswordRecoveryModal open={openStatus("password")} handleClose={close} />
		</Box>
	);
}
