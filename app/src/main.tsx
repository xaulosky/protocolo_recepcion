import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Mensajeria from './Mensajeria.tsx'

// La PWA de mensajería vive en /mensajeria; el resto es el sistema completo.
const isMensajeria = window.location.pathname.startsWith('/mensajeria')

if (isMensajeria) {
  const link = document.createElement('link')
  link.rel = 'manifest'
  link.href = '/manifest.webmanifest'
  document.head.appendChild(link)
  document.title = 'Cialo Mensajería'
}

// Service worker: necesario para Web Push (notificaciones en segundo plano) e instalación PWA.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMensajeria ? <Mensajeria /> : <App />}
  </StrictMode>,
)
