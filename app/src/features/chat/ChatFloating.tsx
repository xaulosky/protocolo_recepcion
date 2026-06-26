import { createPortal } from 'react-dom';
import { useChat } from './ChatProvider';
import { ChatView } from './ChatView';
import { useApp } from '../../store/app-context';
import { useAuth } from '../../store/auth-context';
import { canView } from '../../lib/permissions';
import { Icon } from '../../lib/icons';

/**
 * Burbuja de chat flotante (abajo a la derecha), disponible en toda la app.
 * Se oculta cuando ya estás en la sección de Chat para no duplicar la UI.
 */
export function ChatFloating() {
  const {
    unread, floatingOpen, setFloatingOpen, activeId, closeConversation,
    conversations, newChatOpen, setNewChatOpen,
  } = useChat();
  const { view } = useApp();
  const { user } = useAuth();

  if (view === 'chat') return null;
  if (!canView(user, 'chat')) return null;

  const activeConv = activeId ? conversations.find((c) => c.id === activeId) : null;
  const enConversacion = Boolean(activeConv);

  return createPortal(
    <div className="no-print" style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      {floatingOpen && (
        <div
          className="fade-up"
          style={{
            width: 'min(384px, calc(100vw - 32px))',
            height: 'min(600px, calc(100dvh - 104px))',
            background: 'var(--surface)', borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.20)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Cabecera única: lista o conversación */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, minHeight: 52,
            padding: '0 12px 0 14px', background: 'var(--primary)', color: '#fff', flexShrink: 0,
          }}>
            {enConversacion ? (
              <>
                <button onClick={closeConversation} title="Volver" style={topBtn}>
                  <Icon name="colL" size={18} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeConv!.titulo}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>
                    {activeConv!.roles.length > 0 ? `Canal · ${activeConv!.members.length} integrantes`
                      : activeConv!.esGrupo ? `${activeConv!.members.length} integrantes` : 'Mensaje directo'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Icon name="msg" size={18} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>Chat interno</span>
                <button onClick={() => setNewChatOpen(!newChatOpen)} title="Nuevo chat" style={topBtn}>
                  <Icon name={newChatOpen ? 'close' : 'plus'} size={17} />
                </button>
              </>
            )}
            <button onClick={() => setFloatingOpen(false)} title="Cerrar" style={topBtn}>
              <Icon name="close" size={17} />
            </button>
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
  width: 30, height: 30, borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.16)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
};
