import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ViewId } from '../lib/nav';

interface AppContextValue {
  view: ViewId;
  go: (view: ViewId) => void;
  toastMsg: string | null;
  toast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewId>('dashboard');
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
