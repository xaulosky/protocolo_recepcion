import { useMemo, useState } from 'react';
import { Chips } from '../components/Chips';
import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import { money } from '../lib/format';
import type { Product } from '../lib/types';

export function Productos() {
  const [brand, setBrand] = useState('Todas');
  const { data, loading, error, reload } = useResource<{ products: Product[] }>('/data/products');
  const products = useMemo(() => data?.products ?? [], [data]);

  const brands = useMemo(
    () => ['Todas', ...Array.from(new Set(products.map((p) => p.brand))).sort()],
    [products],
  );
  const filtered = brand === 'Todas' ? products : products.filter((p) => p.brand === brand);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <Chips options={brands} value={brand} onChange={setBrand} />
        <div className="grid-cards-sm">
          {filtered.map((p) => (
            <div key={p.id} className="card card-hover" style={{ padding: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.8px', textTransform: 'uppercase', background: 'var(--primary-soft)', display: 'inline-block', padding: '2px 6px', borderRadius: 3, marginBottom: 7 }}>
                {p.brand}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.35, marginBottom: 5 }}>{p.name}</div>
              {p.description && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>}
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{money(p.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </AsyncState>
  );
}
