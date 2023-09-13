import { Box } from "@mui/material";
import AppBanner from "./AppBanner";
import MapCard from "./MapCard";
import { useQuery } from "react-query";
import { loadMapList } from "../api/map";

export default function UserHomescreen() {
	const { isLoading, isError, error, data } = useQuery("maplist", loadMapList);

	let content;
	if (isLoading) {
		content = <div> Loading... </div>;
	} else if (isError) {
		content = <div> {error.message} </div>;
	} else {
		content = data.map((map) => (
			<MapCard
				id={map.id}
				key={Math.random()}
				name={map.name}
				author={map.author}
				fork={false}
				thumbnail={map.thumbnail}
				isPublic={false}
			/>
		));
	}

	return (
		<>
			<AppBanner userScreen={true} />
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
				}}>
				<Box
					sx={{
						display: "grid",
						width: "75%",
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
						justifyItems: "center",
					}}>
					{content}
				</Box>
			</Box>
		</>
	);
}
