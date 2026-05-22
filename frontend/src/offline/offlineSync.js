import { dbPromise, deleteOfflineSale, getOfflineSales } from "./db"
import api from "../services/api" // Importamos la api directamente

export function startOfflineSync() {
  
  // Función que hace el trabajo de revisar y subir las ventas
  async function realizarSincronizacion() {
    try {
      const offlineSales = await getOfflineSales()
      
      // Si la base de datos del navegador está vacía, no hace nada
      if (offlineSales.length === 0) return

      console.log(`🔄 Detectadas ${offlineSales.length} ventas offline. Intentando sincronizar de fondo...`)

      for (const sale of offlineSales) {
        try {
          console.log(`📤 Subiendo venta guardada localmente...`)

          // Usamos api.post directamente, igual que en el resto de tu app
          await api.post("/sales", sale)

          // Si Go responde que la recibió bien (200 OK), la borramos del navegador
          await deleteOfflineSale(sale.id)

          console.log(`✅ Venta sincronizada con éxito en MySQL Workbench`)
        } catch (err) {
          console.error(`❌ El servidor de Go sigue caído o no responde. Reintentando en 10 segundos...`)
          break 
        }
      }
    } catch (err) {
      console.error("❌ Error crítico en el motor de sincronización:", err)
    }
  }

  // 1. Disparador tradicional por si se corta el Wi-Fi
  window.addEventListener("online", realizarSincronizacion)

  // 2. Revisión automática cada 10 segundos
  setInterval(realizarSincronizacion, 10000)
}