import { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '../lib/icons';

export interface SearchOption {
  id: string;
  label: string;
  /** Texto secundario (especialidad, categoría…). También se busca aquí. */
  sublabel?: string;
}

interface Props {
  options: SearchOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  /** Texto de la opción que limpia la selección. Omitir para no permitirlo. */
  clearLabel?: string;
  /** Versión reducida, para usarse dentro de filas densas como el carrito. */
  compact?: boolean;
}

/** Quita tildes y pasa a minúsculas, para que "kinesiologia" encuentre "Kinesiología". */
function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/**
 * Selector único con buscador. Pensado para listas largas donde un `<select>`
 * obliga a recorrer decenas de opciones a mano: se escribe y se filtra.
 *
 * Teclado: ↑/↓ mueven, Enter elige la resaltada, Escape cierra.
 */
export function SearchSelect({
  options, value, onChange, placeholder = 'Seleccionar…', clearLabel, compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setSearch(''); setCursor(0); return; }
    setTimeout(() => inputRef.current?.focus(), 0);
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    const q = norm(search.trim());
    if (!q) return options;
    return options.filter((o) => norm(o.label).includes(q) || norm(o.sublabel ?? '').includes(q));
  }, [options, search]);

  // Si el filtro se acorta, el cursor no puede quedar fuera de rango.
  useEffect(() => { setCursor(0); }, [search]);

  // Mantiene visible la opción resaltada al navegar con el teclado.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`);
    (el as HTMLElement | null)?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  const elegir = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[cursor]) elegir(filtered[cursor].id); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  };

  const seleccionado = options.find((o) => o.id === value) ?? null;
  const alto = compact ? 28 : 34;
  const fuente = compact ? 12 : 13;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          height: alto, padding: '0 8px', textAlign: 'left', cursor: 'pointer',
          fontSize: fuente, fontFamily: 'inherit',
          borderRadius: 6, background: 'var(--surface)',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          color: seleccionado ? 'var(--text)' : 'var(--muted-2)',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {seleccionado ? seleccionado.label : placeholder}
        </span>
        <Icon
          name="chev"
          size={13}
          style={{ flexShrink: 0, color: 'var(--muted-3)', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', zIndex: 300, top: `calc(100% + 4px)`, left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: 6, borderBottom: '1px solid var(--border-soft)' }}>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Buscar…"
              style={{
                width: '100%', padding: '5px 8px', fontSize: 12.5, fontFamily: 'inherit',
                border: '1px solid var(--border)', borderRadius: 6, outline: 'none',
                background: 'var(--surface)', color: 'var(--text)',
              }}
            />
          </div>

          <div ref={listRef} style={{ maxHeight: 220, overflowY: 'auto', padding: 4 }}>
            {clearLabel && (
              <button
                type="button"
                onClick={() => elegir(null)}
                style={{
                  width: '100%', textAlign: 'left', padding: '6px 8px', fontSize: 12.5,
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: 'none', color: 'var(--muted)', fontFamily: 'inherit',
                }}
              >
                {clearLabel}
              </button>
            )}

            {filtered.length === 0 ? (
              <div style={{ padding: '10px 8px', fontSize: 12.5, color: 'var(--muted-2)', textAlign: 'center' }}>
                Sin resultados
              </div>
            ) : (
              filtered.map((o, i) => {
                const activo = o.id === value;
                const resaltado = i === cursor;
                return (
                  <button
                    key={o.id}
                    type="button"
                    data-idx={i}
                    onClick={() => elegir(o.id)}
                    onMouseEnter={() => setCursor(i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '6px 8px',
                      border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                      background: resaltado ? 'var(--primary-soft)' : 'none',
                      color: activo ? 'var(--primary)' : 'var(--text)',
                      fontWeight: activo ? 600 : 400,
                    }}
                  >
                    <div style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.label}
                    </div>
                    {o.sublabel && (
                      <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>{o.sublabel}</div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
