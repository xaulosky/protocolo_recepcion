import { useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import { useCopy } from '../store/app-context';
import type { PaymentPolicy } from '../lib/types';

const PAGE_SIZE = 10;

export function Pagos() {
  const copy = useCopy();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ policies: PaymentPolicy[] }>('/data/payment-policies');
  const policies = (data?.policies ?? []).filter((p) => p.tipo !== 'Paquetes');

  const totalPages = Math.ceil(policies.length / PAGE_SIZE);
  const paged = policies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {paged.map((pol) => (
          <div key={pol.id} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{pol.titulo}</h3>
                <span className="badge">{pol.tipo}</span>
              </div>
              <button className="btn btn-soft btn-sm" onClick={() => copy(`${pol.titulo}\n\n${pol.contenido}`)}>Copiar</button>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{pol.contenido}</p>
          </div>
        ))}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AsyncState>
  );
}
