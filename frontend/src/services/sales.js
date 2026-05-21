import api from "./api"

export async function createSales(data) {

  const response = await api.post("/sales", data)

  return response.data
}