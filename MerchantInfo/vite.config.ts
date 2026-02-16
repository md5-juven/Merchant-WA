import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const sheetUrl = env.VITE_GOOGLE_SHEET_WEB_APP_URL

  return {
    plugins: [react()],
    server: {
      proxy: sheetUrl?.startsWith('http')
        ? {
            '/api/sheet': {
              target: sheetUrl,
              changeOrigin: true,
              secure: true,
              // Request must go to .../exec only; don't append /api/sheet to the target
              rewrite: () => '',
            },
          }
        : undefined,
      hmr: {
        overlay: true,
      },
    },
  }
})
