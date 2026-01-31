import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 允许外部访问
    allowedHosts: [
      'localhost',
      '127.0.0.1',
    ],
    // Dev-only: proxy API requests to avoid browser CORS/preflight issues.
    proxy: {
      // With VITE_API_BASE_URL=/api/v1, requests like /api/v1/... will match this rule.
      '/api': {
        target: 'https://daka.sduonline.cn',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
