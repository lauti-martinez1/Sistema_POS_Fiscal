import api from "../services/api"

export async function createSale(data) {
  const response = await api.post("/sales", data)
  return response.data
}

export async function getSales() {
  const response = await api.get("/sales")
  return response.data
}