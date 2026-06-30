import { useMemo, useState, useEffect } from 'react';
import { Chips } from '../components/Chips';
import { AccordionItem, useSingleOpen } from '../components/Accordion';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import type { FaqItem } from '../lib/types';

const PAGE_SIZE = 15;

export function Faq() {
  const acc = useSingleOpen();
  const [cat, setCat] = useState('Todos');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ faq: FaqItem[] }>('/data/faq');
  const faq = useMemo(() => data?.faq ?? [], [data]);

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(faq.map((f) => f.categoria)))],
    [faq],
  );
  const filtered = cat === 'Todos' ? faq : faq.filter((f) => f.categoria === cat);

  useEffect(() => { setPage(1); }, [cat]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <Chips options={categories} value={cat} onChange={setCat} />
        <div className="stack" style={{ maxWidth: 780 }}>
          {paged.map((f) => (
            <AccordionItem
              key={f.id}
              open={acc.isOpen(f.id)}
              onToggle={() => acc.toggle(f.id)}
              header={
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                  <span className="badge" style={{ whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>{f.categoria}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{f.pregunta}</span>
                </div>
              }
            >
              {f.respuesta}
            </AccordionItem>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AsyncState>
  );
}
