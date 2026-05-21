import axios from "axios";

// conexión base apuntando al backend en Go
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export default api;
