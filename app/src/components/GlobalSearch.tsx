import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../store/app-context';
import { api } from '../lib/api';
import { Icon } from '../lib/icons';
import type { ViewId } from '../lib/nav';

interface SearchResult {
  id: string;
  label: string;
  sub?: string;
  section: string;
  viewId: ViewId;
  badge?: string;
  badgeColor?: string;
}

interface Props {
  onClose: () => void;
}

export function GlobalSearch({ onClose }: Props) {
  const { go } = useApp();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buscar = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const q = encodeURIComponent(query);
      const [tr, pr, ta, gc, re, ci] = await Promise.allSettled([
        api.get<{ treatments: { id: string; nombre: string; categoria: string }[] }>(`/data/treatments?q=${q}`),
        api.get<{ professionals: { id: string; nombreCompleto: string; especialidad: string }[] }>(`/data/professionals?q=${q}`),
        api.get<{ tasks: { id: string; descripcion: string; paciente: string | null; etapa: string }[] }>(`/tasks?q=${q}`),
        api.get<{ giftCards: { id: string; para: string; codigo: string; estado: string }[] }>(`/gift-cards?q=${q}`),
        api.get<{ reembolsos: { id: string; paciente: string; estado: string }[] }>(`/reembolsos?q=${q}`),
        api.get<{ cirugias: { id: string; paciente: string; tipo: string; etapa: string }[] }>(`/cirugias?q=${q}`),
      ]);

      const out: SearchResult[] = [];

      if (tr.status === 'fulfilled') {
        tr.value.treatments.slice(0, 5).forEach((t) =>
          out.push({ id: t.id, label: t.nombre, sub: t.categoria, section: 'Tratamientos', viewId: 'tratamientos' }),
        );
      }
      if (pr.status === 'fulfilled') {
        pr.value.professionals.slice(0, 4).forEach((p) =>
          out.push({ id: p.id, label: p.nombreCompleto, sub: p.especialidad, section: 'Profesionales', viewId: 'profesionales' }),
        );
      }
      if (ta.status === 'fulfilled') {
        ta.value.tasks.slice(0, 5).forEach((t) =>
          out.push({
            id: t.id,
            label: t.descripcion,
            sub: t.paciente ?? undefined,
            section: 'Tareas',
            viewId: 'tareas',
            badge: t.etapa,
          }),
        );
      }
      if (gc.status === 'fulfilled') {
        gc.value.giftCards.slice(0, 4).forEach((g) =>
          out.push({
            id: g.id,
            label: g.para,
            sub: `Código: ${g.codigo}`,
            section: 'Gift Cards',
            viewId: 'giftcards',
            badge: g.estado,
            badgeColor: g.estado === 'ACTIVA' ? '#3A6A4A' : '#999',
          }),
        );
      }
      if (re.status === 'fulfilled') {
        re.value.reembolsos.slice(0, 4).forEach((r) =>
          out.push({ id: r.id, label: r.paciente, sub: r.estado, section: 'Reembolsos', viewId: 'reembolso' }),
        );
      }
      if (ci.status === 'fulfilled') {
        ci.value.cirugias.slice(0, 4).forEach((c) =>
          out.push({ id: c.id, label: c.paciente, sub: c.tipo, section: 'Cirugías', viewId: 'cirugias', badge: c.etapa }),
        );
      }

      setResults(out);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => buscar(q), 300);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [q, buscar]);

  const handleSelect = useCallback(
    (r: SearchResult) => {
      go(r.viewId);
      onClose();
    },
    [go, onClose],
  );

  // Navegación con teclado
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter' && results[selected]) {
        handleSelect(results[selected]);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [results, selected, handleSelect]);

  // Agrupa resultados por sección
  const groups = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.section] = acc[r.section] ?? []).push(r);
    return acc;
  }, {});

  let flatIdx = -1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface, #fff)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 600,
          maxHeight: '75vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de búsqueda */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-soft, #eee)',
          }}
        >
          <Icon name="search" size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en todo el sistema..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              background: 'transparent',
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
          />
          {loading && (
            <span style={{ fontSize: 12, color: 'var(--muted-2)', flexShrink: 0 }}>Buscando…</span>
          )}
          <kbd
            style={{
              fontSize: 11,
              padding: '2px 6px',
              borderRadius: 5,
              border: '1px solid var(--border, #ddd)',
              color: 'var(--muted-2)',
              background: 'var(--bg)',
              flexShrink: 0,
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {q.length < 2 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-2)', fontSize: 14 }}>
              Escribe para buscar tratamientos, profesionales, tareas…
            </div>
          )}
          {q.length >= 2 && !loading && results.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-2)', fontSize: 14 }}>
              Sin resultados para "{q}"
            </div>
          )}
          {Object.entries(groups).map(([section, items]) => (
            <div key={section}>
              <div
                style={{
                  padding: '10px 16px 4px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--muted-2)',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                {section}
              </div>
              {items.map((r) => {
                flatIdx++;
                const isSel = flatIdx === selected;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 16px',
                      border: 'none',
                      background: isSel ? 'var(--primary-soft, #eef4ff)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {r.label}
                      </div>
                      {r.sub && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{r.sub}</div>
                      )}
                    </div>
                    {r.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 99,
                          background: 'var(--border-softer, #f0f0f0)',
                          color: r.badgeColor ?? 'var(--muted)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {r.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
