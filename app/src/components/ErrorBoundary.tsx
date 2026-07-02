import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/**
 * Aísla los fallos de render a la sección actual en vez de dejar toda la app en
 * blanco. Se remonta al cambiar de vista (usar `key={view}`), así navegar a otra
 * sección limpia el error automáticamente.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 48, textAlign: 'center', maxWidth: 460, margin: '0 auto' }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            No pudimos mostrar esta sección
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>
            Ocurrió un error al cargar el contenido. Puedes reintentar o cambiar de sección.
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: 13.5 }}
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
