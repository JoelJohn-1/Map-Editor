import { Box, Button, IconButton, Drawer, Typography, Divider, List, ListItem, TextField} from "@mui/material";
import { Close } from "@mui/icons-material";
import Comment from "../Comment";
import { useState } from "react";
import { useQuery } from "react-query"
import { loadComments, publishComment } from "../../api/map";
import { useParams } from 'react-router-dom';

export default function MapCommentsDrawer(props) {
	const { isLoading, isError, error, data } = useQuery("loadComments",load,{ enabled: true, cacheTime: 0 });
	const { id } = useParams();
	async function load() {
		let res = await loadComments({id: id})
		// For empty comments
		if (res.length === 0) {
			setComments(res)
		}
		else
			setComments(res.comments)
		return res
	}
	const { open, handleClose } = props;
	const divisorStyle = {
		width: "100%",
		borderBottomWidth: 5,
	};
	let keyid
	const commentStyle = {
		fontSize: "18pt",
		marginTop: "10px",
		marginLeft: "10px",
	};
	const boxStyle = {
		display: "flex",
		flexDirection: "column",
	};

	const listStyle = {
		position: "relative",
		overflow: "auto",
	};

	// const templateComments = [
	// 	{
	// 		user: "McKilla Gorilla",
	// 		comment: "I hate Starbucks 2factor authentication",
	// 		date: "01/01/2023",
	// 	},
	// 	{ user: "User2", comment: "LOL", date: "01/01/2023" },
	// 	{ user: "User3", comment: "Go Touch Grass", date: "01/01/2023" },
	// 	{ user: "User1", comment: "I also hate bro", date: "01/01/2023" },
	// 	{
	// 		user: "User4",
	// 		comment: "What are you guys talking about?? Where's alaska?",
	// 		date: "01/02/2023",
	// 	},
	// ];
	const [comments, setComments] = useState([]);
	const [input, setInput] = useState("");
	//temporary
	async function handleSubmit(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
		const body = formData.get("comment");
		let newComment = {
			id: id,
			body: body
		};
		let res = await publishComment(newComment)
		setComments(res.comments)
		setInput("");
	}
	return (
		<Drawer anchor="bottom" open={open} onClose={handleClose}>
			<Box sx={boxStyle}>
				<List sx={listStyle}>
					<Typography align="left" sx={commentStyle}>
						Comment Section [{comments.length}]
					</Typography>
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
					<Divider sx={divisorStyle} />
					{comments.map((comment) => (
						<Comment data={comment} key={++keyid} />
					))}
					<form onSubmit={handleSubmit}>
						<TextField
							value={input}
							onChange={(e) => setInput(e.target.value)}
							fullWidth
							name="comment"
							id="filled-basic"
							label="Add comment"
							variant="filled"
						/>
					</form>
				</List>
			</Box>
		</Drawer>
	);
}
