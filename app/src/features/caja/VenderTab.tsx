import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { money } from '../../lib/format';
import { Icon } from '../../lib/icons';
import type { MetodoPago, Product, Venta } from '../../lib/types';
import { Comprobante } from './Comprobante';
import { SearchSelect } from '../../components/SearchSelect';

/**
 * Un ítem del carrito es un producto (con stock que limita la cantidad) o un
 * tratamiento (sin stock; su precio lo fija quien vende, porque el catálogo
 * guarda un rango valorDesde/valorHasta).
 */
interface CartItem {
  key: string;            // 'p:12' | 't:toxina-tercio-superior'
  tipo: 'PRODUCTO' | 'TRATAMIENTO';
  productId?: number;
  treatmentId?: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number | null;   // null = sin límite (tratamiento)
  unidad: string;
  /** Sólo tratamientos: profesional que realiza la prestación. */
  professionalId?: string;
}

interface TratamientoVendible {
  id: string;
  nombre: string;
  categoria: string;
  valorDesde: number | null;
  valorHasta: number | null;
}

interface ProfesionalRef {
  id: string;
  nombreCompleto: string;
  especialidad: string;
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
  const [tratamientos, setTratamientos] = useState<TratamientoVendible[]>([]);
  const [profesionales, setProfesionales] = useState<ProfesionalRef[]>([]);
  const [pestana, setPestana] = useState<'PRODUCTO' | 'TRATAMIENTO'>('PRODUCTO');
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

  // El catálogo de tratamientos no cambia con la venta: basta cargarlo una vez.
  useEffect(() => {
    api.get<{ treatments: TratamientoVendible[] }>('/data/treatments')
      .then((d) => setTratamientos(d.treatments))
      .catch(() => toast('Error al cargar tratamientos'));
  }, [toast]);

  // Los profesionales alimentan el selector de "quién atendió" del carrito.
  useEffect(() => {
    api.get<{ professionals: ProfesionalRef[] }>('/data/professionals')
      .then((d) => setProfesionales(d.professionals))
      .catch(() => toast('Error al cargar profesionales'));
  }, [toast]);

  const opcionesProfesionales = useMemo(
    () => profesionales.map((p) => ({ id: p.id, label: p.nombreCompleto, sublabel: p.especialidad })),
    [profesionales],
  );

  const tratamientosVendibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return tratamientos
      .filter((t) => !q || t.nombre.toLowerCase().includes(q) || (t.categoria ?? '').toLowerCase().includes(q))
      .slice(0, 30);
  }, [tratamientos, busqueda]);

  const vendibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos
      .filter((p) => p.inventarioItem && p.inventarioItem.stock > 0)
      .filter((p) => !q || `${p.brand} ${p.name}`.toLowerCase().includes(q))
      .slice(0, 30);
  }, [productos, busqueda]);

  const agregar = (p: Product) => {
    const stock = p.inventarioItem?.stock ?? 0;
    const key = `p:${p.id}`;
    setCarrito((prev) => {
      const existe = prev.find((c) => c.key === key);
      if (existe) {
        if (existe.cantidad >= stock) {
          toast(`Stock máximo: ${stock}`);
          return prev;
        }
        return prev.map((c) => c.key === key ? { ...c, cantidad: c.cantidad + 1 } : c);
      }
      return [...prev, {
        key,
        tipo: 'PRODUCTO' as const,
        productId: p.id,
        nombre: `${p.brand} ${p.name}`.trim(),
        precio: p.price,
        cantidad: 1,
        stock,
        unidad: p.inventarioItem?.unidad ?? 'unidad',
      }];
    });
  };

  const agregarTratamiento = (t: TratamientoVendible) => {
    const key = `t:${t.id}`;
    setCarrito((prev) => {
      const existe = prev.find((c) => c.key === key);
      if (existe) return prev.map((c) => c.key === key ? { ...c, cantidad: c.cantidad + 1 } : c);
      return [...prev, {
        key,
        tipo: 'TRATAMIENTO' as const,
        treatmentId: t.id,
        nombre: t.nombre,
        // Sugerencia desde el catálogo; quien vende confirma el valor final.
        precio: t.valorDesde ?? 0,
        cantidad: 1,
        stock: null,
        unidad: 'sesión',
      }];
    });
  };

  const setCantidad = (key: string, cantidad: number) => {
    setCarrito((prev) => prev.map((c) => {
      if (c.key !== key) return c;
      const tope = c.stock ?? Number.MAX_SAFE_INTEGER;
      return { ...c, cantidad: Math.max(1, Math.min(cantidad, tope)) };
    }));
  };

  const setProfesional = (key: string, professionalId: string) => {
    setCarrito((prev) => prev.map((c) => c.key === key ? { ...c, professionalId: professionalId || undefined } : c));
  };

  const setPrecio = (key: string, precio: number) => {
    setCarrito((prev) => prev.map((c) => c.key === key ? { ...c, precio: Math.max(0, precio) } : c));
  };

  const quitar = (key: string) => {
    setCarrito((prev) => prev.filter((c) => c.key !== key));
  };

  const subtotal = carrito.reduce((s, c) => s + c.precio * c.cantidad, 0);
  const total = Math.round(subtotal * (1 - descuento / 100));

  const cobrar = async () => {
    if (carrito.length === 0) { toast('Agrega al menos un producto o tratamiento'); return; }
    // El backend tambien lo valida, pero avisar aqui evita perder la venta.
    const sinPrecio = carrito.find((c) => c.tipo === 'TRATAMIENTO' && c.precio <= 0);
    if (sinPrecio) { toast(`Indica el precio de "${sinPrecio.nombre}"`); return; }
    setCobrando(true);
    try {
      const d = await api.post<{ venta: Venta }>('/caja/ventas', {
        cliente: cliente.trim() || null,
        metodoPago,
        descuento,
        items: carrito.map((c) => c.tipo === 'TRATAMIENTO'
          ? { tipo: 'TRATAMIENTO', treatmentId: c.treatmentId, cantidad: c.cantidad, precioUnitario: c.precio, professionalId: c.professionalId ?? null }
          : { tipo: 'PRODUCTO', productId: c.productId, cantidad: c.cantidad, precioUnitario: c.precio }),
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
      {/* Picker: productos con stock o tratamientos del catálogo */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {([['PRODUCTO', 'Productos'], ['TRATAMIENTO', 'Tratamientos']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setPestana(id); setBusqueda(''); }}
              style={{
                flex: 1, padding: '7px 4px', fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: 'pointer',
                border: pestana === id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: pestana === id ? 'var(--primary-soft)' : 'var(--surface)',
                color: pestana === id ? 'var(--primary)' : 'var(--muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', display: 'flex' }}>
            <Icon name="search" size={14} />
          </span>
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder={pestana === 'PRODUCTO' ? 'Buscar producto...' : 'Buscar tratamiento...'}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {pestana === 'TRATAMIENTO' && (
          tratamientosVendibles.length === 0 ? (
            <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
              {tratamientos.length === 0 ? 'Cargando tratamientos...' : 'Sin tratamientos que coincidan.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 480, overflowY: 'auto' }}>
              {tratamientosVendibles.map((t) => (
                <button
                  key={t.id}
                  onClick={() => agregarTratamiento(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', textAlign: 'left',
                    border: '1px solid var(--border-soft)', borderRadius: 9, background: 'var(--surface)', cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.nombre}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>{t.categoria}</div>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>
                    {t.valorDesde
                      ? (t.valorHasta && t.valorHasta !== t.valorDesde
                          ? `${money(t.valorDesde)} – ${money(t.valorHasta)}`
                          : money(t.valorDesde))
                      : 'A convenir'}
                  </div>
                  <span style={{ color: 'var(--muted-2)', display: 'flex', flexShrink: 0 }}><Icon name="plus" size={14} /></span>
                </button>
              ))}
            </div>
          )
        )}

        {pestana === 'PRODUCTO' && (<>
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
        </>)}
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
              <div key={c.key} style={{ border: '1px solid var(--border-soft)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted-2)' }}>
                    {c.stock === null ? 'Tratamiento · fija el precio' : `máx ${c.stock}`}
                  </div>
                </div>
                <input
                  type="number" min={1} max={c.stock ?? undefined} value={c.cantidad}
                  onChange={(e) => setCantidad(c.key, Number(e.target.value))}
                  style={{ width: 52, padding: '4px 6px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center', background: 'var(--surface)', color: 'var(--text)' }}
                />
                <input
                  type="number" min={0} value={c.precio}
                  onChange={(e) => setPrecio(c.key, Number(e.target.value))}
                  style={{ width: 84, padding: '4px 6px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 6, textAlign: 'right', background: 'var(--surface)', color: 'var(--text)' }}
                />
                <button onClick={() => quitar(c.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2 }}>
                  <Icon name="trash" size={13} />
                </button>
                </div>

                {/* Quién atendió: sólo aplica a prestaciones, no a productos.
                    Con buscador, porque la lista de profesionales es larga y en
                    caja se necesita encontrarlos escribiendo, no desplazando. */}
                {c.tipo === 'TRATAMIENTO' && (
                  <div style={{ marginTop: 6 }}>
                    <SearchSelect
                      compact
                      options={opcionesProfesionales}
                      value={c.professionalId ?? null}
                      onChange={(id) => setProfesional(c.key, id ?? '')}
                      placeholder="¿Quién atendió? (opcional)"
                      clearLabel="Sin asignar"
                    />
                  </div>
                )}
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
