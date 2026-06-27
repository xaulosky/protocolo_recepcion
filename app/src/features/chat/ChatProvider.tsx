import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../../lib/api';
import { enablePush } from '../../lib/push';
import { useAuth } from '../../store/auth-context';
import type { ChatMessage, ChatUser, Conversation } from '../../lib/types';

const LIST_POLL_MS = 7000;
const MSG_POLL_MS = 3000;

interface ChatContextValue {
  conversations: Conversation[];
  unread: number;
  users: ChatUser[];
  activeId: string | null;
  messages: ChatMessage[];
  loadingMessages: boolean;
  floatingOpen: boolean;
  myId: string | null;
  openConversation: (id: string) => void;
  closeConversation: () => void;
  send: (texto: string) => Promise<void>;
  startDm: (userId: string) => Promise<void>;
  createGroup: (nombre: string, memberIds: string[]) => Promise<void>;
  createChannel: (nombre: string, roles: string[]) => Promise<void>;
  setFloatingOpen: (open: boolean) => void;
  newChatOpen: boolean;
  setNewChatOpen: (open: boolean) => void;
  refresh: () => void;
  alertsEnabled: boolean;
  enableAlerts: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const myId = user?.id ?? null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);

  // Refs para evitar closures obsoletos dentro de los intervalos.
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeId;
  const msgCountRef = useRef(0);

  // ── Alertas (sonido + notificaciones) ──
  const audioRef = useRef<AudioContext | null>(null);
  const prevUnreadRef = useRef<number>(-1); // -1 = aún no cargado (no alertar en la 1ª carga)
  const myIdRef = useRef<string | null>(null);
  myIdRef.current = myId;
  const myNameRef = useRef<string>('');
  myNameRef.current = user?.nombre ?? '';
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => localStorage.getItem('cialo_alerts') === '1');

  /** Pitido corto de dos tonos (Web Audio, sin archivo). */
  const playBeep = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [880, 1175].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g); g.connect(ctx.destination);
        const t = now + i * 0.15;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o.start(t); o.stop(t + 0.16);
      });
    } catch {
      /* ignorar */
    }
  }, []);

  /** Beep + notificación del sistema (esta última solo si la pestaña está en segundo plano). */
  const notifyIncoming = useCallback((title: string, body: string, convId: string) => {
    playBeep();
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(title, { body, tag: convId, icon: '/chat-icon.svg' }); } catch { /* ignorar */ }
    }
  }, [playBeep]);

  const unread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations],
  );

  const refreshConversations = useCallback(async () => {
    try {
      const { conversations } = await api.get<{ conversations: Conversation[] }>('/chat/conversations');
      setConversations(conversations);
      // Detecta mensajes entrantes nuevos comparando el total de no leídos.
      const total = conversations.reduce((s, c) => s + c.unread, 0);
      if (prevUnreadRef.current >= 0 && total > prevUnreadRef.current) {
        const cand = conversations
          .filter((c) => c.unread > 0 && c.ultimoMensaje && c.ultimoMensaje.autorNombre !== myNameRef.current)
          .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0];
        if (cand && cand.ultimoMensaje) {
          notifyIncoming(cand.titulo, `${cand.ultimoMensaje.autorNombre}: ${cand.ultimoMensaje.contenido}`, cand.id);
        }
      }
      prevUnreadRef.current = total;
    } catch {
      /* silencioso: el polling reintenta */
    }
  }, [notifyIncoming]);

  const markRead = useCallback(async (id: string) => {
    try {
      await api.post(`/chat/conversations/${id}/read`);
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    } catch {
      /* ignorar */
    }
  }, []);

  const fetchMessages = useCallback(async (id: string, markIfNew = false) => {
    try {
      const { messages } = await api.get<{ messages: ChatMessage[] }>(`/chat/conversations/${id}/messages`);
      // Solo aplicar si sigue siendo la conversación activa.
      if (activeRef.current !== id) return;
      const grew = messages.length > msgCountRef.current;
      msgCountRef.current = messages.length;
      setMessages(messages);
      if (markIfNew && grew) {
        const last = messages[messages.length - 1];
        if (last && last.autor.id !== myIdRef.current) {
          // Mensaje entrante en la conversación abierta → sonar.
          playBeep();
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            try { new Notification(last.autor.nombre, { body: last.contenido, tag: id, icon: '/chat-icon.svg' }); } catch { /* ignorar */ }
          }
        }
        if (document.hasFocus()) markRead(id);
      }
    } catch {
      /* ignorar */
    }
  }, [markRead, playBeep]);

  const openConversation = useCallback((id: string) => {
    setActiveId(id);
    activeRef.current = id;
    msgCountRef.current = 0;
    setMessages([]);
    setNewChatOpen(false);
    setLoadingMessages(true);
    fetchMessages(id).finally(() => setLoadingMessages(false));
    markRead(id);
  }, [fetchMessages, markRead]);

  const closeConversation = useCallback(() => {
    setActiveId(null);
    activeRef.current = null;
    setMessages([]);
  }, []);

  const send = useCallback(async (texto: string) => {
    const id = activeRef.current;
    const t = texto.trim();
    if (!id || !t || !myId) return;
    // Optimista: pinta el mensaje al instante.
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      contenido: t,
      createdAt: new Date().toISOString(),
      autor: { id: myId, nombre: user?.nombre ?? 'Yo', role: user?.role ?? 'RECEPCION' },
    };
    setMessages((prev) => [...prev, optimistic]);
    msgCountRef.current += 1;
    try {
      await api.post(`/chat/conversations/${id}/messages`, { contenido: t });
      await fetchMessages(id); // reconcilia (reemplaza el optimista por el real)
      refreshConversations();
    } catch {
      // Revertir el optimista si falló.
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  }, [myId, user, fetchMessages, refreshConversations]);

  const loadUsers = useCallback(async () => {
    try {
      const { users } = await api.get<{ users: ChatUser[] }>('/chat/users');
      setUsers(users);
    } catch {
      /* ignorar */
    }
  }, []);

  const startDm = useCallback(async (userId: string) => {
    const { conversationId } = await api.post<{ conversationId: string }>('/chat/conversations/dm', { userId });
    await refreshConversations();
    openConversation(conversationId);
  }, [refreshConversations, openConversation]);

  const createGroup = useCallback(async (nombre: string, memberIds: string[]) => {
    const { conversationId } = await api.post<{ conversationId: string }>('/chat/conversations/group', { nombre, memberIds });
    await refreshConversations();
    openConversation(conversationId);
  }, [refreshConversations, openConversation]);

  const createChannel = useCallback(async (nombre: string, roles: string[]) => {
    const { conversationId } = await api.post<{ conversationId: string }>('/chat/conversations/channel', { nombre, roles });
    await refreshConversations();
    openConversation(conversationId);
  }, [refreshConversations, openConversation]);

  /** Habilita sonido + notificaciones (push en background). Requiere gesto del usuario. */
  const enableAlerts = useCallback(async () => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx && !audioRef.current) audioRef.current = new Ctx();
      await audioRef.current?.resume();
    } catch { /* ignorar */ }
    playBeep(); // confirmación audible
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { /* ignorar */ }
    }
    try { await enablePush(); } catch { /* push opcional */ }
    setAlertsEnabled(true);
    localStorage.setItem('cialo_alerts', '1');
  }, [playBeep]);

  // Desbloquea el audio en el primer gesto del usuario (para que los beeps suenen).
  useEffect(() => {
    const unlock = () => {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (Ctx && !audioRef.current) audioRef.current = new Ctx();
        audioRef.current?.resume();
      } catch { /* ignorar */ }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Carga inicial + polling de la lista (solo autenticado).
  useEffect(() => {
    if (status !== 'authenticated') return;
    refreshConversations();
    loadUsers();
    const t = window.setInterval(refreshConversations, LIST_POLL_MS);
    return () => window.clearInterval(t);
  }, [status, refreshConversations, loadUsers]);

  // Refresca la lista de usuarios cada vez que se abre el panel de nuevo chat,
  // para que los usuarios creados recientemente aparezcan sin recargar la página.
  useEffect(() => {
    if (newChatOpen) loadUsers();
  }, [newChatOpen, loadUsers]);

  // Polling de mensajes de la conversación abierta.
  useEffect(() => {
    if (!activeId) return;
    const t = window.setInterval(() => fetchMessages(activeId, true), MSG_POLL_MS);
    return () => window.clearInterval(t);
  }, [activeId, fetchMessages]);

  const value = useMemo<ChatContextValue>(() => ({
    conversations, unread, users, activeId, messages, loadingMessages, floatingOpen, myId,
    openConversation, closeConversation, send, startDm, createGroup, createChannel, setFloatingOpen,
    newChatOpen, setNewChatOpen,
    refresh: refreshConversations, alertsEnabled, enableAlerts,
  }), [conversations, unread, users, activeId, messages, loadingMessages, floatingOpen, myId,
    openConversation, closeConversation, send, startDm, createGroup, createChannel, refreshConversations,
    newChatOpen, alertsEnabled, enableAlerts]);

  return <ChatContext value={value}>{children}</ChatContext>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
