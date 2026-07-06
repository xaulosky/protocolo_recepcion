import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../store/auth-context';
import type { CopilotoMensaje } from '../../lib/types';

interface CopilotoContextValue {
  mensajes: CopilotoMensaje[];
  loading: boolean;
  error: string | null;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  enviar: (texto: string, archivo?: File | null) => Promise<void>;
  reiniciar: () => Promise<void>;
}

const CopilotoContext = createContext<CopilotoContextValue | null>(null);

/**
 * A diferencia de ChatProvider, NO hace polling: es petición-respuesta directa
 * (el usuario escribe, se espera la respuesta HTTP con la contestación del
 * copiloto ya generada) — no hay estado compartido con otros usuarios que
 * cambie "por fuera".
 */
export function CopilotoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const habilitado = Boolean(user?.copilotoHabilitado);

  const [mensajes, setMensajes] = useState<CopilotoMensaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!habilitado) return;
    api.get<{ mensajes: CopilotoMensaje[] }>('/copiloto/mensajes')
      .then((d) => setMensajes(d.mensajes))
      .catch(() => {});
  }, [habilitado]);

  const enviar = useCallback(async (texto: string, archivo?: File | null) => {
    setLoading(true);
    setError(null);
    try {
      let data: { mensajes: CopilotoMensaje[]; error?: string };
      if (archivo) {
        const form = new FormData();
        form.set('contenido', texto);
        form.set('archivo', archivo);
        data = await api.upload<{ mensajes: CopilotoMensaje[] }>('/copiloto/mensajes', form);
      } else {
        data = await api.post<{ mensajes: CopilotoMensaje[] }>('/copiloto/mensajes', { contenido: texto });
      }
      setMensajes((prev) => [...prev, ...data.mensajes]);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo contactar al copiloto.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reiniciar = useCallback(async () => {
    await api.del('/copiloto/mensajes').catch(() => {});
    setMensajes([]);
    setError(null);
  }, []);

  const value = useMemo<CopilotoContextValue>(
    () => ({ mensajes, loading, error, panelOpen, setPanelOpen, enviar, reiniciar }),
    [mensajes, loading, error, panelOpen, enviar, reiniciar],
  );

  return <CopilotoContext value={value}>{children}</CopilotoContext>;
}

export function useCopiloto() {
  const ctx = useContext(CopilotoContext);
  if (!ctx) throw new Error('useCopiloto must be used within CopilotoProvider');
  return ctx;
}
