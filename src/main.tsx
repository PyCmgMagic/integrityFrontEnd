import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// 导入全局样式
import './styles/global.css'
import './styles/antd-override.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
 </StrictMode>,
)
