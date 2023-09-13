import { useState } from "react";
import {
	Box,
	Button,
	AppBar,
	IconButton,
	Avatar,
	Select,
	Menu,
	MenuItem,
	ToggleButtonGroup,
	ToggleButton,
	Tooltip
} from "@mui/material";
import {
	FormatColorFill,
	FormatColorTextOutlined,
	WallpaperOutlined,
	Save,
	HelpOutline
} from "@mui/icons-material";
import { CompactPicker, TwitterPicker } from "react-color";
import { useNavigate } from "react-router-dom";
import HelpGraphicModal from "./modals/HelpGraphicModal";

export default function GraphicsBanner(props) {
	let navigate = useNavigate();
	const {
		mapId,
		setCurrentFillColor,
		setFillInside,
		setLeafletBackground,
		handleSetTextColor,
		backgroundColor,
		fillInside,
		currentFontSize,
		currentFont,
		updateCurrentMarkerSize,
		updateCurrentMarkerFont,
		textColor,
		exportAsImage,
		saveMap,
		currentFillColor,
		isPublic
	} = props;

	const [displayColorPicker, setDisplayColorPicker] = useState(null);
	const [anchorEl, setAnchorEl] = useState(null);
	const closeColorPickers = () => {
		setDisplayColorPicker(null);
		setAnchorEl(null);
	};

	const [fontTooltip, setFontTooltip] = useState(false);
	const [fontSizeTooltip, setFontSizeTooltip] = useState(false);

	const fillOpen = Boolean(displayColorPicker == "fill");
	const textOpen = Boolean(displayColorPicker == "text");
	const backgroundOpen = Boolean(displayColorPicker == "background");

	const [ open, setOpen ] = useState(false);
	const openHelp = () => setOpen(true);
	const closeHelp = () => setOpen(false);

	function navigateToHome() {
		navigate("/user");
	}

	function navigateToMapEditor() {
		navigate("/map/" + mapId);
	}

	function navigateToPublicMapEditor() {
		navigate("/public/map/" + mapId);
	}

	const fontOptions = [
		{ label: "Helvetica", value: "Helvetica" },
		{ label: "Garamond", value: "Garamond" },
		{ label: "Futura", value: "Futura" },
		{ label: "Bodoni", value: "Bodoni" },
		{ label: "Arial", value: "Arial" },
		{ label: "Times New Roman", value: "Times New Roman" },
		{ label: "Verdana", value: "Verdana" },
		{ label: "Rockwell", value: "Rockwell" },
		{ label: "Franklin Gothic", value: "Franklin Gothic" },
		{ label: "Univers", value: "Univers" },
		{ label: "Frutiger", value: "Frutiger" },
		{ label: "Cursive", value: "Cursive" }
	];

	const fontSizeOptions = [
		{ label: "15pt", value: "15pt" },
		{ label: "17pt", value: "17pt" },
		{ label: "19pt", value: "19pt" },
		{ label: "21pt", value: "21pt" },
		{ label: "23pt", value: "23pt" },
		{ label: "25pt", value: "25pt" },
		{ label: "27pt", value: "27pt" },
		{ label: "29pt", value: "29pt" },
		{ label: "31pt", value: "31pt" }
	];

	const [alignment, setAlignment] = useState("fill");

	const handleChange = (event, newAlignment) => {
		if (newAlignment !== null) {
			setAlignment(newAlignment);
			setFillInside(newAlignment);
		}
	};

	let selectStyle = {
		bgcolor: "white",
		color: "black",
		fontSize: "11pt",
		marginLeft: "5px",
		"& .MuiSelect-outlined": {
			padding: "13px"
		}
	};

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
				justifyContent: "center"
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center" }}>
				<IconButton onClick={navigateToHome}>
					<Avatar src="/Logo.png" />
				</IconButton>
				<Button
					sx={{ color: "white", marginRight: "20px" }}
					onClick={isPublic? navigateToPublicMapEditor : navigateToMapEditor}
				>
					{" "}
					Map Editor{" "}
				</Button>

				<Tooltip
					title="Fill Color"
					arrow
					componentsProps={tooltipStyle}
				>
					<IconButton
						sx={{ color: currentFillColor }}
						onClick={(event) => {
							setDisplayColorPicker("fill");
							setAnchorEl(event.currentTarget);
						}}
						disabled={isPublic}
					>
						<FormatColorFill />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={anchorEl}
					open={fillOpen}
					onClose={closeColorPickers}
				>
					<TwitterPicker
						color={currentFillColor}
						onChange={(color) => {
							setCurrentFillColor(color.hex);
							setDisplayColorPicker(null);
						}}
						colors={[
							"#4D4D4D",
							"#999999",
							"#FFFFFF",
							"#F44E3B",
							"#FE9200",
							"#FCDC00",
							"#A4DD00",
							"#68CCCA",
							"#73D8FF",
							"#AEA1FF",
							"#FDA1FF",
							"#333333",
							"#808080",
							"#cccccc",
							"#D33115",
							"#E27300",
							"#FCC400",
							"#B0BC00",
							"#68BC00",
							"#16A5A5",
							"#009CE0",
							"#7B64FF",
							"#FA28FF",
							"#000000",
							"#666666",
							"#B3B3B3",
							"#9F0500",
							"#C45100",
							"#FB9E00",
							"#808900",
							"#194D33",
							"#0C797D",
							"#0062B1",
							"#653294",
							"#AB149E"
						]}
					/>
				</Menu>

				<ToggleButtonGroup
					color="primary"
					value={alignment}
					exclusive
					onChange={handleChange}
					sx={{
						marginRight: "5px",

						outline: "1px solid #2F2F2F"
					}}
					disabled={isPublic}
				>
					<ToggleButton
						value="fill"
						sx={{ color: "white", textTransform: "none" }}
					>
						Fill Region
					</ToggleButton>
					<ToggleButton
						value="nofill"
						sx={{ color: "white", textTransform: "none" }}
					>
						Color Borders
					</ToggleButton>
				</ToggleButtonGroup>

				<Tooltip
					title="Font Size"
					arrow
					componentsProps={tooltipStyle}
					open={fontSizeTooltip}
				>
					<Select
						value={currentFontSize}
						onChange={updateCurrentMarkerSize}
						displayEmpty
						autoWidth
						sx={selectStyle}
						onOpen={() => setFontSizeTooltip(false)}
						onMouseEnter={() => setFontSizeTooltip(true)}
						onMouseLeave={() => setFontSizeTooltip(false)}
						disabled={isPublic}
					>
						{fontSizeOptions.map((option) => (
							<MenuItem key={option.label} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</Tooltip>

				<Tooltip
					title="Font"
					arrow
					componentsProps={tooltipStyle}
					open={fontTooltip}
				>
					<Select
						value={currentFont}
						onChange={updateCurrentMarkerFont}
						displayEmpty
						autoWidth
						sx={selectStyle}
						onOpen={() => setFontTooltip(false)}
						onMouseEnter={() => setFontTooltip(true)}
						onMouseLeave={() => setFontTooltip(false)}
						disabled={isPublic}
					>
						{fontOptions.map((option) => (
							<MenuItem key={option.label} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</Tooltip>

				<Tooltip
					title="Text Color"
					arrow
					componentsProps={tooltipStyle}
				>
					<IconButton
						sx={{ color: textColor }}
						onClick={(event) => {
							setDisplayColorPicker("text");
							setAnchorEl(event.currentTarget);
						}}
						disabled={isPublic}
					>
						<FormatColorTextOutlined />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={anchorEl}
					open={textOpen}
					onClose={closeColorPickers}
				>
					<TwitterPicker
						color={textColor}
						onChange={(color) => {
							handleSetTextColor(color.hex);
							setDisplayColorPicker(null);
						}}
						colors={[
							"#4D4D4D",
							"#999999",
							"#FFFFFF",
							"#F44E3B",
							"#FE9200",
							"#FCDC00",
							"#A4DD00",
							"#68CCCA",
							"#73D8FF",
							"#AEA1FF",
							"#FDA1FF",
							"#333333",
							"#808080",
							"#cccccc",
							"#D33115",
							"#E27300",
							"#FCC400",
							"#B0BC00",
							"#68BC00",
							"#16A5A5",
							"#009CE0",
							"#7B64FF",
							"#FA28FF",
							"#000000",
							"#666666",
							"#B3B3B3",
							"#9F0500",
							"#C45100",
							"#FB9E00",
							"#808900",
							"#194D33",
							"#0C797D",
							"#0062B1",
							"#653294",
							"#AB149E"
						]}
					/>
				</Menu>

				<Tooltip
					title="Backgrond Color"
					arrow
					componentsProps={tooltipStyle}
				>
					<IconButton
						sx={{ color: "white" }}
						onClick={(event) => {
							setDisplayColorPicker("background");
							setAnchorEl(event.currentTarget);
						}}
						disabled={isPublic}
					>
						<WallpaperOutlined />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={anchorEl}
					open={backgroundOpen}
					onClose={closeColorPickers}
				>
					<TwitterPicker
						color={backgroundColor}
						onChange={(color) => {
							setLeafletBackground(color.hex);
							setDisplayColorPicker(null);
						}}
						colors={[
							"#4D4D4D",
							"#999999",
							"#FFFFFF",
							"#F44E3B",
							"#FE9200",
							"#FCDC00",
							"#A4DD00",
							"#68CCCA",
							"#73D8FF",
							"#AEA1FF",
							"#FDA1FF",
							"#333333",
							"#808080",
							"#cccccc",
							"#D33115",
							"#E27300",
							"#FCC400",
							"#B0BC00",
							"#68BC00",
							"#16A5A5",
							"#009CE0",
							"#7B64FF",
							"#FA28FF",
							"#000000",
							"#666666",
							"#B3B3B3",
							"#9F0500",
							"#C45100",
							"#FB9E00",
							"#808900",
							"#194D33",
							"#0C797D",
							"#0062B1",
							"#653294",
							"#AB149E"
						]}
					/>
				</Menu>

				<Tooltip title="Save" arrow componentsProps={tooltipStyle}>
					<IconButton sx={{ color: "white" }} onClick={saveMap} disabled={isPublic}>
						<Save />
					</IconButton>
				</Tooltip>

				<Box sx={{ marginLeft: "auto", marginRight: "15px" }}>
					<Button
						variant="outlined"
						onClick={exportAsImage}
					>
						Export
					</Button>
					<Tooltip title="Help" arrow componentsProps={tooltipStyle}>
						<IconButton onClick={openHelp} sx={{ color: "white" }}>
							<HelpOutline />
						</IconButton>
					</Tooltip>
					<HelpGraphicModal open={open} handleClose={closeHelp} />
				</Box>
			</Box>
		</AppBar>
	);
}
