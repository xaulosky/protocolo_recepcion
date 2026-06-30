import { useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../lib/icons';

interface AccordionItemProps {
  open: boolean;
  onToggle: () => void;
  header: ReactNode;
  children: ReactNode;
  bodyIndent?: number;
}

/** Fila colapsable reutilizable (protocolos, FAQ). */
export function AccordionItem({ open, onToggle, header, children, bodyIndent = 18 }: AccordionItemProps) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        className="accordion-head"
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      >
        {header}
        <div style={{ flexShrink: 0, color: 'var(--muted-3)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <Icon name="chev" size={14} />
        </div>
      </div>
      {open && (
        <div style={{ padding: `0 18px 16px ${bodyIndent}px`, borderTop: '1px solid var(--border-softer)' }}>
          <div style={{ paddingTop: 14, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/** Hook para acordeón de un único item abierto a la vez. */
export function useSingleOpen() {
  const [openId, setOpenId] = useState<string | null>(null);
  return {
    isOpen: (id: string) => openId === id,
    toggle: (id: string) => setOpenId((cur) => (cur === id ? null : id)),
  };
}
