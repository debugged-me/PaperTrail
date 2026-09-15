import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/PaperTrail/api': {
        target: 'http://localhost',
        changeOrigin: true,
      },
      '/PaperTrail/uploads': {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
