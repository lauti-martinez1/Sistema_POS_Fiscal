import axios from "axios";

// conexión base apuntando al backend en Go
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export default api;