import { useState, useRef, useEffect } from 'react';
import { colorFromString } from '../lib/format';
import { Icon } from '../lib/icons';

interface User { id: string; nombre: string }

interface Props {
  users: User[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function UserMultiSelect({ users, selected, onChange, placeholder = 'Sin asignar' }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setSearch(''); return; }
    setTimeout(() => inputRef.current?.focus(), 0);
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const filtered = search
    ? users.filter((u) => u.nombre.toLowerCase().includes(search.toLowerCase()))
    : users;

  const selectedUsers = users.filter((u) => selected.includes(u.id));

  let label: React.ReactNode;
  if (selectedUsers.length === 0) {
    label = <span style={{ color: 'var(--muted)' }}>{placeholder}</span>;
  } else {
    const names = selectedUsers.map((u) => u.nombre);
    const shown = names.slice(0, 2).join(', ');
    label = names.length > 2 ? `${shown} +${names.length - 2}` : shown;
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="select"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          textAlign: 'left', cursor: 'pointer',
          borderColor: open ? 'var(--primary)' : undefined,
        }}
      >
        <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <Icon
          name="chev"
          size={14}
          style={{ flexShrink: 0, color: 'var(--muted-3)', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', zIndex: 300, top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-soft)' }}>
            <input
              ref={inputRef}
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              style={{ fontSize: 13, padding: '6px 10px' }}
            />
          </div>

          <div style={{ maxHeight: 210, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>Sin resultados</div>
            ) : filtered.map((u) => {
              const sel = selected.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggle(u.id)}
                  style={{
                    display: 'flex', width: '100%', alignItems: 'center', gap: 9,
                    padding: '8px 12px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: sel ? 'var(--primary-soft)' : 'transparent', transition: 'background .1s',
                  }}
                  onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = sel ? 'var(--primary-soft)' : 'transparent'; }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                    background: colorFromString(u.nombre),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                  }}>
                    {u.nombre.charAt(0)}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{u.nombre}</span>
                  {sel && (
                    <div style={{
                      width: 17, height: 17, borderRadius: 4, background: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-soft)', padding: '6px 10px' }}>
              <button
                type="button"
                onClick={() => onChange([])}
                style={{ fontSize: 11.5, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ✕ Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
