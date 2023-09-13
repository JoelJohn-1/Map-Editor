import { Box } from "@mui/material";
import { useState } from "react";
import MapCard from "./MapCard";
import AppBanner from "./AppBanner";
import { useQuery } from "react-query"
import { loadPublicMapList } from "../api/map";

export default function AllMapsScreen() {
	const { isLoading, isError, error, data } = useQuery("publicmaplist", loadPublicMapList);
	const [searchFilter, setSearchFilter] = useState("");

	let content;
	if (isLoading) {
		content = <div> Loading... </div>;
	} else if (isError) {
		content = <div> {error.message} </div>;
	} else {
		content = []
		data.forEach((map) => {
			if(map.name.includes(searchFilter) || map.author.includes(searchFilter))
				content.push(
				<MapCard
					id={map.id}
					key={map.id}
					name={map.name}
					author={map.author}
					fork={true}
					thumbnail={map.thumbnail}
					isPublic={true}
				/>)
		});
	}

	return (
		<>
			<AppBanner userScreen={false} setSearchFilter={setSearchFilter} />
			<Box
				sx={{
					display: "flex",
					justifyContent: "center"
				}}>
					<Box 
						sx={{
							display: "grid",
							width: "75%",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							justifyItems: "center",
						}}
					>
						{content}
					</Box>
			</Box>
		</>
	);
}
