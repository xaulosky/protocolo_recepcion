import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCopiloto } from './CopilotoProvider';
import { useAuth } from '../../store/auth-context';
import { Icon } from '../../lib/icons';
import type { CopilotoMensaje } from '../../lib/types';

/** Formatea el resultado de una tool en una línea legible para el chip de acción. */
function formatToolChip(m: CopilotoMensaje): string {
  const r = m.toolResult ?? {};
  if (r.error) return String(r.error);
  switch (m.toolName) {
    case 'crear_tarea': return `Tarea creada: ${r.descripcion ?? ''}`;
    case 'crear_reembolso': return `Reembolso registrado: ${r.paciente ?? ''} — ${r.motivo ?? ''}`;
    case 'crear_presupuesto': return `Presupuesto creado para ${r.paciente ?? ''}`;
    case 'registrar_documento': return `Documento "${r.titulo ?? ''}" guardado para ${r.usuario ?? ''}`;
    case 'invitar_usuarios': return `${r.creados ?? 0} invitación(es) enviadas${Number(r.fallidos) > 0 ? ` · ${r.fallidos} fallidas` : ''}`;
    case 'consultar_tareas': return `${r.total ?? 0} tarea(s) encontradas`;
    case 'consultar_reembolsos': return `${r.total ?? 0} reembolso(s) encontrados`;
    case 'buscar_catalogo': return `${r.total ?? 0} resultado(s) en el catálogo`;
    default: return 'Acción ejecutada';
  }
}

/**
 * Widget flotante del Copiloto IA. Bottom-LEFT (el Chat de equipo usa bottom-right)
 * para no chocar visualmente. Solo se renderiza si el usuario tiene
 * `copilotoHabilitado` — no depende de ViewId/canView (no es una vista de navegación).
 */
export function CopilotoFloating() {
  const { user } = useAuth();
  const { mensajes, loading, error, panelOpen, setPanelOpen, enviar, reiniciar } = useCopiloto();
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, loading]);

  if (!user?.copilotoHabilitado) return null;

  const enviarMensaje = async () => {
    const t = texto.trim();
    if (!t && !archivo) return;
    setTexto('');
    const f = archivo;
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = '';
    await enviar(t, f);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void enviarMensaje();
    }
  };

  const confirmarReinicio = () => {
    if (window.confirm('¿Reiniciar la conversación con el copiloto? Se borrará el historial.')) {
      void reiniciar();
    }
  };

  return createPortal(
    <div className="no-print" style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      {panelOpen && (
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
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, minHeight: 52,
            padding: '0 12px 0 14px', background: 'var(--primary)', color: '#fff', flexShrink: 0,
          }}>
            <Icon name="sparkles" size={18} />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>Copiloto IA</span>
            <button onClick={confirmarReinicio} title="Reiniciar conversación" style={topBtn}>
              <Icon name="rotate-ccw" size={16} />
            </button>
            <button onClick={() => setPanelOpen(false)} title="Cerrar" style={topBtn}>
              <Icon name="close" size={17} />
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mensajes.length === 0 && (
              <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', marginTop: 24 }}>
                Pídeme crear una tarea, consultar reembolsos, armar un presupuesto o subir un documento.
              </div>
            )}
            {mensajes.map((m) => {
              if (m.role === 'tool') {
                return (
                  <div key={m.id} style={{
                    alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--primary-soft)', border: '1px solid var(--cream-border)', borderRadius: 10,
                    padding: '6px 10px', fontSize: 12, color: 'var(--primary)', fontWeight: 500,
                  }}>
                    <Icon name={m.toolResult?.error ? 'info' : 'check'} size={13} />
                    {formatToolChip(m)}
                  </div>
                );
              }
              const mine = m.role === 'user';
              return (
                <div key={m.id} style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%',
                  background: mine ? 'var(--primary)' : 'var(--surface)',
                  color: mine ? '#fff' : 'var(--text)',
                  border: mine ? 'none' : '1px solid var(--border)',
                  borderRadius: 14, padding: '8px 12px', fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap',
                }}>
                  {m.contenido}
                </div>
              );
            })}
            {loading && (
              <div style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                El copiloto está pensando...
              </div>
            )}
            {error && (
              <div style={{ alignSelf: 'flex-start', fontSize: 12, color: '#C04040', background: '#FBF0EB', borderRadius: 8, padding: '6px 10px' }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-soft)', padding: 10, flexShrink: 0 }}>
            {archivo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--muted)', marginBottom: 6, background: 'var(--bg)', borderRadius: 6, padding: '4px 8px' }}>
                <Icon name="file" size={12} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{archivo.name}</span>
                <button onClick={() => { setArchivo(null); if (fileRef.current) fileRef.current.value = ''; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
              <button
                onClick={() => fileRef.current?.click()}
                title="Adjuntar archivo"
                style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon name="file" size={15} />
              </button>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe una instrucción..."
                rows={1}
                disabled={loading}
                style={{
                  flex: 1, resize: 'none', border: '1px solid var(--border)', borderRadius: 18,
                  padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                  background: loading ? 'var(--bg)' : 'var(--surface)', color: 'var(--text)', maxHeight: 90,
                }}
              />
              <button
                onClick={() => void enviarMensaje()}
                disabled={loading || (!texto.trim() && !archivo)}
                title="Enviar"
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: 'none',
                  background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, opacity: loading || (!texto.trim() && !archivo) ? 0.5 : 1, cursor: 'pointer',
                }}
              >
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setPanelOpen(!panelOpen)}
        title={panelOpen ? 'Cerrar copiloto' : 'Abrir copiloto'}
        style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'var(--primary)', color: '#fff', cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(124,98,71,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={panelOpen ? 'close' : 'sparkles'} size={22} />
      </button>
    </div>,
    document.body,
  );
}

const topBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.16)',
  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
};
