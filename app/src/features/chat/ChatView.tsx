import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { useChat } from './ChatProvider';
import { useAuth } from '../../store/auth-context';
import { Icon } from '../../lib/icons';
import { colorFromString, initials } from '../../lib/format';
import type { ChatMessage, ChatUser, Conversation } from '../../lib/types';

type Variant = 'full' | 'floating' | 'kiosk';

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function diaLabel(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, hoy)) return 'Hoy';
  if (sameDay(d, ayer)) return 'Ayer';
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
}

function Avatar({ name, size = 36, grupo = false, canal = false }: { name: string; size?: number; grupo?: boolean; canal?: boolean }) {
  const especial = grupo || canal;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: canal ? 9 : '50%', flexShrink: 0,
        background: especial ? 'var(--primary-soft-2)' : colorFromString(name),
        color: especial ? 'var(--primary)' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36, fontWeight: 600, letterSpacing: 0.2,
      }}
    >
      {canal ? <Icon name="hash" size={size * 0.5} /> : grupo ? <Icon name="users" size={size * 0.5} /> : initials(name)}
    </div>
  );
}

const esCanal = (c: { roles: string[] }) => c.roles.length > 0;

// ───────────────────────── Lista de conversaciones ─────────────────────────

function ConversationList({ variant }: { variant: Variant }) {
  const { conversations, activeId, openConversation, newChatOpen, setNewChatOpen } = useChat();
  const floating = variant === 'floating';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* En la flotante la cabecera la pone el popup; aquí solo en sección/kiosko. */}
      {!floating && (
        <div style={{
          padding: '12px 14px', borderBottom: '1px solid var(--border-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Mensajes</span>
          <button
            onClick={() => setNewChatOpen(!newChatOpen)}
            title="Nuevo chat"
            style={{
              width: 28, height: 28, borderRadius: 7, border: '1px solid var(--cream-border)',
              background: newChatOpen ? 'var(--primary)' : 'var(--primary-soft)',
              color: newChatOpen ? '#fff' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Icon name={newChatOpen ? 'close' : 'plus'} size={15} />
          </button>
        </div>
      )}

      {newChatOpen && <NewChatPanel onDone={() => setNewChatOpen(false)} />}

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {conversations.length === 0 && !newChatOpen && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted-2)', fontSize: 13 }}>
            No tienes conversaciones aún.<br />Toca <strong>＋</strong> para empezar una.
          </div>
        )}
        {conversations.map((c) => (
          <ConversationRow
            key={c.id}
            c={c}
            active={c.id === activeId}
            onClick={() => openConversation(c.id)}
            compact={variant === 'floating'}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationRow({ c, active, onClick, compact }: {
  c: Conversation; active: boolean; onClick: () => void; compact: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left',
        padding: compact ? '10px 12px' : '11px 14px', border: 'none', cursor: 'pointer',
        background: active ? 'var(--primary-soft)' : hover ? 'var(--surface-soft)' : 'transparent',
        borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
      }}
    >
      <Avatar name={c.titulo} size={compact ? 34 : 38} grupo={c.esGrupo && !esCanal(c)} canal={esCanal(c)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.titulo}
          </span>
          {c.ultimoMensaje && (
            <span style={{ fontSize: 11, color: 'var(--muted-3)', flexShrink: 0 }}>{hhmm(c.ultimoMensaje.createdAt)}</span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.ultimoMensaje
              ? `${c.esGrupo ? c.ultimoMensaje.autorNombre.split(' ')[0] + ': ' : ''}${c.ultimoMensaje.contenido}`
              : 'Sin mensajes'}
          </span>
          {c.unread > 0 && (
            <span style={{
              flexShrink: 0, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
              background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {c.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ───────────────────────── Panel "nuevo chat" ─────────────────────────

type Modo = 'dm' | 'grupo' | 'canal';
const ROLES_CANAL: { value: string; label: string }[] = [
  { value: 'ADMIN', label: 'Administradores' },
  { value: 'RECEPCION', label: 'Recepción' },
  { value: 'PROFESIONAL', label: 'Profesionales' },
  { value: 'LECTURA', label: 'Solo lectura' },
];

function NewChatPanel({ onDone }: { onDone: () => void }) {
  const { users, startDm, createGroup, createChannel } = useChat();
  const { hasRole } = useAuth();
  const esAdmin = hasRole('ADMIN');

  const [modo, setModo] = useState<Modo>('dm');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [nombre, setNombre] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const filtrados = useMemo(
    () => users.filter((u) => u.nombre.toLowerCase().includes(q.toLowerCase())),
    [users, q],
  );

  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleRole = (r: string) =>
    setRoles((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]));
  const todoElEquipo = roles.length === ROLES_CANAL.length;

  const onDm = async (u: ChatUser) => {
    setBusy(true);
    try { await startDm(u.id); onDone(); } finally { setBusy(false); }
  };
  const onCrearGrupo = async () => {
    if (!nombre.trim() || sel.length === 0) return;
    setBusy(true);
    try { await createGroup(nombre.trim(), sel); onDone(); } finally { setBusy(false); }
  };
  const onCrearCanal = async () => {
    if (!nombre.trim() || roles.length === 0) return;
    setBusy(true);
    try { await createChannel(nombre.trim(), roles); onDone(); } finally { setBusy(false); }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--border-soft)', background: 'var(--surface-soft)', padding: 12 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button onClick={() => setModo('dm')} style={tabStyle(modo === 'dm')}>Directo</button>
        <button onClick={() => setModo('grupo')} style={tabStyle(modo === 'grupo')}>Grupo</button>
        {esAdmin && <button onClick={() => setModo('canal')} style={tabStyle(modo === 'canal')}>Canal</button>}
      </div>

      {/* ── Canal por rol ── */}
      {modo === 'canal' ? (
        <>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del canal (ej. Recepción)" style={inputStyle} />
          <div style={{ fontSize: 11.5, color: 'var(--muted-2)', margin: '8px 2px 6px' }}>
            ¿Quiénes pertenecen al canal? Todos los usuarios de los roles elegidos podrán escribir y recibir.
          </div>
          {ROLES_CANAL.map((r) => (
            <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>
              <input type="checkbox" checked={roles.includes(r.value)} onChange={() => toggleRole(r.value)} />
              {r.label}
            </label>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--primary)', borderTop: '1px solid var(--border-soft)', marginTop: 4 }}>
            <input type="checkbox" checked={todoElEquipo} onChange={(e) => setRoles(e.target.checked ? ROLES_CANAL.map((r) => r.value) : [])} />
            Todo el equipo
          </label>
          <button
            onClick={onCrearCanal}
            disabled={busy || !nombre.trim() || roles.length === 0}
            className="btn-primary"
            style={{ width: '100%', marginTop: 8, padding: '8px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (!nombre.trim() || roles.length === 0) ? 0.5 : 1 }}
          >
            Crear canal
          </button>
        </>
      ) : (
        <>
          {modo === 'grupo' && (
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del grupo" style={inputStyle} />
          )}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar persona…"
            style={{ ...inputStyle, marginTop: modo === 'grupo' ? 6 : 0 }}
          />
          <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: 6 }}>
            {filtrados.map((u) => {
              const checked = sel.includes(u.id);
              return (
                <button
                  key={u.id}
                  disabled={busy}
                  onClick={() => (modo === 'grupo' ? toggle(u.id) : onDm(u))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px',
                    border: 'none', background: checked ? 'var(--primary-soft)' : 'transparent',
                    borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <Avatar name={u.nombre} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{u.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>{u.role}</div>
                  </div>
                  {modo === 'grupo' && checked && <Icon name="check" size={15} style={{ color: 'var(--primary)' }} />}
                </button>
              );
            })}
            {filtrados.length === 0 && (
              <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--muted-2)' }}>Sin resultados</div>
            )}
          </div>

          {modo === 'grupo' && (
            <button
              onClick={onCrearGrupo}
              disabled={busy || !nombre.trim() || sel.length === 0}
              className="btn-primary"
              style={{ width: '100%', marginTop: 8, padding: '8px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (!nombre.trim() || sel.length === 0) ? 0.5 : 1 }}
            >
              Crear grupo ({sel.length})
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ───────────────────────── Hilo de mensajes ─────────────────────────

function MessageThread({ variant }: { variant: Variant }) {
  const { conversations, activeId, messages, myId, send, loadingMessages } = useChat();
  const conv = conversations.find((c) => c.id === activeId);
  const [texto, setTexto] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo cuando llegan mensajes (si ya estaba cerca del fondo).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cerca = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (cerca) endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Al abrir una conversación, ir al fondo.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeId]);

  const onSubmit = () => {
    const t = texto.trim();
    if (!t) return;
    setTexto('');
    send(t);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (!conv) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-2)', fontSize: 13, padding: 24, textAlign: 'center' }}>
        Selecciona una conversación para empezar a chatear.
      </div>
    );
  }

  const canal = esCanal(conv);
  const subtitulo = canal
    ? `Canal · ${conv.members.length} integrantes`
    : conv.esGrupo
    ? `${conv.members.length} integrantes`
    : conv.members.find((m) => m.id !== myId)?.role ?? '';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, background: 'var(--surface)' }}>
      {/* Header — en la flotante lo provee el popup, aquí solo en sección/kiosko. */}
      {variant !== 'floating' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderBottom: '1px solid var(--border-soft)', flexShrink: 0,
        }}>
          <Avatar name={conv.titulo} size={34} grupo={conv.esGrupo && !canal} canal={canal} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.titulo}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>{subtitulo}</div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', minHeight: 0, background: 'var(--surface-soft)' }}>
        {loadingMessages && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--muted-2)', fontSize: 12, padding: 16 }}>Cargando…</div>
        )}
        <MessageList messages={messages} myId={myId} grupo={conv.esGrupo} />
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: 10, borderTop: '1px solid var(--border-soft)', flexShrink: 0 }}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={onKey}
          placeholder="Escribe un mensaje…"
          rows={1}
          style={{
            flex: 1, resize: 'none', maxHeight: 110, padding: '9px 12px', fontSize: 13.5,
            border: '1px solid var(--border)', borderRadius: 18, outline: 'none',
            fontFamily: 'inherit', lineHeight: 1.4, background: 'var(--surface)', color: 'var(--text)',
          }}
        />
        <button
          onClick={onSubmit}
          disabled={!texto.trim()}
          title="Enviar"
          style={{
            width: 38, height: 38, flexShrink: 0, borderRadius: '50%', border: 'none',
            background: texto.trim() ? 'var(--primary)' : 'var(--border)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: texto.trim() ? 'pointer' : 'default', transition: 'background .15s',
          }}
        >
          <Icon name="msg" size={17} />
        </button>
      </div>
    </div>
  );
}

function MessageList({ messages, myId, grupo }: { messages: ChatMessage[]; myId: string | null; grupo: boolean }) {
  const nodes: React.ReactNode[] = [];
  let lastDay = '';
  messages.forEach((m, i) => {
    const day = diaLabel(m.createdAt);
    if (day !== lastDay) {
      lastDay = day;
      nodes.push(
        <div key={`d-${m.id}`} style={{ textAlign: 'center', margin: '10px 0' }}>
          <span style={{ fontSize: 11, color: 'var(--muted-2)', background: 'var(--surface)', padding: '3px 10px', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
            {day}
          </span>
        </div>,
      );
    }
    const mine = m.autor.id === myId;
    const prev = messages[i - 1];
    const agrupado = prev && prev.autor.id === m.autor.id && diaLabel(prev.createdAt) === day;
    nodes.push(<Bubble key={m.id} m={m} mine={mine} grupo={grupo} agrupado={!!agrupado} />);
  });
  return <>{nodes}</>;
}

function Bubble({ m, mine, grupo, agrupado }: { m: ChatMessage; mine: boolean; grupo: boolean; agrupado: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: agrupado ? 2 : 8 }}>
      <div style={{ maxWidth: '78%' }}>
        {grupo && !mine && !agrupado && (
          <div style={{ fontSize: 11, fontWeight: 600, color: colorFromString(m.autor.nombre), margin: '0 0 2px 10px' }}>
            {m.autor.nombre}
          </div>
        )}
        <div
          style={{
            padding: '7px 11px', borderRadius: 14,
            borderBottomRightRadius: mine ? 4 : 14,
            borderBottomLeftRadius: mine ? 14 : 4,
            background: mine ? 'var(--primary)' : 'var(--surface)',
            color: mine ? '#fff' : 'var(--text)',
            border: mine ? 'none' : '1px solid var(--border-soft)',
            fontSize: 13.5, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}
        >
          {m.contenido}
          <span style={{ fontSize: 10, opacity: 0.65, marginLeft: 8, float: 'right', marginTop: 4 }}>
            {hhmm(m.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Contenedor reutilizable ─────────────────────────

export function ChatView({ variant }: { variant: Variant }) {
  const { activeId } = useChat();

  if (variant === 'floating') {
    return activeId
      ? <MessageThread variant="floating" />
      : <ConversationList variant="floating" />;
  }

  // En kiosko (PWA) ocupa todo el alto disponible del contenedor; en sección, alto fijo.
  const kiosk = variant === 'kiosk';
  return (
    <div style={{
      display: 'flex', height: kiosk ? '100%' : 'calc(100vh - 132px)', background: 'var(--surface)',
      border: kiosk ? 'none' : '1px solid var(--border)',
      borderRadius: kiosk ? 0 : 'var(--radius-card)', overflow: 'hidden', minHeight: 0,
    }}>
      <div style={{ width: kiosk ? 320 : 300, borderRight: '1px solid var(--border-soft)', flexShrink: 0 }}>
        <ConversationList variant={variant} />
      </div>
      <MessageThread variant={variant} />
    </div>
  );
}

// ───────────────────────── estilos compartidos ─────────────────────────

const inputStyle: CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid var(--border)',
  borderRadius: 7, outline: 'none', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text)',
};


function tabStyle(active: boolean): CSSProperties {
  return {
    flex: 1, padding: '6px', fontSize: 12.5, fontWeight: 600, borderRadius: 6, cursor: 'pointer',
    border: '1px solid var(--cream-border)',
    background: active ? 'var(--primary)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--muted)',
  };
}
