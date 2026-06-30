import { useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import { useCopy } from '../store/app-context';
import type { PaymentPolicy } from '../lib/types';

const PAGE_SIZE = 10;

export function Suspensiones() {
  const copy = useCopy();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ policies: PaymentPolicy[] }>('/data/payment-policies');
  const policies = (data?.policies ?? []).filter((p) => p.tipo === 'Paquetes');

  const totalPages = Math.ceil(policies.length / PAGE_SIZE);
  const paged = policies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Políticas de suspensión y paquetes prepagados de la clínica.
        </p>
        {paged.map((sus) => (
          <div key={sus.id} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, background: 'var(--orange)', borderRadius: '50%', flexShrink: 0 }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{sus.titulo}</h3>
              </div>
              <button className="btn btn-soft btn-sm" onClick={() => copy(`${sus.titulo}\n\n${sus.contenido}`)}>Copiar</button>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{sus.contenido}</p>
          </div>
        ))}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AsyncState>
  );
}
