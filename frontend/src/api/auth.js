import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: import.meta.env.VITE_AUTH_API,
});

export default api;