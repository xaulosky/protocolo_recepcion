import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Mensajeria from './Mensajeria.tsx'
import { ResetPassword } from './features/auth/ResetPassword.tsx'
import { FirmaPublica } from './features/firma/FirmaPublica.tsx'

// Rutas especiales: /mensajeria (PWA kiosko), /reset (restablecer contraseña)
// y /firma/:token (firma pública del paciente, sin sesión).
const path = window.location.pathname
const isMensajeria = path.startsWith('/mensajeria')
const isReset = path.startsWith('/reset')
const isFirma = path.startsWith('/firma')

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
    {isFirma ? <FirmaPublica /> : isReset ? <ResetPassword /> : isMensajeria ? <Mensajeria /> : <App />}
  </StrictMode>,
)
