import { create } from "zustand"
import { persist } from "zustand/middleware"

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const cart = get().cart

        const existing = cart.find(
          (item) => item.ID === product.ID
        )

        if (existing) {
          set({
            cart: cart.map((item) =>
              item.ID === product.ID
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item
            ),
          })

          return
        }

        set({
          cart: [
            ...cart,
            {
              ...product,
              quantity: 1,
            },
          ],
        })
      },

      // ¡Acá agregamos la nueva función para el botón "-"!
      decreaseQuantity: (id) => {
        const cart = get().cart
        const existing = cart.find((item) => item.ID === id)

        if (existing) {
          // Reutilizamos tu updateQuantity pasándole la cantidad actual menos 1
          get().updateQuantity(id, existing.quantity - 1)
        }
      },

      removeFromCart: (id) => {
        set({
          cart: get().cart.filter(
            (item) => item.ID !== id
          ),
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id)
          return
        }

        set({
          cart: get().cart.map((item) =>
            item.ID === id
              ? { ...item, quantity }
              : item
          ),
        })
      },

      clearCart: () => {
        set({ cart: [] })
      },
    }),

    {
      name: "cart-storage",
    }
  )
)

export default useCartStore