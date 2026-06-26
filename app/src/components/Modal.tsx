import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../lib/icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, eyebrow, title, children, maxWidth = 560 }: ModalProps) {
  if (!open) return null;
  // Portal a body: evita que un `transform` en un ancestro (animación fadeUp)
  // rompa el `position: fixed` del overlay.
  return createPortal((
    <div
      onClick={onClose}
      className="no-print"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'overlayIn .2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-up"
        style={{
          background: '#fff', borderRadius: 'var(--radius-modal)', maxWidth, width: '100%',
          maxHeight: '82vh', overflowY: 'auto',
        }}
      >
        <div
          style={{
            padding: 22, borderBottom: '1px solid var(--border-soft)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14,
            position: 'sticky', top: 0, background: '#fff', borderRadius: '12px 12px 0 0',
          }}
        >
          <div>
            {eyebrow && <div className="badge" style={{ marginBottom: 8 }}>{eyebrow}</div>}
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0, width: 30, height: 30, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: 6, border: 'none', background: 'none',
              color: 'var(--muted-2)', outline: 'none',
            }}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
      </div>
    </div>
  ), document.body);
}
