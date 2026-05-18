import axios from "axios";

// Creamos la conexión base apuntando a tu backend en Go
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Asegurate de que este sea el puerto de tu Go
});

export default api;