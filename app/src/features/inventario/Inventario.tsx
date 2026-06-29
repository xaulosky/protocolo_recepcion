import { useEffect, useState, useMemo } from 'react';
import { Icon } from '../../lib/icons';
import { useInventario, type ItemInput, type MovimientoInput } from './useInventario';
import type { InventarioItem, InventarioItemDetail, MovimientoTipo } from '../../lib/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function fmtFecha(iso: string) {
  try { return new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function stockColor(item: InventarioItem): { bg: string; color: string; label: string } {
  if (item.stock === 0)                                          return { bg: '#fce8e8', color: '#c0392b', label: 'Sin stock' };
  if (item.stockMinimo > 0 && item.stock <= item.stockMinimo)   return { bg: '#fef3e2', color: '#e67e22', label: 'Bajo mínimo' };
  if (item.stockMinimo > 0 && item.stock <= item.stockMinimo * 1.5) return { bg: '#fefde8', color: '#b7950b', label: 'Bajo' };
  return { bg: '#e8f5e9', color: '#2e7d32', label: 'OK' };
}

const MOTIVOS: Record<MovimientoTipo, { value: string; label: string }[]> = {
  ENTRADA: [
    { value: 'compra', label: 'Compra' },
    { value: 'devolucion', label: 'Devolución' },
    { value: 'otro', label: 'Otro' },
  ],
  SALIDA: [
    { value: 'consumo', label: 'Consumo en procedimiento' },
    { value: 'vencimiento', label: 'Vencimiento' },
    { value: 'perdida', label: 'Pérdida / merma' },
    { value: 'otro', label: 'Otro' },
  ],
  AJUSTE: [
    { value: 'ajuste', label: 'Conteo físico' },
    { value: 'otro', label: 'Otro' },
  ],
};

const TIPO_LABEL: Record<MovimientoTipo, string> = { ENTRADA: 'Entrada', SALIDA: 'Salida', AJUSTE: 'Ajuste' };
const TIPO_COLOR: Record<MovimientoTipo, string> = { ENTRADA: '#2e7d32', SALIDA: '#c0392b', AJUSTE: '#1565c0' };

// ── modals ───────────────────────────────────────────────────────────────────

interface ItemFormModalProps {
  item?: InventarioItem | null;
  categorias: string[];
  onSave: (input: ItemInput) => Promise<void>;
  onClose: () => void;
}

function ItemFormModal({ item, categorias, onSave, onClose }: ItemFormModalProps) {
  const [form, setForm] = useState<ItemInput>({
    nombre: item?.nombre ?? '',
    sku: item?.sku ?? '',
    codigoBarras: item?.codigoBarras ?? '',
    descripcion: item?.descripcion ?? '',
    stock: item?.stock ?? 0,
    stockMinimo: item?.stockMinimo ?? 0,
    unidad: item?.unidad ?? 'unidad',
    categoria: item?.categoria ?? '',
    costo: item?.costo ?? 0,
    notas: item?.notas ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof ItemInput, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setErr('El nombre es requerido'); return; }
    setSaving(true); setErr('');
    try {
      await onSave({
        ...form,
        sku: form.sku?.trim() || null,
        codigoBarras: form.codigoBarras?.trim() || null,
        descripcion: form.descripcion?.trim() || null,
        categoria: form.categoria?.trim() || null,
        notas: form.notas?.trim() || null,
      });
      onClose();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{item ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><Icon name="x" size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Nombre *</span>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>SKU</span>
                <input value={form.sku ?? ''} onChange={e => set('sku', e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Cód. de barras</span>
                <input value={form.codigoBarras ?? ''} onChange={e => set('codigoBarras', e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Categoría</span>
                <input value={form.categoria ?? ''} onChange={e => set('categoria', e.target.value)}
                  list="inv-categorias"
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
                <datalist id="inv-categorias">
                  {categorias.map(c => <option key={c} value={c} />)}
                </datalist>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Unidad</span>
                <input value={form.unidad ?? 'unidad'} onChange={e => set('unidad', e.target.value)}
                  list="inv-unidades"
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
                <datalist id="inv-unidades">
                  {['unidad', 'caja', 'paquete', 'ml', 'cc', 'gr', 'kg', 'L', 'ampolla', 'vial', 'par'].map(u => <option key={u} value={u} />)}
                </datalist>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Stock inicial</span>
                <input type="number" min={0} value={form.stock ?? 0} onChange={e => set('stock', Number(e.target.value))}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Stock mínimo</span>
                <input type="number" min={0} value={form.stockMinimo ?? 0} onChange={e => set('stockMinimo', Number(e.target.value))}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Costo unit. ($)</span>
                <input type="number" min={0} value={form.costo ?? 0} onChange={e => set('costo', Number(e.target.value))}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Descripción</span>
              <input value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Notas internas</span>
              <textarea rows={2} value={form.notas ?? ''} onChange={e => set('notas', e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, resize: 'vertical', background: 'var(--bg)', color: 'var(--text)' }} />
            </label>
          </div>

          {err && <p style={{ marginTop: 10, color: '#c0392b', fontSize: 13 }}>{err}</p>}

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: saving ? .6 : 1 }}>
              {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Movimiento modal ─────────────────────────────────────────────────────────

interface MovimientoModalProps {
  item: InventarioItem;
  onSave: (input: MovimientoInput) => Promise<void>;
  onClose: () => void;
}

function MovimientoModal({ item, onSave, onClose }: MovimientoModalProps) {
  const [tipo, setTipo] = useState<MovimientoTipo>('ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const cantidadNum = Number(cantidad);
  const stockPreview = tipo === 'AJUSTE' ? cantidadNum
    : tipo === 'ENTRADA' ? item.stock + cantidadNum
    : Math.max(0, item.stock - cantidadNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantidadNum && cantidadNum !== 0) { setErr('Ingresa una cantidad'); return; }
    setSaving(true); setErr('');
    try {
      await onSave({ tipo, cantidad: cantidadNum, codigoMotivo: motivo || null, notas: notas.trim() || null });
      onClose();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Registrar movimiento</h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--muted)' }}>{item.nombre}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><Icon name="x" size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Tipo */}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border)', marginBottom: 16 }}>
            {(['ENTRADA', 'SALIDA', 'AJUSTE'] as MovimientoTipo[]).map((t, i) => (
              <button key={t} type="button" onClick={() => { setTipo(t); setMotivo(''); }}
                style={{
                  flex: 1, padding: '9px 4px', border: 'none',
                  borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                  background: tipo === t ? TIPO_COLOR[t] : 'var(--bg)',
                  color: tipo === t ? '#fff' : 'var(--muted)',
                  fontSize: 13, fontWeight: tipo === t ? 700 : 500, cursor: 'pointer',
                }}>
                {TIPO_LABEL[t]}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                {tipo === 'AJUSTE' ? 'Nuevo stock (valor absoluto)' : `Cantidad (${item.unidad})`}
              </span>
              <input type="number" min={0} value={cantidad}
                onChange={e => setCantidad(e.target.value)} required
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 16, fontWeight: 600, background: 'var(--bg)', color: 'var(--text)' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Motivo</span>
              <select value={motivo} onChange={e => setMotivo(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }}>
                <option value="">Sin especificar</option>
                {MOTIVOS[tipo].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Notas</span>
              <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Opcional"
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
            </label>
          </div>

          {/* Preview stock */}
          {cantidad !== '' && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Stock actual: <strong>{item.stock} {item.unidad}</strong></span>
              <Icon name="arrow" size={14} style={{ color: 'var(--muted)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: stockPreview < item.stock ? '#c0392b' : '#2e7d32' }}>
                {stockPreview} {item.unidad}
              </span>
            </div>
          )}

          {err && <p style={{ marginTop: 10, color: '#c0392b', fontSize: 13 }}>{err}</p>}

          <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving || cantidad === ''} style={{ padding: '9px 20px', background: TIPO_COLOR[tipo], color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: (saving || cantidad === '') ? .6 : 1 }}>
              {saving ? 'Registrando…' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Historial modal ──────────────────────────────────────────────────────────

interface HistorialModalProps {
  item: InventarioItemDetail;
  onClose: () => void;
}

function HistorialModal({ item, onClose }: HistorialModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Historial de movimientos</h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--muted)' }}>{item.nombre} · Stock actual: <strong>{item.stock} {item.unidad}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><Icon name="x" size={18} /></button>
        </div>

        <div style={{ overflowY: 'auto', padding: '8px 0' }}>
          {item.movimientos.length === 0 ? (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Sin movimientos registrados</p>
          ) : item.movimientos.map(m => (
            <div key={m.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${TIPO_COLOR[m.tipo]}18`, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: TIPO_COLOR[m.tipo] }}>{m.tipo === 'ENTRADA' ? '+' : m.tipo === 'SALIDA' ? '-' : '='}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TIPO_COLOR[m.tipo] }}>{TIPO_LABEL[m.tipo]}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.cantidad} {item.unidad}</span>
                  {m.codigoMotivo && <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--border-soft)', padding: '1px 6px', borderRadius: 4 }}>{m.codigoMotivo}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {m.stockAntes} → {m.stockDespues} {item.unidad}
                  {m.notas && <> · {m.notas}</>}
                  {m.realizadoPor && <> · {m.realizadoPor.nombre}</>}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted-2)', flexShrink: 0 }}>{fmtFecha(m.fechaMovimiento)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function Inventario() {
  const inv = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const [catFiltro, setCatFiltro] = useState('');
  const [soloAlerta, setSoloAlerta] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [editando, setEditando] = useState<InventarioItem | null>(null);
  const [movimientoItem, setMovimientoItem] = useState<InventarioItem | null>(null);
  const [historialItem, setHistorialItem] = useState<InventarioItemDetail | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    inv.loadItems();
    inv.loadDashboard();
    inv.loadCategorias();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    let list = inv.items;
    if (catFiltro) list = list.filter(i => i.categoria === catFiltro);
    if (soloAlerta) list = list.filter(i => i.stockMinimo > 0 && i.stock <= i.stockMinimo);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(i =>
        i.nombre.toLowerCase().includes(q) ||
        (i.sku ?? '').toLowerCase().includes(q) ||
        (i.categoria ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [inv.items, catFiltro, soloAlerta, busqueda]);

  const handleSaveItem = async (input: ItemInput) => {
    if (editando) {
      await inv.updateItem(editando.id, input);
      showToast('Producto actualizado');
    } else {
      await inv.createItem(input);
      showToast('Producto creado');
    }
    inv.loadDashboard();
    inv.loadCategorias();
  };

  const handleMovimiento = async (itemId: string, input: MovimientoInput) => {
    await inv.registrarMovimiento(itemId, input);
    inv.loadDashboard();
    showToast('Movimiento registrado');
  };

  const handleDelete = async (item: InventarioItem) => {
    if (!window.confirm(`¿Dar de baja "${item.nombre}"? Se ocultará del inventario activo.`)) return;
    await inv.deleteItem(item.id);
    showToast('Producto dado de baja');
    inv.loadDashboard();
  };

  const handleVerHistorial = async (item: InventarioItem) => {
    setLoadingHistorial(item.id);
    try {
      const detail = await inv.getItem(item.id);
      setHistorialItem(detail);
    } finally {
      setLoadingHistorial(null);
    }
  };

  const d = inv.dashboard;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Inventario</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Control de stock de insumos y materiales de la clínica
            {' · '}
            <a href="/inv" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Abrir app móvil ↗
            </a>
          </p>
        </div>
        <button onClick={() => { setEditando(null); setModalNuevo(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          <Icon name="plus" size={15} /> Nuevo producto
        </button>
      </div>

      {/* Dashboard cards */}
      {d && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Productos activos', value: d.totalItems, icon: 'box', color: 'var(--primary)' },
            { label: 'Bajo stock / mín.', value: d.bajoStock, icon: 'info', color: d.bajoStock > 0 ? '#e67e22' : '#2e7d32' },
            { label: 'Sin stock', value: d.sinStock, icon: 'xc', color: d.sinStock > 0 ? '#c0392b' : '#2e7d32' },
            { label: 'Valor total', value: fmtCLP(d.valorTotal), icon: 'credit', color: 'var(--primary)', str: true },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon name={c.icon as string} size={15} style={{ color: c.color }} />
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, SKU…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
        </div>
        <select value={catFiltro} onChange={e => setCatFiltro(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--bg)', color: 'var(--text)', minWidth: 150 }}>
          <option value="">Todas las categorías</option>
          {inv.categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setSoloAlerta(a => !a)}
          style={{ padding: '8px 14px', border: `1px solid ${soloAlerta ? '#e67e22' : 'var(--border)'}`, borderRadius: 8, background: soloAlerta ? '#fef3e2' : 'var(--bg)', color: soloAlerta ? '#e67e22' : 'var(--muted)', fontSize: 13, fontWeight: soloAlerta ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="bell" size={14} /> Alertas{soloAlerta ? ' ✕' : ''}
        </button>
      </div>

      {/* Table */}
      {inv.loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Cargando…</div>
      ) : inv.error ? (
        <div style={{ padding: 24, background: '#fce8e8', borderRadius: 8, color: '#c0392b', fontSize: 14 }}>{inv.error}</div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              {inv.items.length === 0 ? 'No hay productos en el inventario. Crea el primero.' : 'Sin resultados para los filtros aplicados.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Producto', 'Categoría', 'Stock', 'Mín.', 'Unidad', 'Costo', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === '' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const sc = stockColor(item);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{item.nombre}</div>
                        {item.sku && <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>SKU: {item.sku}</div>}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{item.categoria ?? '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontSize: 13, fontWeight: 700 }}>
                          {item.stock}
                        </span>
                        <span style={{ marginLeft: 6, fontSize: 10, color: sc.color, fontWeight: 600 }}>{item.stock === 0 || (item.stockMinimo > 0 && item.stock <= item.stockMinimo) ? sc.label : ''}</span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{item.stockMinimo}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{item.unidad}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{item.costo > 0 ? fmtCLP(item.costo) : '—'}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button title="Registrar movimiento" onClick={() => setMovimientoItem(item)}
                          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: 'pointer', marginRight: 4, fontSize: 12, color: 'var(--text)' }}>
                          <Icon name="plus" size={13} />
                        </button>
                        <button title="Ver historial" onClick={() => handleVerHistorial(item)} disabled={loadingHistorial === item.id}
                          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: 'pointer', marginRight: 4, fontSize: 12, color: 'var(--text)' }}>
                          {loadingHistorial === item.id ? '…' : <Icon name="clock" size={13} />}
                        </button>
                        <button title="Editar" onClick={() => { setEditando(item); setModalNuevo(true); }}
                          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: 'pointer', marginRight: 4, fontSize: 12, color: 'var(--text)' }}>
                          <Icon name="edit" size={13} />
                        </button>
                        <button title="Dar de baja" onClick={() => handleDelete(item)}
                          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: 'pointer', fontSize: 12, color: '#c0392b' }}>
                          <Icon name="trash" size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted-2)' }}>
        {filtered.length} de {inv.items.length} producto{inv.items.length !== 1 ? 's' : ''}
      </p>

      {/* Modals */}
      {modalNuevo && (
        <ItemFormModal
          item={editando}
          categorias={inv.categorias}
          onSave={handleSaveItem}
          onClose={() => { setModalNuevo(false); setEditando(null); }}
        />
      )}
      {movimientoItem && (
        <MovimientoModal
          item={movimientoItem}
          onSave={input => handleMovimiento(movimientoItem.id, input)}
          onClose={() => setMovimientoItem(null)}
        />
      )}
      {historialItem && (
        <HistorialModal item={historialItem} onClose={() => setHistorialItem(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, zIndex: 2000, boxShadow: '0 4px 16px rgba(0,0,0,.3)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
