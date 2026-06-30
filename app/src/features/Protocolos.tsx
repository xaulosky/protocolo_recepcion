import { useState, useEffect } from 'react';
import { AccordionItem, useSingleOpen } from '../components/Accordion';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import { useCopy } from '../store/app-context';
import type { Protocol } from '../lib/types';

const PAGE_SIZE = 15;

export function Protocolos() {
  const acc = useSingleOpen();
  const copy = useCopy();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ protocols: Protocol[] }>('/data/protocols');
  const protocols = data?.protocols ?? [];

  useEffect(() => { setPage(1); }, [protocols]);

  const totalPages = Math.ceil(protocols.length / PAGE_SIZE);
  const paged = protocols.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
          {protocols.length} protocolos operativos para el equipo de recepción.
        </p>
        <div className="stack">
          {paged.map((p) => {
            const id = `p${p.id}`;
            return (
              <AccordionItem
                key={id}
                open={acc.isOpen(id)}
                onToggle={() => acc.toggle(id)}
                bodyIndent={60}
                header={
                  <>
                    <div style={{ width: 30, height: 30, background: 'var(--primary-soft)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: 'var(--primary)' }}>
                      {String(p.numero).padStart(2, '0')}
                    </div>
                    <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{p.titulo}</div>
                    <div
                      onClick={(e) => { e.stopPropagation(); copy(`${p.titulo}\n\n${p.contenido}`); }}
                      className="copy-pill"
                      style={{ padding: '5px 10px', borderRadius: 5, fontSize: 11.5, fontWeight: 500, color: 'var(--primary)', background: 'var(--primary-soft)', flexShrink: 0 }}
                    >
                      Copiar
                    </div>
                  </>
                }
              >
                {p.contenido}
              </AccordionItem>
            );
          })}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AsyncState>
  );
}
