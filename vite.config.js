import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/OneDoor/',
  plugins: [react()],
  server: {
    // The Gemini key lives in the API server, not the browser. Same-origin calls, no CORS.
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
})
