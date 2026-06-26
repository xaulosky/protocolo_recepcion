import { useMemo, useState } from 'react';
import { Chips } from '../components/Chips';
import { AccordionItem, useSingleOpen } from '../components/Accordion';
import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import type { FaqItem } from '../lib/types';

export function Faq() {
  const acc = useSingleOpen();
  const [cat, setCat] = useState('Todos');
  const { data, loading, error, reload } = useResource<{ faq: FaqItem[] }>('/data/faq');
  const faq = useMemo(() => data?.faq ?? [], [data]);

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(faq.map((f) => f.categoria)))],
    [faq],
  );
  const filtered = cat === 'Todos' ? faq : faq.filter((f) => f.categoria === cat);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <Chips options={categories} value={cat} onChange={setCat} />
        <div className="stack" style={{ maxWidth: 780 }}>
          {filtered.map((f) => (
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
      </div>
    </AsyncState>
  );
}
