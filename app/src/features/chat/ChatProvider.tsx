import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../../lib/api';
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
  setFloatingOpen: (open: boolean) => void;
  refresh: () => void;
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

  // Refs para evitar closures obsoletos dentro de los intervalos.
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeId;
  const msgCountRef = useRef(0);

  const unread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations],
  );

  const refreshConversations = useCallback(async () => {
    try {
      const { conversations } = await api.get<{ conversations: Conversation[] }>('/chat/conversations');
      setConversations(conversations);
    } catch {
      /* silencioso: el polling reintenta */
    }
  }, []);

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
      if (markIfNew && grew && document.hasFocus()) markRead(id);
    } catch {
      /* ignorar */
    }
  }, [markRead]);

  const openConversation = useCallback((id: string) => {
    setActiveId(id);
    activeRef.current = id;
    msgCountRef.current = 0;
    setMessages([]);
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

  // Carga inicial + polling de la lista (solo autenticado).
  useEffect(() => {
    if (status !== 'authenticated') return;
    refreshConversations();
    loadUsers();
    const t = window.setInterval(refreshConversations, LIST_POLL_MS);
    return () => window.clearInterval(t);
  }, [status, refreshConversations, loadUsers]);

  // Polling de mensajes de la conversación abierta.
  useEffect(() => {
    if (!activeId) return;
    const t = window.setInterval(() => fetchMessages(activeId, true), MSG_POLL_MS);
    return () => window.clearInterval(t);
  }, [activeId, fetchMessages]);

  const value = useMemo<ChatContextValue>(() => ({
    conversations, unread, users, activeId, messages, loadingMessages, floatingOpen, myId,
    openConversation, closeConversation, send, startDm, createGroup, setFloatingOpen,
    refresh: refreshConversations,
  }), [conversations, unread, users, activeId, messages, loadingMessages, floatingOpen, myId,
    openConversation, closeConversation, send, startDm, createGroup, refreshConversations]);

  return <ChatContext value={value}>{children}</ChatContext>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
