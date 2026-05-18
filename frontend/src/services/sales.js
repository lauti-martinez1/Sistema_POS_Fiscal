import api from "./api"

export async function getSales(data) {

  const response = await api.post("/sales", data)

  return response.data
}