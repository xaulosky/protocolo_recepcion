import { useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import { Icon } from '../lib/icons';
import type { Box } from '../lib/types';

const PAGE_SIZE = 12;

export function Boxes() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ boxes: Box[] }>('/data/boxes');
  const boxes = data?.boxes ?? [];

  const totalPages = Math.ceil(boxes.length / PAGE_SIZE);
  const paged = boxes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div className="grid-cards">
          {paged.map((bx) => {
            const tecnologias = (bx.equipamiento ?? []).map((e) => e.nombre);
            return (
              <div key={bx.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, background: 'var(--primary-soft)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                    <Icon name="box" size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{bx.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{bx.tipo}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div className="eyebrow" style={{ marginBottom: 5 }}>Usos</div>
                  {bx.usosPrincipales.map((uso, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 3 }}>
                      <span style={{ width: 4, height: 4, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6, display: 'inline-block' }} />
                      {uso}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {tecnologias.length === 0 ? (
                    <span style={{ fontSize: 11, color: 'var(--muted-4)', fontStyle: 'italic' }}>Sin tecnologías asignadas</span>
                  ) : (
                    tecnologias.map((tec, i) => (
                      <span key={i} style={{ fontSize: 11, background: 'var(--primary-soft)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>{tec}</span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AsyncState>
  );
}
