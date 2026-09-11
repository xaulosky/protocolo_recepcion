import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { NAV } from '../lib/nav';
import type { ViewId } from '../lib/nav';
import { allowedViews } from '../lib/permissions';
import { useAuth } from './auth-context';

interface AppContextValue {
  view: ViewId;
  go: (view: ViewId) => void;
  toastMsg: string | null;
  toast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Vista inicial: dashboard si el usuario puede verlo; si no (ej. una estación
  // Box que solo ve mensajería), la primera sección permitida del menú.
  const [view, setView] = useState<ViewId>(() => {
    const allowed = allowedViews(user);
    if (allowed.has('dashboard')) return 'dashboard';
    const first = NAV.flatMap((s) => s.items).find((it) => allowed.has(it.id));
    return first?.id ?? 'dashboard';
  });
  // Abierta por la extensión de Reservo para registrar una venta: directo a la
  // caja. Como efecto y no en el valor inicial porque, si la sesión había
  // vencido, el usuario existe recién después del login.
  useEffect(() => {
    if (!user) return;
    if (new URLSearchParams(window.location.search).get('importar') !== 'reservo') return;
    if (allowedViews(user).has('caja')) setView('caja');
  }, [user]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const go = useCallback((next: ViewId) => setView(next), []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2000);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ view, go, toastMsg, toast }),
    [view, go, toastMsg, toast],
  );

  return <AppContext value={value}>{children}</AppContext>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/** Copia texto al portapapeles y muestra un toast de confirmación. */
export function useCopy() {
  const { toast } = useApp();
  return useCallback(
    (text: string, msg = '¡Copiado al portapapeles!') => {
      navigator.clipboard?.writeText(text).catch(() => {});
      toast(msg);
    },
    [toast],
  );
}
