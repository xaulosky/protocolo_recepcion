import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { useChat } from './ChatProvider';
import { useAuth } from '../../store/auth-context';
import { Icon } from '../../lib/icons';
import { api } from '../../lib/api';
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

function Avatar({ name, size = 36, grupo = false, canal = false, buzon = false }: { name: string; size?: number; grupo?: boolean; canal?: boolean; buzon?: boolean }) {
  const especial = grupo || canal || buzon;
  const cuadrado = canal || buzon; // canales y buzones: cuadrado redondeado
  return (
    <div
      style={{
        width: size, height: size, borderRadius: cuadrado ? 9 : '50%', flexShrink: 0,
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', minHeight: 0, minWidth: 0 }}>
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

      {newChatOpen ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <NewChatPanel onDone={() => setNewChatOpen(false)} />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {conversations.length === 0 && (
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
      )}
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
      <Avatar name={c.titulo} size={compact ? 34 : 38} grupo={c.esGrupo && !esCanal(c) && !c.esBuzon} canal={esCanal(c)} buzon={c.esBuzon} />
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
          <div style={{ marginTop: 6 }}>
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
  const { conversations, activeId, messages, myId, send, loadingMessages, refreshMessages } = useChat();
  const conv = conversations.find((c) => c.id === activeId);
  const [texto, setTexto] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; contenido: string; autorNombre: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Search state ──
  const [searchActive, setSearchActive] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback((q: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get<{ messages: ChatMessage[] }>(
          `/chat/search?q=${encodeURIComponent(q)}${activeId ? `&conversationId=${activeId}` : ''}`
        );
        setSearchResults(res.messages);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 350);
  }, [activeId]);

  const toggleSearch = () => {
    setSearchActive((prev) => !prev);
    setSearchQ('');
    setSearchResults([]);
  };

  // ── Reactions ──
  const handleReact = useCallback(async (messageId: string, emoji: string) => {
    try {
      await api.post(`/chat/messages/${messageId}/react`, { emoji });
      refreshMessages();
    } catch { /* silencioso */ }
  }, [refreshMessages]);

  // ── Edit / Delete / Reply ──
  const handleEdit = useCallback(() => {
    refreshMessages();
  }, [refreshMessages]);

  const handleDelete = useCallback(async (messageId: string) => {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.del(`/chat/messages/${messageId}`);
      refreshMessages();
    } catch { /* silencioso */ }
  }, [refreshMessages]);

  const handleReply = useCallback((m: ChatMessage) => {
    setReplyTo({ id: m.id, contenido: m.contenido, autorNombre: m.autor.nombre });
  }, []);

  const sendWithReply = useCallback(async (contenido: string, parentId: string | null) => {
    if (!activeId) return;
    if (parentId) {
      try {
        await api.post(`/chat/conversations/${activeId}/messages`, { contenido, parentId });
        refreshMessages();
      } catch { /* silencioso */ }
    } else {
      send(contenido);
    }
  }, [activeId, send, refreshMessages]);

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
    sendWithReply(t, replyTo?.id ?? null);
    setReplyTo(null);
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
  const buzon = conv.esBuzon;
  const subtitulo = buzon
    ? 'Buzón de recepción'
    : canal
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
          <Avatar name={conv.titulo} size={34} grupo={conv.esGrupo && !canal && !buzon} canal={canal} buzon={buzon} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.titulo}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>{subtitulo}</div>
          </div>
          <button
            onClick={toggleSearch}
            title={searchActive ? 'Cerrar búsqueda' : 'Buscar mensajes'}
            style={{
              width: 30, height: 30, borderRadius: 7, border: '1px solid var(--cream-border)',
              background: searchActive ? 'var(--primary)' : 'var(--primary-soft)',
              color: searchActive ? '#fff' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Icon name={searchActive ? 'close' : 'search'} size={14} />
          </button>
        </div>
      )}

      {/* Search panel */}
      {searchActive && variant !== 'floating' && (
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg)', flexShrink: 0 }}>
          <input
            autoFocus
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); doSearch(e.target.value); }}
            placeholder="Buscar en mensajes…"
            style={{ ...inputStyle, width: '100%' }}
          />
          {searchLoading && <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 6 }}>Buscando…</div>}
          {!searchLoading && searchQ.length >= 2 && searchResults.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 6 }}>Sin resultados</div>
          )}
          {searchResults.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
              {searchResults.map((m) => (
                <div key={m.id} style={{ padding: '7px 10px', borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border-soft)', fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: colorFromString(m.autor.nombre) }}>{m.autor.nombre}: </span>
                  <span style={{ color: 'var(--text)' }}>{m.contenido}</span>
                  <span style={{ color: 'var(--muted-3)', marginLeft: 8, fontSize: 11 }}>{new Date(m.createdAt).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensajes */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', minHeight: 0, background: 'var(--surface-soft)' }}>
        {loadingMessages && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--muted-2)', fontSize: 12, padding: 16 }}>Cargando…</div>
        )}
        <MessageList messages={messages} myId={myId} grupo={conv.esGrupo} onReact={handleReact} onEdit={handleEdit} onDelete={handleDelete} onReply={handleReply} />
        <div ref={endRef} />
      </div>

      {/* Preview de reply */}
      {replyTo && (
        <div style={{ padding: '6px 10px', margin: '0 10px', borderRadius: 7, background: 'var(--primary-soft)', border: '1px solid var(--primary-soft-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 2 }}>
              ↩ Respondiendo a {replyTo.autorNombre}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {replyTo.contenido}
            </div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0, padding: 2, display: 'flex' }}>
            <Icon name="close" size={13} />
          </button>
        </div>
      )}

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

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙌'];

function MessageList({ messages, myId, grupo, onReact, onEdit, onDelete, onReply }: {
  messages: ChatMessage[];
  myId: string | null;
  grupo: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (m: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReply: (m: ChatMessage) => void;
}) {
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
    nodes.push(<Bubble key={m.id} m={m} mine={mine} grupo={grupo} agrupado={!!agrupado} myId={myId} onReact={onReact} onEdit={onEdit} onDelete={onDelete} onReply={onReply} />);
  });
  return <>{nodes}</>;
}

function Bubble({ m, mine, grupo, agrupado, myId, onReact, onEdit, onDelete, onReply }: {
  m: ChatMessage; mine: boolean; grupo: boolean; agrupado: boolean;
  myId: string | null;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (m: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReply: (m: ChatMessage) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(m.contenido);
  const [editSaving, setEditSaving] = useState(false);

  const reactionGroups = useMemo(() => {
    const map = new Map<string, { count: number; isMine: boolean }>();
    (m.reactions ?? []).forEach((r) => {
      const g = map.get(r.emoji) ?? { count: 0, isMine: false };
      map.set(r.emoji, { count: g.count + 1, isMine: g.isMine || r.userId === myId });
    });
    return Array.from(map.entries());
  }, [m.reactions, myId]);

  const saveEdit = async () => {
    if (!editVal.trim() || editVal === m.contenido) { setEditing(false); return; }
    setEditSaving(true);
    try {
      await api.patch(`/chat/messages/${m.id}`, { contenido: editVal.trim() });
      onEdit({ ...m, contenido: editVal.trim(), editedAt: new Date().toISOString() });
      setEditing(false);
    } catch { /* silencioso */ }
    finally { setEditSaving(false); }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowPicker(false); }}
      style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: agrupado ? 2 : 8 }}
    >
      <div style={{ maxWidth: '78%' }}>
        {grupo && !mine && !agrupado && (
          <div style={{ fontSize: 11, fontWeight: 600, color: colorFromString(m.autor.nombre), margin: '0 0 2px 10px' }}>
            {m.autor.nombre}
          </div>
        )}

        {/* Bubble row: content + action buttons */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: mine ? 'row-reverse' : 'row' }}>
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
            {m.parent && (
              <div style={{ padding: '4px 8px', marginBottom: 6, borderRadius: 6, background: mine ? 'rgba(255,255,255,0.2)' : 'var(--bg)', borderLeft: `2px solid ${mine ? 'rgba(255,255,255,0.5)' : 'var(--primary)'}`, fontSize: 12, color: mine ? 'rgba(255,255,255,0.85)' : 'var(--muted)' }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{m.parent.autor.nombre}</div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{m.parent.contenido}</div>
              </div>
            )}
            {editing ? (
              <>
                <textarea
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  autoFocus
                  rows={2}
                  style={{ width: '100%', resize: 'none', fontSize: 13.5, border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px', fontFamily: 'inherit', outline: 'none' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); }
                    if (e.key === 'Escape') { setEditing(false); setEditVal(m.contenido); }
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button onClick={saveEdit} disabled={editSaving} style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}>
                    {editSaving ? '...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setEditing(false); setEditVal(m.contenido); }} style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                {m.contenido}
                {m.editedAt && (
                  <span style={{ fontSize: 9.5, opacity: 0.6, marginLeft: 6 }}>(editado)</span>
                )}
                <span style={{ fontSize: 10, opacity: 0.65, marginLeft: 8, float: 'right', marginTop: 4 }}>
                  {hhmm(m.createdAt)}
                </span>
              </>
            )}
          </div>

          {/* Action buttons (visible on hover, hidden for optimistic messages) */}
          {hovered && !m.id.startsWith('tmp-') && (
            <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Reply button */}
              <button
                onClick={() => onReply(m)}
                title="Responder"
                style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}
              >
                <Icon name="reply" size={12} style={{ color: 'var(--muted)' }} />
              </button>
              {/* Edit + Delete — solo para mensajes propios */}
              {mine && (
                <>
                  <button onClick={() => { setEditing(true); setEditVal(m.contenido); }} title="Editar" style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                    <Icon name="edit" size={12} style={{ color: 'var(--muted)' }} />
                  </button>
                  <button onClick={() => onDelete(m.id)} title="Eliminar" style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                    <Icon name="trash" size={12} style={{ color: '#C04040' }} />
                  </button>
                </>
              )}
              {/* Emoji reaction */}
              <button
                onClick={() => setShowPicker((p) => !p)}
                style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}
              >
                <Icon name="smile" size={13} style={{ color: 'var(--muted)' }} />
              </button>
              {showPicker && (
                <div style={{
                  position: 'absolute', bottom: 30,
                  ...(mine ? { right: 0 } : { left: 0 }),
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: 6, display: 'flex', gap: 2, boxShadow: '0 4px 16px rgba(0,0,0,.12)',
                  zIndex: 10, whiteSpace: 'nowrap',
                }}>
                  {REACTION_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => { onReact(m.id, e); setShowPicker(false); }}
                      style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 }}
                      title={e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reactions bar */}
        {reactionGroups.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
            {reactionGroups.map(([emoji, { count, isMine }]) => (
              <button
                key={emoji}
                onClick={() => onReact(m.id, emoji)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '2px 7px', borderRadius: 99, border: `1px solid ${isMine ? 'var(--primary)' : 'var(--border)'}`,
                  background: isMine ? 'var(--primary-soft)' : 'var(--surface)', cursor: 'pointer', fontSize: 13,
                }}
              >
                <span>{emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: isMine ? 'var(--primary)' : 'var(--muted)' }}>{count}</span>
              </button>
            ))}
          </div>
        )}
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

  // En kiosko (PWA) ocupa todo el alto disponible del contenedor; en sección, rellena el main.
  const kiosk = variant === 'kiosk';
  return (
    <div style={{
      display: 'flex', flex: 1, height: '100%', background: 'var(--surface)',
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
