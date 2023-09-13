import { useState } from "react";
import { Box, IconButton, Divider, Tooltip, Alert, Snackbar } from "@mui/material";
import { Edit, Save, Undo, Redo, Add, Merge, ContentCut, Delete, Tune } from "@mui/icons-material"
import DeleteRegionModal from "./modals/DeleteRegionModal";
import RegionPropertiesDrawer from "./drawers/RegionPropertiesDrawer";
import NameRegionModal from "./modals/NameRegionModal";

export default function EditBar(props) {
	const [open, setOpen] = useState("");
	const [warning, setWarning] = useState(false)
	const [warningText, setWarningText] = useState("")
	const [warningSeverity, setWarningSeverity] = useState("warning")
	const [editModeColor, setEditModeColor] = useState("white")
	const { handleSaveMap, undo, redo, selectedLayers, mapData, isPublic } = props;
	const openDeleteRegionModal = () => setOpen("delete");
	const openRegionPropertiesDrawer = () => {
		if (selectedLayers.size === 1)
			setOpen("properties");
		else {
			setWarningText("Please select 1 region.")
			setWarning(true)
			setWarningSeverity("warning")
		}
	}
	const openNameRegionModal = () => setOpen("name")
	const close = () => setOpen("");
	const openStatus = (option) => {
		return option === open;
	};
	const toggleEditIconColor = () => {
		if (editModeColor == "white") {
			setEditModeColor("red")
		} else {
			setEditModeColor("white")
		}
	}

	const handleToggleEditMode = () => {
		if (!props.splitMode) {
			props.toggleEditMode()
			toggleEditIconColor();
		} else {
			setWarningText("Please leave split mode to utilize this feature.")
			setWarning(true)
			setWarningSeverity("warning")
			return ;
		}
        
	}

	const handleMergeFeatures = () => {
		if (props.selectedLayers.size < 2) {
			setWarningText("Please select at least 2 regions to merge.")
			setWarning(true)
			setWarningSeverity("warning")
			return ;
		}
		openNameRegionModal()
    }

	const handleDeleteFeatures = () => {
		if (props.selectedLayers.size < 1) {
			setWarningText("Please select at least 1 region to delete.")
			setWarning(true)
			setWarningSeverity("warning")
			return ;
		}
		openDeleteRegionModal()
	}		

	const handleCreateFeature = () => {
		if (props.editMode) {
			props.handleCreate();
		} else {
			setWarningText("Please enter edit mode to use this feature.")
			setWarning(true)
			setWarningSeverity("warning")
			return ;
		}
	}
	
	const handleSaveFeatures = () => {
		if (props.editMode) {
			props.handleSaveMap();
			toggleEditIconColor();
		} else {
			props.handleSaveMap();
		}

		setWarningText("Map saved!")
		setWarning(true)
		setWarningSeverity("success")
	}
	const handleSplitFeature = () => {
		if (props.editMode) {
			setWarningText("Please leave edit mode to utilize this feature.")
			setWarning(true)
			setWarningSeverity("warning")
			return ;
		}
		if (!props.splitMode && props.selectedLayers.size < 1) {
			setWarningText("Please select a region to split.")
			setWarning(true)
			setWarningSeverity("warning")
			return ;
		} else if (!props.splitMode && props.selectedLayers.size > 1) {
			setWarningText("Please select only one region to split.")
			setWarning(true)
			setWarningSeverity("warning")
			return ;
		}
		props.handleSplitFeature()
		
	}

	let tooltipStyle = {
		tooltip: {
			sx: {
				bgcolor: "common.black",
				"& .MuiTooltip-arrow": {
					color: "common.black"
				}
			}
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "585px",
				bgcolor: "black",
				position: "absolute",
				top: "0",
				bottom: "0",
				marginTop: "auto",
				marginBottom: "auto",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
			}}>
			<Tooltip title="Edit mode" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: editModeColor,
						padding: "20px",
					}}
					onClick={handleToggleEditMode}
					disabled={isPublic}>
					<Edit />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Save" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={handleSaveFeatures}
					disabled={isPublic}>
					<Save />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Undo" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={undo}
					disabled={isPublic}>
					<Undo />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Redo" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={redo}
					disabled={isPublic}>
					<Redo />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Create subregion" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={handleCreateFeature}
					disabled={isPublic}>
					<Add />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Merge subregions" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={handleMergeFeatures}
					disabled={isPublic}>
					<Merge />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Split subregion" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={handleSplitFeature}
					disabled={isPublic}>
					<ContentCut />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Delete subregion" placement="right" arrow
					componentsProps={tooltipStyle}
					disabled={isPublic}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={handleDeleteFeatures}>
					<Delete />
				</IconButton>
			</Tooltip>
			<Divider flexItem />
			<Tooltip title="Add region property" placement="right" arrow
					componentsProps={tooltipStyle}>
				<IconButton
					sx={{
						color: "white",
						padding: "20px",
					}}
					onClick={openRegionPropertiesDrawer}>
					<Tune />
				</IconButton>
			</Tooltip>
			<DeleteRegionModal
				open={openStatus("delete")}
				handleClose={close}
				handleDelete={props.handleDelete}
			/>
			<RegionPropertiesDrawer
				open={openStatus("properties")}
				handleClose={close}
				selectedLayers={selectedLayers}
				mapData={mapData}
				isPublic={isPublic}
			/>
			<NameRegionModal
				open={openStatus("name")}
				handleClose={close}
				setName={props.mergeFeatures}
			/>
			<Snackbar
				autoHideDuration={3000}
				onClose={() => setWarning(false)}
				open={warning}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}>
				<Alert
					severity={warningSeverity}>
					{warningText}
				</Alert>
			</Snackbar>
		</Box>
		
	);
}