import { ListItem, ListItemText, ListItemAvatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Comment(props) {
	const { data } = props;
	const date = data.date || "undefined";
	const user = data.username || "undefined";
	return (
		<ListItem>
			<ListItemAvatar>
				<AccountCircleIcon />
			</ListItemAvatar>
			<ListItemText
				primary={data.body}
				secondary={"by " + user + " | " + date}></ListItemText>
		</ListItem>
	);
}
