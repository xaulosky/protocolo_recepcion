import { useState } from 'react';
import type { ComponentType } from 'react';
import { AppProvider, useApp } from './store/app-context';
import { AuthProvider, useAuth } from './store/auth-context';
import { Login } from './features/auth/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';

import { Dashboard } from './features/Dashboard';
import { Tareas } from './features/tareas/Tareas';
import { Chat } from './features/chat/Chat';
import { ChatProvider } from './features/chat/ChatProvider';
import { ChatFloating } from './features/chat/ChatFloating';
import { Protocolos } from './features/Protocolos';
import { Guiones } from './features/Guiones';
import { Pagos } from './features/Pagos';
import { Suspensiones } from './features/Suspensiones';
import { Tratamientos } from './features/Tratamientos';
import { Profesionales } from './features/Profesionales';
import { Consultas } from './features/Consultas';
import { Boxes } from './features/Boxes';
import { Productos } from './features/Productos';
import { Presupuestos } from './features/Presupuestos';
import { GiftCards } from './features/GiftCards';
import { Consentimientos } from './features/Consentimientos';
import { Faq } from './features/Faq';
import { Reembolso } from './features/Reembolso';
import type { ViewId } from './lib/nav';

const VIEWS: Record<ViewId, ComponentType> = {
  dashboard: Dashboard,
  tareas: Tareas,
  chat: Chat,
  protocolos: Protocolos,
  guiones: Guiones,
  pagos: Pagos,
  suspensiones: Suspensiones,
  tratamientos: Tratamientos,
  profesionales: Profesionales,
  consultas: Consultas,
  boxes: Boxes,
  productos: Productos,
  presupuestos: Presupuestos,
  giftcards: GiftCards,
  consentimientos: Consentimientos,
  faq: Faq,
  reembolso: Reembolso,
};

function Shell() {
  const { view } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ViewComponent = VIEWS[view];
  const marginLeft = collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className="main-area"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft, transition: 'margin-left .25s ease', overflow: 'hidden', minWidth: 0 }}
      >
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <ViewComponent />
        </main>
      </div>
      <Toast />
    </div>
  );
}

function Gate() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>
        Cargando…
      </div>
    );
  }
  if (status === 'unauthenticated') return <Login />;

  return (
    <AppProvider>
      <ChatProvider>
        <Shell />
        <ChatFloating />
      </ChatProvider>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
