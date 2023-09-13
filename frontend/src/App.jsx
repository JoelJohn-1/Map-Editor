import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./contexts/auth";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Homescreen from "./components/Homescreen";
import HomeWrapper from "./components/HomeWrapper";
import MapsWrapper from "./components/MapsWrapper";
import MapWrapper from "./components/MapWrapper";
import GraphicsEditorWrapper from "./components/GraphicsEditorWrapper";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import MapEditorScreenPublic from "./components/MapEditorScreenPublic";
import GraphicsEditorScreenPublic from "./components/GraphicsEditorScreenPublic";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			refetchOnReconnect: false,
			retry: false,
			staleTime: 0,
		},
	},
});

const darkTheme = createTheme({
	palette: {
		background: {
			default: "#0E0E13",
			paper: "#0E0E13",
		},
		text: {
			primary: "#EEE",
			secondary: "#AAA",
		},
		divider: "#2F2F2F",
	},
});

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<QueryClientProvider client={queryClient}>
					<AuthContextProvider>
						<ThemeProvider theme={darkTheme}>
							<Routes>
								<Route path="/" element={<Homescreen />} />
								<Route path="/user" element={<HomeWrapper />} />
								<Route path="/maps" element={<MapsWrapper />} />
								<Route path="/map/:id" element={<MapWrapper />} />
								<Route path="/editor/:id" element={<GraphicsEditorWrapper />} />
								<Route path="/public/map/:id" element={<MapEditorScreenPublic />} />
								<Route path="/public/editor/:id" element={<GraphicsEditorScreenPublic />} />
								<Route path="resetpassword" element={<ResetPasswordScreen />} />
							</Routes>
						</ThemeProvider>
					</AuthContextProvider>
					<ReactQueryDevtools />
				</QueryClientProvider>
			</BrowserRouter>
		</div>
	);
}

export default App;
