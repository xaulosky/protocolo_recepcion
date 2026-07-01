import { useState } from 'react';
import type { ComponentType } from 'react';
import { AppProvider, useApp } from './store/app-context';
import { AuthProvider, useAuth } from './store/auth-context';
import { Login } from './features/auth/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { GlobalSearch } from './components/GlobalSearch';
import { useGlobalSearch } from './hooks/useGlobalSearch';

import { Dashboard } from './features/Dashboard';
import { Tareas } from './features/tareas/Tareas';
import { Chat } from './features/chat/Chat';
import { ChatProvider } from './features/chat/ChatProvider';
import { ChatFloating } from './features/chat/ChatFloating';
import { Protocolos } from './features/Protocolos';
import { Guiones } from './features/Guiones';
import { Pagos } from './features/Pagos';
import { Suspensiones } from './features/Suspensiones';
import { Pacientes } from './features/pacientes/Pacientes';
import { Tratamientos } from './features/Tratamientos';
import { Profesionales } from './features/Profesionales';
import { Consultas } from './features/Consultas';
import { Boxes } from './features/Boxes';
import { Cirugias } from './features/cirugias/Cirugias';
import { Inventario } from './features/inventario/Inventario';
import { Productos } from './features/Productos';
import { Presupuestos } from './features/Presupuestos';
import { GiftCards } from './features/GiftCards';
import { Consentimientos } from './features/Consentimientos';
import { Faq } from './features/Faq';
import { Reembolso } from './features/Reembolso';
import { Reportes } from './features/Reportes';
import { Usuarios } from './features/usuarios/Usuarios';
import { AdminPanel } from './features/admin/AdminPanel';
import { Honorarios } from './features/honorarios/Honorarios';
import type { ViewId } from './lib/nav';
import { canView } from './lib/permissions';

const VIEWS: Record<ViewId, ComponentType> = {
  dashboard: Dashboard,
  tareas: Tareas,
  chat: Chat,
  protocolos: Protocolos,
  guiones: Guiones,
  pagos: Pagos,
  suspensiones: Suspensiones,
  pacientes: Pacientes,
  tratamientos: Tratamientos,
  profesionales: Profesionales,
  consultas: Consultas,
  boxes: Boxes,
  cirugias: Cirugias,
  inventario: Inventario,
  productos: Productos,
  presupuestos: Presupuestos,
  giftcards: GiftCards,
  consentimientos: Consentimientos,
  faq: Faq,
  reembolso: Reembolso,
  reportes: Reportes,
  usuarios: Usuarios,
  admin: AdminPanel,
  honorarios: Honorarios,
};

function Shell() {
  const { view } = useApp();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: searchOpen, setOpen: setSearchOpen } = useGlobalSearch();

  const allowed = canView(user, view);
  const ViewComponent = VIEWS[view];
  const marginLeft = collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <div
        className="main-area"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft, transition: 'margin-left .25s ease', overflow: 'hidden', minWidth: 0 }}
      >
        <Header onOpenMobile={() => setMobileOpen(m => !m)} onOpenSearch={() => setSearchOpen(true)} />
        <main style={{ flex: 1, overflowY: view === 'chat' ? 'hidden' : 'auto', padding: view === 'chat' ? 0 : 24, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {allowed
            ? <ViewComponent />
            : <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-2)', fontSize: 14 }}>No tienes acceso a esta sección.</div>}
        </main>
      </div>
      <Toast />
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
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
