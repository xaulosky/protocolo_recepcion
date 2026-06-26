import { createPortal } from 'react-dom';
import { useChat } from './ChatProvider';
import { ChatView } from './ChatView';
import { useApp } from '../../store/app-context';
import { Icon } from '../../lib/icons';

/**
 * Burbuja de chat flotante (abajo a la derecha), disponible en toda la app.
 * Se oculta cuando ya estás en la sección de Chat para no duplicar la UI.
 */
export function ChatFloating() {
  const { unread, floatingOpen, setFloatingOpen, activeId, closeConversation } = useChat();
  const { view } = useApp();

  if (view === 'chat') return null;

  return createPortal(
    <div className="no-print" style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      {floatingOpen && (
        <div
          className="fade-up"
          style={{
            width: 'min(372px, calc(100vw - 32px))',
            height: 'min(544px, calc(100vh - 116px))',
            background: 'var(--surface)', borderRadius: 14, overflow: 'hidden',
            border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Barra superior del popup */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', background: 'var(--primary)', color: '#fff', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600 }}>
              <Icon name="msg" size={17} />
              Chat interno
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {activeId && (
                <button onClick={closeConversation} title="Conversaciones" style={topBtn}>
                  <Icon name="menu" size={16} />
                </button>
              )}
              <button onClick={() => setFloatingOpen(false)} title="Cerrar" style={topBtn}>
                <Icon name="close" size={16} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            <ChatView variant="floating" />
          </div>
        </div>
      )}

      {/* Botón burbuja */}
      <button
        onClick={() => setFloatingOpen(!floatingOpen)}
        title={floatingOpen ? 'Cerrar chat' : 'Abrir chat'}
        style={{
          position: 'relative', width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'var(--primary)', color: '#fff', cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(124,98,71,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={floatingOpen ? 'close' : 'msg'} size={24} />
        {!floatingOpen && unread > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2, minWidth: 22, height: 22, padding: '0 6px',
            borderRadius: 11, background: '#E2483D', color: '#fff', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    </div>,
    document.body,
  );
}

const topBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.18)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};
