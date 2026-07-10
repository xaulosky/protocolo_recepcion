import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { money } from '../../lib/format';
import { Icon } from '../../lib/icons';
import type { MetodoPago, Product, Venta } from '../../lib/types';
import { Comprobante } from './Comprobante';

interface CartItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  unidad: string;
}

const METODOS: { id: MetodoPago; label: string }[] = [
  { id: 'EFECTIVO', label: 'Efectivo' },
  { id: 'TARJETA', label: 'Tarjeta' },
  { id: 'TRANSFERENCIA', label: 'Transferencia' },
];

/** Tab principal de venta: picker de productos con stock + carrito + cobro. */
export function VenderTab({ onVenta }: { onVenta: () => void }) {
  const { toast } = useApp();
  // Carga directa (sin useResource): el stock debe refrescarse tras cada venta.
  const [productos, setProductos] = useState<Product[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [cliente, setCliente] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [cobrando, setCobrando] = useState(false);
  const [ventaOk, setVentaOk] = useState<Venta | null>(null);

  const cargarProductos = useCallback(async () => {
    try {
      const d = await api.get<{ products: Product[] }>('/data/products');
      setProductos(d.products);
    } catch {
      toast('Error al cargar productos');
    }
  }, [toast]);

  useEffect(() => { void cargarProductos(); }, [cargarProductos]);

  const vendibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos
      .filter((p) => p.inventarioItem && p.inventarioItem.stock > 0)
      .filter((p) => !q || `${p.brand} ${p.name}`.toLowerCase().includes(q))
      .slice(0, 30);
  }, [productos, busqueda]);

  const agregar = (p: Product) => {
    const stock = p.inventarioItem?.stock ?? 0;
    setCarrito((prev) => {
      const existe = prev.find((c) => c.productId === p.id);
      if (existe) {
        if (existe.cantidad >= stock) {
          toast(`Stock máximo: ${stock}`);
          return prev;
        }
        return prev.map((c) => c.productId === p.id ? { ...c, cantidad: c.cantidad + 1 } : c);
      }
      return [...prev, {
        productId: p.id,
        nombre: `${p.brand} ${p.name}`.trim(),
        precio: p.price,
        cantidad: 1,
        stock,
        unidad: p.inventarioItem?.unidad ?? 'unidad',
      }];
    });
  };

  const setCantidad = (productId: number, cantidad: number) => {
    setCarrito((prev) => prev.map((c) => {
      if (c.productId !== productId) return c;
      return { ...c, cantidad: Math.max(1, Math.min(cantidad, c.stock)) };
    }));
  };

  const setPrecio = (productId: number, precio: number) => {
    setCarrito((prev) => prev.map((c) => c.productId === productId ? { ...c, precio: Math.max(0, precio) } : c));
  };

  const quitar = (productId: number) => {
    setCarrito((prev) => prev.filter((c) => c.productId !== productId));
  };

  const subtotal = carrito.reduce((s, c) => s + c.precio * c.cantidad, 0);
  const total = Math.round(subtotal * (1 - descuento / 100));

  const cobrar = async () => {
    if (carrito.length === 0) { toast('Agrega al menos un producto'); return; }
    setCobrando(true);
    try {
      const d = await api.post<{ venta: Venta }>('/caja/ventas', {
        cliente: cliente.trim() || null,
        metodoPago,
        descuento,
        items: carrito.map((c) => ({ productId: c.productId, cantidad: c.cantidad, precioUnitario: c.precio })),
      });
      setVentaOk(d.venta);
      setCarrito([]);
      setCliente('');
      setDescuento(0);
      void cargarProductos(); // refrescar stock
      onVenta();              // refrescar cabecera del turno
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'Error al registrar la venta');
      void cargarProductos(); // el stock pudo cambiar (venta concurrente)
    } finally {
      setCobrando(false);
    }
  };

  if (ventaOk) {
    return <Comprobante venta={ventaOk} onNueva={() => setVentaOk(null)} />;
  }

  return (
    <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
      {/* Picker de productos */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', display: 'flex' }}>
            <Icon name="search" size={14} />
          </span>
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {vendibles.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
            {productos.length === 0
              ? 'Cargando productos...'
              : 'Sin productos con stock disponible. El admin debe vincular productos al inventario en la sección Productos.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 480, overflowY: 'auto' }}>
            {vendibles.map((p) => (
              <button
                key={p.id}
                onClick={() => agregar(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', textAlign: 'left',
                  border: '1px solid var(--border-soft)', borderRadius: 9, background: 'var(--surface)', cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.brand} {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>
                    Stock: {p.inventarioItem!.stock} {p.inventarioItem!.unidad}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>{money(p.price)}</div>
                <span style={{ color: 'var(--muted-2)', display: 'flex', flexShrink: 0 }}><Icon name="plus" size={14} /></span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrito */}
      <div className="card" style={{ padding: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Venta actual</div>
        {carrito.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
            Haz clic en un producto para agregarlo.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {carrito.map((c) => (
              <div key={c.productId} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-soft)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted-2)' }}>máx {c.stock}</div>
                </div>
                <input
                  type="number" min={1} max={c.stock} value={c.cantidad}
                  onChange={(e) => setCantidad(c.productId, Number(e.target.value))}
                  style={{ width: 52, padding: '4px 6px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center', background: 'var(--surface)', color: 'var(--text)' }}
                />
                <input
                  type="number" min={0} value={c.precio}
                  onChange={(e) => setPrecio(c.productId, Number(e.target.value))}
                  style={{ width: 84, padding: '4px 6px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 6, textAlign: 'right', background: 'var(--surface)', color: 'var(--text)' }}
                />
                <button onClick={() => quitar(c.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2 }}>
                  <Icon name="trash" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: 14, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10 }}>
            <div>
              <label className="label">Cliente (opcional)</label>
              <input className="input" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre" />
            </div>
            <div>
              <label className="label">Descuento %</label>
              <input className="input" type="number" min={0} max={100} value={descuento} onChange={(e) => setDescuento(Math.max(0, Math.min(100, Number(e.target.value))))} />
            </div>
          </div>

          <div>
            <label className="label">Método de pago</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {METODOS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetodoPago(m.id)}
                  style={{
                    flex: 1, padding: '7px 4px', fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: 'pointer',
                    border: metodoPago === m.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    background: metodoPago === m.id ? 'var(--primary-soft)' : 'var(--surface)',
                    color: metodoPago === m.id ? 'var(--primary)' : 'var(--muted)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--muted)' }}>
            <span>Subtotal</span><span>{money(subtotal)}</span>
          </div>
          {descuento > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--muted)' }}>
              <span>Descuento {descuento}%</span><span>-{money(subtotal - total)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
            <span>Total</span><span>{money(total)}</span>
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: 12, fontSize: 14, fontWeight: 600, opacity: carrito.length === 0 || cobrando ? 0.6 : 1 }}
            onClick={cobrar}
            disabled={carrito.length === 0 || cobrando}
          >
            {cobrando ? 'Registrando...' : `Cobrar ${money(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
