import { Button, Stack, Divider } from "@mui/material";
import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useParams } from 'react-router-dom';
import mapApi from "../../api/map"

export default function PublishMapModal(props) {
	const { id } = useParams();
	const { open, handleClose } = props;
	const handlePublish = async () => {
		const response = await mapApi.post("publishmap", {
			id: id
		});	
		if (response.status === 200) {
			handleClose();
		}
		else{
			console.log(response.data)
		}
	}
	return (
		<Dialog
			open={open}
			fullWidth={true}
			onClose={handleClose}
			maxWidth="xs"
			PaperProps={{
				style: {
					borderRadius: "15px",
					outline: "0px solid #2F2F2F",
					height: "170px",
				},
			}}>
			<DialogTitle align="center" fontSize={25}>
				Are you sure you want to publish?
			</DialogTitle>
			<Divider sx={{ bgcolor: "#2F2F2F" }} />
			<DialogContent>
				<Stack direction="row" spacing={2} justifyContent="center">
					<Button
						variant="contained"
						type="confirm"
						sx={{ width: "30%", marginRight: "100px" }}
						onClick={handlePublish}
					>
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
