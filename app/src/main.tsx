import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Mensajeria from './Mensajeria.tsx'
import { ResetPassword } from './features/auth/ResetPassword.tsx'
import { FirmaPublica } from './features/firma/FirmaPublica.tsx'
import { ImprimirConsentimiento } from './features/imprimir/ImprimirConsentimiento.tsx'
import { InventarioPWA } from './features/inventario/InventarioPWA.tsx'

// Rutas especiales: /mensajeria (PWA kiosko), /inv (PWA inventario),
// /reset (restablecer contraseña), /firma/:token (firma pública) e /imprimir/:token (impresión).
const path = window.location.pathname
const isMensajeria = path.startsWith('/mensajeria')
const isInv = path.startsWith('/inv')
const isReset = path.startsWith('/reset')
const isFirma = path.startsWith('/firma')
const isImprimir = path.startsWith('/imprimir')

if (isMensajeria) {
  const link = document.createElement('link')
  link.rel = 'manifest'
  link.href = '/manifest.webmanifest'
  document.head.appendChild(link)
  document.title = 'Cialo Mensajería'
}

if (isInv) {
  const link = document.createElement('link')
  link.rel = 'manifest'
  link.href = '/inv-manifest.webmanifest'
  document.head.appendChild(link)
  document.title = 'Inventario · Cialo'
}

// Service worker: necesario para Web Push (notificaciones en segundo plano) e instalación PWA.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isImprimir ? <ImprimirConsentimiento /> : isFirma ? <FirmaPublica /> : isReset ? <ResetPassword /> : isInv ? <InventarioPWA /> : isMensajeria ? <Mensajeria /> : <App />}
  </StrictMode>,
)
