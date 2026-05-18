import { createSale } from "../services/sales"
import { saveOfflineSale } from "../services/db"
import useCartStore from "../store/useCartStore"
import toast from "react-hot-toast"
import { printTicket } from "../utils/printTicket"
import { X } from "lucide-react"

function CartSidebar({ cart, total }) {
  const {
    clearCart,
    removeFromCart,
  } = useCartStore()

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Carrito vacío")
      return
    }

    try {
      const saleData = {
        total: parseFloat(total.toFixed(2)),
        payment_type: "cash",
        items: cart,
        created_at: new Date(),
      }

      // Intentar guardar en el servidor
      if (navigator.onLine) {
        await createSale(saleData)
        toast.success("✅ Venta realizada")
      } else {
        // Si está offline, guardar en IndexedDB
        await saveOfflineSale(saleData)
        toast.success("💾 Venta guardada localmente")
      }

      // Imprimir ticket
      printTicket(cart, total)

      // Limpiar carrito
      clearCart()
    } catch (err) {
      console.error(err)
      toast.error("❌ Error al procesar venta")

      // Guardar offline como fallback
      try {
        await saveOfflineSale({
          total: parseFloat(total.toFixed(2)),
          payment_type: "cash",
          items: cart,
          created_at: new Date(),
        })
        toast.success("💾 Venta guardada para sincronizar")
        clearCart()
      } catch (dbErr) {
        toast.error("Error grave al guardar venta")
      }
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow p-6 sticky top-4 h-fit">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Carrito ({cart.length})
      </h2>

      <div className="space-y-4 max-h-[500px] overflow-auto">
        {cart.map((item) => (
          <div
            key={item.ID}
            className="border-b border-zinc-700 pb-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white">
                  {item.name}
                </p>

                <p className="text-sm text-zinc-400">
                  {item.quantity} x ${item.price.toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="font-bold text-green-400">
                  ${(item.quantity * item.price).toFixed(2)}
                </div>

                <button
                  onClick={() => {
                    removeFromCart(item.ID)
                    toast.success("Item eliminado")
                  }}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-zinc-700 pt-4">
        <h3 className="text-4xl font-bold mb-4 text-green-400">
          ${total.toFixed(2)}
        </h3>

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-400 transition text-white w-full py-4 rounded-2xl text-xl font-bold"
        >
          {navigator.onLine ? "💳 COBRAR" : "💾 GUARDAR"}
        </button>
      </div>
    </div>
  )
}

export default CartSidebar