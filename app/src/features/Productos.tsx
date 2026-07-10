import { useMemo, useState, useEffect } from 'react';
import { Chips } from '../components/Chips';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import { api } from '../lib/api';
import { useApp } from '../store/app-context';
import { useAuth } from '../store/auth-context';
import { money } from '../lib/format';
import type { Product, InventarioItem } from '../lib/types';

const PAGE_SIZE = 24;

export function Productos() {
  const { toast } = useApp();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const [brand, setBrand] = useState('Todas');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ products: Product[] }>('/data/products');
  const products = useMemo(() => data?.products ?? [], [data]);

  // Admin: lista de ítems de inventario para vincular productos (habilita la Caja).
  const [items, setItems] = useState<Pick<InventarioItem, 'id' | 'nombre' | 'stock' | 'unidad'>[]>([]);
  // Overrides locales tras un PATCH (useResource cachea la lista original).
  const [vinculos, setVinculos] = useState<Record<number, Product['inventarioItem']>>({});

  useEffect(() => {
    if (!isAdmin) return;
    api.get<{ items: InventarioItem[] }>('/inventario')
      .then((d) => setItems(d.items.map((i) => ({ id: i.id, nombre: i.nombre, stock: i.stock, unidad: i.unidad }))))
      .catch(() => {});
  }, [isAdmin]);

  const vincular = async (p: Product, inventarioItemId: string | null) => {
    try {
      const d = await api.patch<{ product: Product }>(`/data/products/${p.id}`, { inventarioItemId });
      setVinculos((prev) => ({ ...prev, [p.id]: d.product.inventarioItem ?? null }));
      toast(inventarioItemId ? 'Producto vinculado al inventario — ya se puede vender en Caja' : 'Vínculo eliminado');
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'Error al vincular');
    }
  };

  const invDe = (p: Product) => (p.id in vinculos ? vinculos[p.id] : p.inventarioItem);

  const brands = useMemo(
    () => ['Todas', ...Array.from(new Set(products.map((p) => p.brand))).sort()],
    [products],
  );
  const filtered = brand === 'Todas' ? products : products.filter((p) => p.brand === brand);

  useEffect(() => { setPage(1); }, [brand]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <Chips options={brands} value={brand} onChange={setBrand} />
        <div className="grid-cards-sm">
          {paged.map((p) => {
            const inv = invDe(p);
            return (
              <div key={p.id} className="card card-hover" style={{ padding: 16 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.8px', textTransform: 'uppercase', background: 'var(--primary-soft)', display: 'inline-block', padding: '2px 6px', borderRadius: 3, marginBottom: 7 }}>
                  {p.brand}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.35, marginBottom: 5 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{money(p.price)}</div>
                  {inv && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: inv.stock > 0 ? '#EDF5EF' : '#FBF0EB', color: inv.stock > 0 ? '#3A6A4A' : '#C04040', padding: '2px 8px', borderRadius: 20 }}>
                      Stock: {inv.stock}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <select
                    value={inv?.id ?? ''}
                    onChange={(e) => vincular(p, e.target.value || null)}
                    title="Vincular con inventario para vender en Caja"
                    style={{
                      marginTop: 10, width: '100%', fontSize: 11.5, padding: '5px 8px',
                      border: '1px dashed var(--border)', borderRadius: 6,
                      background: 'var(--bg)', color: inv ? 'var(--text)' : 'var(--muted-2)', cursor: 'pointer',
                    }}
                  >
                    <option value="">Sin vínculo a inventario</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>{it.nombre} (stock {it.stock})</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AsyncState>
  );
}
