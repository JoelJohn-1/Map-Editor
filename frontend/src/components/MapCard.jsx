import { useState } from "react";
import { Box, Card, CardMedia, CardContent, CardActionArea, Menu, MenuItem, IconButton, Typography, Snackbar, Alert } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from "react-router-dom";
import RenameMapModal from "./modals/RenameMapModal";
import DeleteMapModal from "./modals/DeleteMapModal";
import { useMutation, useQueryClient } from "react-query"
import { deleteMap, renameMap, forkMap } from "../api/map";

export default function MapCard(props) {
	const { id, name, author, fork, thumbnail, isPublic } = props;
	const queryClient = useQueryClient()
	const navigate = useNavigate();
	const [ alert, setAlert ] = useState(false)

	const [open, setOpen] = useState("");
	const close = () => setOpen("");
	const openStatus = (option) => {
		return option === open;
	};

	const openDelete = (event) => {
		event.stopPropagation();
		setOpen("delete");
		closeMenu();
	}

	const openRename = (event) => {
		event.stopPropagation();
		setOpen("rename");
		closeMenu()
	};

	const [anchorEl, setAnchorEl] = useState(null);
	const menuOpen = Boolean(anchorEl);

	const handleClick = (event) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const closeMenu = (event) => {
		event.stopPropagation();
		setAnchorEl(null);
	};

	const deleteMapMutation = useMutation(deleteMap, {
		onSuccess: () => {
			queryClient.invalidateQueries("maplist")
		}
	})

	const renameMapMutation = useMutation(renameMap, {
		onSuccess: () => {
			queryClient.invalidateQueries("maplist")
		}
	})

	function handleDelete() {
		deleteMapMutation.mutate({ id: id });
		close();
	}

	function handleRenameMap(name) {
		renameMapMutation.mutate({ id: id, name: name })
		close();
	}

	function handleFork(event) {
		event.stopPropagation();
		forkMap({ id: id });
		setAlert(true)
		closeMenu()
	}

	function handleLoadMap() {
		navigate("/map/" + id);
	}

	function handleLoadPublicMap() {
		navigate("/public/map/" + id);
	}

	let buttons = "";
	if (fork)
		buttons = (
			<MenuItem onClick={handleFork}> Fork </MenuItem>
		);
	else
		buttons = (
			<Box>
				<MenuItem id="rename-button" onClick={openRename}> Rename </MenuItem>
				<MenuItem id="delete-map-button" onClick={openDelete}> Delete </MenuItem>
			</Box>
			
		);

	return (
		<>
			<Card
				sx={{
					width: 300,
					outline: "1px solid #2A2A2A",
					marginTop: "40px",
					bgcolor: "#0E0E13",
					':hover': {
						outline: "1px solid gray"
					}
				}}
				onClick={isPublic? handleLoadPublicMap : handleLoadMap}>
				<CardActionArea component="div">
					<CardMedia
						sx={{ height: 250 }}
						image={thumbnail}
					/>
					<CardContent sx={{ display: "flex", flexDirection: "column", '&:last-child': { pb: 0, pr: 0 } }}>
						<Typography noWrap variant="h6" component="div">
							{name}
						</Typography>
						<Box sx={{ display: "flex" }}>
							<Typography noWrap variant="h7" component="div">
								By {author}
							</Typography>
							<IconButton id="more-icon" sx={{ color: "white", marginLeft: "auto" }} onClick={handleClick} onMouseDown={event => event.stopPropagation()}>
								<MoreVertIcon />
							</IconButton>
							<Menu
								anchorEl={anchorEl}
								open={menuOpen}
								onClose={closeMenu}
							>
								{buttons}
							</Menu>
						</Box>
					</CardContent>
				</CardActionArea>
			</Card>
			<RenameMapModal
				open={openStatus("rename")}
				handleClose={close}
				handleRenameMap={handleRenameMap}
			/>
			<DeleteMapModal
				open={openStatus("delete")}
				handleClose={close}
				handleDelete={handleDelete}
				mapName={name}
			/>
			<Snackbar
				open={alert}
				onClose={() => setAlert(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				autoHideDuration={3000}
			>
				<Alert severity="success"> Map forked! </Alert>
			</Snackbar>
		</>
	);
}
