import { useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import Carousel from 'react-material-ui-carousel'
import SelectRegion from "../../data/usecase/mapeditor/SelectRegion.gif"
import RenameRegion from "../../data/usecase/mapeditor/RenameRegion.gif"
import MergeRegions from "../../data/usecase/mapeditor/MergeRegions.gif"
import DeleteRegion from "../../data/usecase/mapeditor/DeleteRegion.gif"
import CreateRegion from "../../data/usecase/mapeditor/CreateRegion.gif"
import SplitRegion from "../../data/usecase/mapeditor/SplitRegion.gif"
import AdjustVertex from "../../data/usecase/edit/EditMode-AdjustVertex.gif"
import SelectVertex from "../../data/usecase/edit/EditMode-SelectVertex.gif"
import DragVertex from "../../data/usecase/edit/EditMode-DragVertex.gif"
import BorderVertex from "../../data/usecase/edit/EditMode-BorderVertex.gif"
import AddVertex from "../../data/usecase/edit/EditMode-AddVertex.gif"
import DeleteVertex from "../../data/usecase/edit/EditMode-DeleteVertex.gif"
import MergeVertices from "../../data/usecase/edit/EditMode-MergeVertex.gif"
import EditMapProperties from "../../data/usecase/mapeditor/MapProperties.gif"
import EditRegionProperties from "../../data/usecase/mapeditor/RegionProperties.gif"
import PublishMap from "../../data/usecase/mapeditor/PublishMap.gif"

export default function HelpEditModal(props) {
	const { open, handleClose } = props;
	const [firstImgLoaded, setFirstImgLoaded] = useState(false);

	let usecases = [
		{
			title: "Select Region",
			src: SelectRegion
		},
		{
			title: "Rename Region (Double Click)",
			src: RenameRegion
		},
		{
			title: "Merge Region",
			src: MergeRegions
		},
		{
			title: "Delete Region",
			src: DeleteRegion
		},
		{
			title: "Create Region",
			src: CreateRegion
		},
		{
			title: "Split Region (Double click to finish)",
			src: SplitRegion
		},
		{
			title: "Adjust Vertex Proximity",
			src: AdjustVertex
		},
		{
			title: "Select Vertex",
			src: SelectVertex
		},
		{
			title: "Drag Vertex",
			src: DragVertex
		},
		{
			title: "Drag Border Vertex",
			src: BorderVertex
		},
		{
			title: "Add Vertex",
			src: AddVertex
		},
		{
			title: "Delete Vertex (Shift+Left Click)",
			src: DeleteVertex
		},
		{
			title: "Merge Vertices",
			src: MergeVertices
		},
		{
			title: "Edit Map Properties",
			src: EditMapProperties
		},
		{
			title: "Edit Region Properties",
			src: EditRegionProperties
		},
		{
			title: "Publish Map",
			src: PublishMap
		}
	]

	return (
		<>
			<img
				src={SelectRegion}
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
