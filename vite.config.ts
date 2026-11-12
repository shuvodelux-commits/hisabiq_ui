import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Relative assets preserve the existing portable UI preview and GitHub Pages build.
// Only explicit connected development proxies API requests to the disposable local Nest app.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const connected = env.VITE_HISABIQ_INTEGRATION_MODE === 'connected'
  return {
    base: './',
    plugins: [react()],
    server: connected
      ? {
          proxy: {
            '/api/v1': {
              target: 'http://127.0.0.1:3000',
              changeOrigin: false,
            },
          },
        }
      : undefined,
  }
})
