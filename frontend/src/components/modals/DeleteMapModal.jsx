import { TextField, Button, Stack, Divider, IconButton } from "@mui/material";
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react"

export default function DeleteMapModal(props) {
	const { open, handleClose, handleDelete, mapName } = props;

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
			<DialogTitle align="center" fontSize={25}>
				Delete {mapName}?
			</DialogTitle>
			<Divider sx={{ bgcolor: "#2F2F2F" }} />
			<DialogContent>
				<Stack direction="row" spacing={2} justifyContent="center">
					<Button
						variant="contained"
						type="confirm"
						sx={{ width: "30%", marginRight: "50px" }}
						onClick={handleDelete}>
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
	);
}
