import { useEffect, useState } from "react"
import api from "../services/api"
import toast from "react-hot-toast"

function DashboardPage() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          api.get("/sales"), // Pedimos las ventas correctamente con GET
          api.get("/products"),
        ])

        setSales(salesRes.data || [])
        setProducts(productsRes.data || [])
      } catch (err) {
        console.error(err)
        toast.error("Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalRevenue = sales.reduce((acc, sale) => {
    // Agregamos sale.total (minúscula) por cómo lo devuelve Go normalmente
    return acc + (sale.total || sale.Total || 0) 
  }, 0)

  const totalSales = sales.length

  const averageSale =
    totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-2xl text-gray-600">
          Cargando datos...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-5xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Ventas
          </p>

          <h2 className="text-5xl font-bold">
            {totalSales}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Facturación Total
          </p>

          <h2 className="text-5xl font-bold">
            ${totalRevenue.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Ticket Promedio
          </p>

          <h2 className="text-5xl font-bold">
            ${averageSale}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 mb-2">
            Productos
          </p>

          <h2 className="text-5xl font-bold">
            {products.length}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-6">
            Últimas Ventas
          </h2>

          <div className="space-y-4 max-h-[400px] overflow-auto">
            {sales.length > 0 ? (
              sales
                .slice()
                .reverse()
                .slice(0, 10)
                .map((sale) => (
                  <div
                    key={sale.ID}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <p className="font-semibold">
                        Venta #{sale.ID}
                      </p>

                      <p className="text-sm text-gray-500">
                        {new Date(
                          sale.CreatedAt
                        ).toLocaleString("es-AR")}
                      </p>
                    </div>

                    <div className="font-bold text-green-600">
                      ${(sale.total || sale.Total || 0).toFixed(2)}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">
                No hay ventas registradas
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold mb-6">
            Productos Disponibles
          </h2>

          <div className="space-y-4 max-h-[400px] overflow-auto">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.ID}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div>
                    <p className="font-semibold">
                      {product.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </p>
                  </div>

                  <div className="font-bold">
                    ${product.price?.toFixed(2) || "0.00"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No hay productos registrados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage