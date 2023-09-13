import { useState, useContext } from "react";
import { Box, TextField, Button, AppBar, IconButton, Avatar, Typography, Menu, MenuItem, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import UploadModal from "./modals/UploadModal"
import AuthContext from "../contexts/auth";
import { useQueryClient } from "react-query"


export default function AppBanner(props) {
	const { userScreen, setSearchFilter } = props;
	const [anchorElUser, setAnchorElUser] = useState(null);
	const { auth } = useContext(AuthContext)
	const [text, setText] = useState("");
	const queryClient = useQueryClient()
	let navigate = useNavigate();

	const [open, setOpen] = useState(false);
	const openUpload = () => setOpen(true);
	const closeUpload = () => setOpen(false);

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleLogOut = () => {
		handleCloseUserMenu();
		queryClient.invalidateQueries("maplist")
		queryClient.removeQueries();
		auth.logoutUser();
		navigate("/", { replace: true }) // gets another query from homescreen component
	};

	let textFieldStyle = {
		"& .MuiOutlinedInput-root": {
			"& fieldset": {
				borderColor: "#474747",
				borderRadius: "5px",
			},
			"&:hover fieldset": {
				borderColor: "#474747",
			},
			"&.Mui-focused fieldset": {
				borderColor: "#474747",
				borderRadius: "5px",
				borderWidth: "0px",
			},
		},
		backgroundColor: "#474747",
		borderRadius: "5px",
		position: "absolute",
	};

	function handleKeyPress(event) {
		if (event.code === "Enter") {
			setSearchFilter(text)
		}
	}

	function handleUpdateText(event) {
		setText(event.target.value);
	}

	function navigateToAllMaps() {
		navigate("/maps");
	}

	function navigateToUserHome() {
		navigate("/user");
	}

	let navigateButton = "";
	let middle = "";
	if (userScreen) {
		middle = (
			<Button
				variant="contained"
				size="large"
				sx={{
					borderRadius: "5px",
					position: "absolute",
				}}
				onClick={openUpload}>
				Upload Map
			</Button>
		);
		navigateButton = (
			<Button
				variant="outlined"
				size="large"
				onClick={navigateToAllMaps}
				sx={{ marginRight: "15px" }}>
				All Maps
			</Button>
		);
	} else {
		middle = (
			<TextField
				onKeyPress={handleKeyPress}
				onChange={handleUpdateText}
				variant="outlined"
				placeholder="Search..."
				size="small"
				InputProps={{
					style: { fontSize: 20 },
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon style={{ color: "white" }} />
						</InputAdornment>
					),
				}}
				sx={textFieldStyle}
			/>
		);
		navigateButton = (
			<Button
				variant="outlined"
				size="large"
				onClick={navigateToUserHome}
				sx={{ marginRight: "15px" }}>
				Homescreen
			</Button>
		);
	}

	return (
		<AppBar
			position="static"
			sx={{
				height: "7vh",
				bgcolor: "#1D1D1E",
				display: "flex",
				justifyContent: "center",
			}}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<IconButton onClick={navigateToUserHome}>
					<Avatar src="/Logo.png" />
				</IconButton>
				<Typography> Maps United </Typography>
				{middle}
				<Box sx={{ marginLeft: "auto", marginRight: "20px" }}>
					{navigateButton}
					<IconButton id="logoutButton" onClick={handleOpenUserMenu} sx={{ p: 0 }}>
						<Avatar> {auth.getUserInitials()} </Avatar>
					</IconButton>
					<Menu
						sx={{ mt: "45px" }}
						anchorEl={anchorElUser}
						anchorOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
						keepMounted
						transformOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
						open={Boolean(anchorElUser)}
						onClose={handleCloseUserMenu}
						PaperProps={{
							style: { backgroundColor: "white", color: "black" },
						}}>
						<MenuItem id="logoutButton2" onClick={handleLogOut}>
							Logout
						</MenuItem>
					</Menu>
				</Box>
			</Box>
			<UploadModal open={open} handleClose={closeUpload} />
		</AppBar>
	);
}
