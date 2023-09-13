import { useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import Carousel from 'react-material-ui-carousel'
import ColorRegion from "../../data/usecase/graph/GraphMode-ColorRegion.gif"
import ColorBorder from "../../data/usecase/graph/GraphMode-ColorBorder.gif"
import AddText from "../../data/usecase/graph/GraphMode-AddLabel.gif"
import EditText from "../../data/usecase/graph/GraphMode-AddEditDeleteLabel.gif"
import ColorText from "../../data/usecase/graph/GraphMode-ColorChangeText.gif"
import ChangeBackgroundColor from "../../data/usecase/graph/GraphMode-background.gif"
import ChangeLegend from "../../data/usecase/graph/GraphMode-labelcolor.gif"

export default function HelpGraphicModal(props) {
	const { open, handleClose } = props;
	const [firstImgLoaded, setFirstImgLoaded] = useState(false);

	let usecases = [
		{
			title: "Color Region",
			src: ColorRegion
		},
		{
			title: "Color Border",
			src: ColorBorder
		},
		{
			title: "Add Text (Double click)",
			src: AddText
		},
		{
			title: "Edit/Delete Text (Shift click)",
			src: EditText
		},
		{
			title: "Color Text",
			src: ColorText
		},
		{
			title: "Change Background Color",
			src: ChangeBackgroundColor
		},
		{
			title: "Change Legend",
			src: ChangeLegend
		}
	]

	return (
		<>
			<img
				src={ColorRegion}
				onLoad={() => setFirstImgLoaded(true)}
				style={{ display: "none" }}
			/>
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth={true}
				maxWidth="xl"
				PaperProps={{
					style: {
						borderRadius: "7px",
						outline: "0px solid #2F2F2F",
						fontFamily: "sans-serif"
					},
				}}>
				<DialogTitle>
					<IconButton
						onClick={handleClose}
						id="close-button"
						sx={{
							position: "absolute",
							right: 6,
							top: 6,
							color: "gray",
						}}>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					{firstImgLoaded &&
						(
							<Carousel autoPlay={false}>
								{usecases.map((usecase) => (
									<Box key={Math.random()}>
										<Box key={usecase.title} sx={{ textAlign: "center", fontSize: "20pt", marginBottom: "10px" }}> {usecase.title} </Box>
										<img className="gif" key={usecase.src} src={usecase.src} />
									</Box>
								))}
							</Carousel>
						)
					}
				</DialogContent>
			</Dialog>
		</>
	);
}
