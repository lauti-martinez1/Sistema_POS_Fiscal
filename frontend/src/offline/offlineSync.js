import { dbPromise, deleteOfflineSale, getOfflineSales } from "./db"
import { createSale } from "./salesOffline"

export function startOfflineSync() {
  
  // 🔄 Función que hace el trabajo de revisar y subir las ventas
  async function realizarSincronizacion() {
    try {
      const offlineSales = await getOfflineSales()
      
      // Si la base de datos del navegador está vacía, no hace nada
      if (offlineSales.length === 0) return

      console.log(`🔄 Detectadas ${offlineSales.length} ventas offline. Intentando sincronizar de fondo...`)

      for (const sale of offlineSales) {
        try {
          console.log(`📤 Subiendo venta guardada localmente...`)

          // Intentamos mandarla al backend de Go
          await createSale(sale)

          // Si Go responde que la recibió bien (200 OK), la borramos del navegador
          await deleteOfflineSale(sale.id)

          console.log(`✅ Venta sincronizada con éxito en MySQL Workbench`)
        } catch (err) {
          // Si Go sigue apagado, va a saltar acá.
          // El sistema NO borra la venta del navegador, permitiendo que lo intente en la próxima vuelta.
          console.error(`❌ El servidor de Go sigue caído o no responde. Reintentando en 10 segundos...`)
          break // Frenamos el bucle para no saturar con errores si el servidor no está listo
        }
      }
    } catch (err) {
      console.error("❌ Error crítico en el motor de sincronización:", err)
    }
  }

  // 1. Por las dudas, mantenemos el disparador tradicional por si se corta el Wi-Fi
  window.addEventListener("online", realizarSincronizacion)

  // 2. SOLUCIÓN LOCAL: Ejecutar una revisión automática cada 10 segundos
  setInterval(realizarSincronizacion, 10000)
}