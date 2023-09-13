import { useState, useEffect } from "react";
import { Box, Button, AppBar, IconButton, Avatar, Slider, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MapPropertiesDrawer from "./drawers/MapPropertiesDrawer"
import MapCommentsDrawer from "./drawers/MapCommentsDrawer";
import ExportMapModal from "./modals/ExportMapModal";
import PublishMapModal from "./modals/PublishMapModal";
import HelpEditModal from "./modals/HelpEditModal";
import { loadMapOnly } from "../api/map";
import { useQuery } from "react-query"
import { HelpOutline } from '@mui/icons-material';

export default function EditBanner(props) {
	let navigate = useNavigate();
	const [open, setOpen] = useState("");
	const [mapData, setData] = useState();
	const { mapId, handleSliderChange, editMode, isPublic } = props;
	const close = () => setOpen("");
	const openProperties = () => setOpen("properties");
	const openComments = () => setOpen("comments");
	const openExport = () => setOpen("export");
	const openPublish = () => setOpen("publish");
	const openHelp = () => setOpen("help")
	const openStatus = (option) => { return option === open; }

	const { data } = useQuery("mapdata", async () => loadMapOnly({ id: mapId }), { enabled: true, cacheTime: 0, onCompleted: setData });

	const minPoints = 5;
	const maxPoints = 200;
	const marks = [
		{
			value: minPoints,
			label: `${minPoints}`,
		},
		{
			value: maxPoints,
			label: `${maxPoints}`,
		}
	];

	useEffect(() => {
		setData(data)
	}, [data])

	function navigateToHome() {
		navigate("/user");
	}

	function navigateToGraphicsEditor() {
		navigate("/editor/" + mapId)
	}

	function navigateToPublicGraphicsEditor() {
		navigate("/public/editor/" + mapId)
	}

	let slider = "";

	if (editMode) {
		slider = <>
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "absolute", left: "0", right: "0", marginLeft: "auto", marginRight: "auto" }}>
				<Slider
					defaultValue={20}
					style={{ width: "500px" }}
					onChange={handleSliderChange}
					step={5}
					marks={marks}
					min={minPoints}
					max={maxPoints}
				/>
				<Box sx={{ fontFamily: "system-ui", position: "absolute", marginTop: "20px" }}> Adjust vertex proximity </Box>
			</Box></>
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
		<AppBar
			position="static"
			sx={{
				height: "7vh",
				bgcolor: "#1D1D1E",
				display: "flex",
				justifyContent: "center",
			}}>
			<Box sx={{ display: "flex", alignItems: "center" }}>
				<IconButton onClick={navigateToHome}>
					<Avatar src="/Logo.png" />
				</IconButton>

				<Button sx={{ color: "white" }} onClick={openProperties}> Properties </Button>
				<MapPropertiesDrawer data={mapData} open={openStatus("properties")} handleClose={close} isPublic={isPublic} />
				<Button sx={{ color: "white" }} onClick={openComments}> Comments </Button>
				<MapCommentsDrawer open={openStatus("comments")} handleClose={close} />
				<Button sx={{ color: "white" }} onClick={isPublic? navigateToPublicGraphicsEditor : navigateToGraphicsEditor}> Graphics Editor </Button>
				{slider}
				<Box sx={{ marginLeft: "auto", marginRight: "15px" }}>
					<Button sx={{ color: "white" }} onClick={openExport}> Export </Button>
					<ExportMapModal open={openStatus("export")} handleClose={close} />
					<Button sx={{ color: "white" }} onClick={openPublish} disabled={isPublic}> Publish </Button>
					<PublishMapModal open={openStatus("publish")} handleClose={close} />
					<Tooltip title="Help" arrow componentsProps={tooltipStyle}>
						<IconButton onClick={openHelp} sx={{ color: "white" }}>
							<HelpOutline />
						</IconButton>
					</Tooltip>
					<HelpEditModal open={openStatus("help")} handleClose={close} />
				</Box>
			</Box>
		</AppBar>
	);
}
