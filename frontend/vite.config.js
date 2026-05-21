import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', 
      injectRegister: 'inline',
      manifest: {
        name: 'Rotisería UDA - Sistema POS',
        short_name: 'Rotisería POS',
        description: 'Sistema de Punto de Venta Fiscal para Rotisería UDA',
        theme_color: '#09090b', 
        background_color: '#09090b', // Color de fondo al abrir la app
        display: 'standalone', // Abre a pantalla completa sin barra de navegador
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' 
          }
        ]
      }
    })
  ],
})