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
      '.ngrok-free.app', // 允许所有ngrok域名
      '.cpolar.top',
      '.natappfree.cc', // 允许所有natapp免费域名
      'z68d6abb.natappfree.cc', // 允许当前natapp域名
    ]
  }
})
