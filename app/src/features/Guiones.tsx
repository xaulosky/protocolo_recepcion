import { useMemo, useState, useEffect } from 'react';
import { Chips } from '../components/Chips';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import { useCopy } from '../store/app-context';
import type { Script } from '../lib/types';

const PAGE_SIZE = 10;

export function Guiones() {
  const copy = useCopy();
  const [cat, setCat] = useState('Todos');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ scripts: Script[] }>('/data/scripts');
  const scripts = useMemo(() => data?.scripts ?? [], [data]);

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(scripts.map((s) => s.categoria)))],
    [scripts],
  );
  const filtered = cat === 'Todos' ? scripts : scripts.filter((g) => g.categoria === cat);

  useEffect(() => { setPage(1); }, [cat]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <Chips options={categories} value={cat} onChange={(v) => { setCat(v); }} />
        <div className="stack">
          {paged.map((g) => (
            <div key={g.id} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <div>
                  <span className="badge" style={{ marginBottom: 6 }}>{g.categoria}</span>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{g.titulo}</div>
                </div>
                <button className="btn btn-soft btn-sm" style={{ flexShrink: 0 }} onClick={() => copy(`${g.titulo}\n\n${g.contenido}`)}>
                  Copiar
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, borderTop: '1px solid var(--border-softer)', paddingTop: 10, whiteSpace: 'pre-line' }}>
                {g.contenido}
              </p>
              {g.nota && (
                <div style={{ marginTop: 10, background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--primary)' }}>
                  <strong>Nota:</strong> {g.nota}
                </div>
              )}
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AsyncState>
  );
}
