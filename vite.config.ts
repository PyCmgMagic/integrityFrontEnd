import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split large third-party deps into stable chunks for better caching and smaller entry bundle.
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Core framework
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/react-is/') ||
            id.includes('/scheduler/') ||
            id.includes('/use-sync-external-store/') ||
            id.includes('/loose-envify/') ||
            id.includes('/object-assign/')
          ) {
            return 'react'
          }
          if (id.includes('/react-router/') || id.includes('/react-router-dom/')) return 'router'

          // UI
          if (id.includes('/antd-mobile/')) return 'antd-mobile'
          if (id.includes('/@ant-design/icons/') || id.includes('/@ant-design/icons-svg/')) return 'antd-icons'
          if (
            id.includes('/@rc-component/') ||
            id.includes('/rc-') ||
            id.includes('/async-validator/') ||
            id.includes('/@ant-design/cssinjs/')
          ) {
            return 'rc'
          }
          if (id.includes('/antd/')) return 'antd'

          // Data / utils
          if (id.includes('/axios/')) return 'axios'
          if (id.includes('/zustand/')) return 'zustand'
          if (id.includes('/dayjs/') || id.includes('/moment/')) return 'date'
          if (id.includes('/xlsx/') || id.includes('/file-saver/')) return 'excel'

          // Media / charts / animation
          if (id.includes('/react-google-charts/')) return 'charts'
          if (id.includes('/gsap/')) return 'gsap'

          // Icons
          if (id.includes('/lucide-react/') || id.includes('/react-icons/')) return 'icons'

          return 'vendor'
        },
      },
    },
  },
  server: {
    host: true, // 允许外部访问
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app', // 允许所有 ngrok 域名
      '.cpolar.top',
      '.natappfree.cc', // 允许所有 natapp 免费域名
      'z68d6abb.natappfree.cc', // 允许当前 natapp 域名
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
