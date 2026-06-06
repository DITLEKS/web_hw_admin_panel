import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminUrl   = env.VITE_ADMIN_API_URL   || 'http://localhost:3003'
  const ordersUrl  = env.VITE_ORDERS_API_URL  || 'http://localhost:3002'
  const catalogUrl = env.VITE_CATALOG_API_URL || 'http://localhost:3001'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/v1/auth':       { target: adminUrl,   changeOrigin: true },
        '/api/v1/dashboard':  { target: adminUrl,   changeOrigin: true },
        '/api/v1/orders':     { target: ordersUrl,  changeOrigin: true },
        '/api/v1/products':   { target: catalogUrl, changeOrigin: true },
        '/api/v1/categories': { target: catalogUrl, changeOrigin: true },
      },
    },
  }
})