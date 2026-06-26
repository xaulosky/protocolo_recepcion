import type { ReactNode } from 'react';
import { Icon } from '../lib/icons';

interface AsyncStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: ReactNode;
}

/** Muestra carga/error o el contenido. Envuelve cualquier sección que consuma la API. */
export function AsyncState({ loading, error, onRetry, children }: AsyncStateProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--muted-2)', gap: 10 }}>
        <span className="spinner" />
        <span style={{ fontSize: 13 }}>Cargando…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0', gap: 10, color: 'var(--muted)' }}>
        <Icon name="info" size={22} style={{ color: 'var(--orange)' }} />
        <div style={{ fontSize: 13 }}>{error}</div>
        {onRetry && <button className="btn btn-soft btn-sm" onClick={onRetry}>Reintentar</button>}
      </div>
    );
  }
  return <>{children}</>;
}
