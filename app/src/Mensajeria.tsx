import { AuthProvider, useAuth } from './store/auth-context';
import { Login } from './features/auth/Login';
import { ChatProvider, useChat } from './features/chat/ChatProvider';
import { ChatView } from './features/chat/ChatView';
import { Icon } from './lib/icons';
import { initials } from './lib/format';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador', RECEPCION: 'Recepción', PROFESIONAL: 'Profesional', LECTURA: 'Solo lectura',
};

function Kiosk() {
  const { user, logout } = useAuth();
  const { alertsEnabled, enableAlerts } = useChat();

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Barra superior */}
      <header style={{
        height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px', background: 'var(--primary)', color: '#fff',
      }}>
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="msg" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.1 }}>Cialo Mensajería</div>
          <div style={{ fontSize: 11.5, opacity: 0.85 }}>Clínica Cialo</div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.nombre}</div>
              <div style={{ fontSize: 10.5, opacity: 0.85 }}>{ROLE_LABEL[user.role] ?? user.role}</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              {initials(user.nombre)}
            </div>
            <button onClick={logout} title="Cerrar sesión" style={headerBtn}>
              <Icon name="logout" size={17} />
            </button>
          </div>
        )}
      </header>

      {/* Aviso para activar alertas */}
      {!alertsEnabled && (
        <button
          onClick={enableAlerts}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            padding: '11px 16px', background: '#FDF4E7', color: 'var(--primary-dark)', border: 'none',
            borderBottom: '1px solid var(--cream-border)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
          }}
        >
          <Icon name="bell" size={17} />
          Activar sonido y notificaciones de mensajes
        </button>
      )}

      {/* Chat a pantalla completa */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatView variant="kiosk" />
      </div>
    </div>
  );
}

function MensajeriaGate() {
  const { status } = useAuth();
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>
        Cargando…
      </div>
    );
  }
  if (status === 'unauthenticated') return <Login />;
  return (
    <ChatProvider>
      <Kiosk />
    </ChatProvider>
  );
}

export default function Mensajeria() {
  return (
    <AuthProvider>
      <MensajeriaGate />
    </AuthProvider>
  );
}

const headerBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.18)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 2,
};
