import { useEffect, useState, useMemo } from 'react';
import { Icon } from '../../lib/icons';
import { api } from '../../lib/api';
import { useInventario, type ItemInput, type MovimientoInput, type LocationInput } from './useInventario';
import type { InventarioItem, InventarioItemDetail, MovimientoTipo, StorageLocation } from '../../lib/types';
import { stockColor, MOTIVOS, TIPO_LABEL, TIPO_COLOR, TIPO_CONFIG, fmtCLP, fmtFecha, UNIDADES } from './inventarioShared';

// ── styles shared ─────────────────────────────────────────────────────────────

const inp: React.CSSProperties = { padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' };
const btnIcon: React.CSSProperties = { padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: 'pointer', fontSize: 12, color: 'var(--text)' };

// ── ItemFormModal ─────────────────────────────────────────────────────────────

function ItemFormModal({ item, categorias, onSave, onClose }: {
  item?: InventarioItem | null; categorias: string[];
  onSave: (input: ItemInput) => Promise<void>; onClose: () => void;
}) {
  const [form, setForm] = useState<ItemInput>({
    nombre: item?.nombre ?? '', sku: item?.sku ?? '', codigoBarras: item?.codigoBarras ?? '',
    descripcion: item?.descripcion ?? '', stock: item?.stock ?? 0, stockMinimo: item?.stockMinimo ?? 0,
    unidad: item?.unidad ?? 'unidad', categoria: item?.categoria ?? '', costo: item?.costo ?? 0, notas: item?.notas ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof ItemInput, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setErr('El nombre es requerido'); return; }
    setSaving(true); setErr('');
    try {
      await onSave({ ...form, sku: form.sku?.trim() || null, codigoBarras: form.codigoBarras?.trim() || null, descripcion: form.descripcion?.trim() || null, categoria: form.categoria?.trim() || null, notas: form.notas?.trim() || null });
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
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required style={inp} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>SKU</span><input value={form.sku ?? ''} onChange={e => set('sku', e.target.value)} style={inp} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Cód. de barras</span><input value={form.codigoBarras ?? ''} onChange={e => set('codigoBarras', e.target.value)} style={inp} /></label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Categoría</span>
                <input value={form.categoria ?? ''} onChange={e => set('categoria', e.target.value)} list="inv-categorias" style={inp} />
                <datalist id="inv-categorias">{categorias.map(c => <option key={c} value={c} />)}</datalist>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Unidad</span>
                <input value={form.unidad ?? 'unidad'} onChange={e => set('unidad', e.target.value)} list="inv-unidades" style={inp} />
                <datalist id="inv-unidades">{UNIDADES.map(u => <option key={u} value={u} />)}</datalist>
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Stock inicial</span><input type="number" min={0} value={form.stock ?? 0} onChange={e => set('stock', Number(e.target.value))} style={inp} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Stock mínimo</span><input type="number" min={0} value={form.stockMinimo ?? 0} onChange={e => set('stockMinimo', Number(e.target.value))} style={inp} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Costo unit. ($)</span><input type="number" min={0} value={form.costo ?? 0} onChange={e => set('costo', Number(e.target.value))} style={inp} /></label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Descripción</span><input value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)} style={inp} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Notas internas</span>
              <textarea rows={2} value={form.notas ?? ''} onChange={e => set('notas', e.target.value)} style={{ ...inp, resize: 'vertical' }} />
            </label>
          </div>
          {err && <p style={{ marginTop: 10, color: '#c0392b', fontSize: 13 }}>{err}</p>}
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: saving ? .6 : 1 }}>
              {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MovimientoModal ───────────────────────────────────────────────────────────

function MovimientoModal({ item, ubicaciones, initialUbicacionId, onSave, onClose }: {
  item: InventarioItem; ubicaciones: StorageLocation[]; initialUbicacionId?: string;
  onSave: (input: MovimientoInput) => Promise<void>; onClose: () => void;
}) {
  const [tipo,        setTipo]        = useState<MovimientoTipo>('ENTRADA');
  const [cantidad,    setCantidad]    = useState('');
  const [motivo,      setMotivo]      = useState('');
  const [notas,       setNotas]       = useState('');
  const [ubicacionId, setUbicacionId] = useState(initialUbicacionId ?? '');
  const [destId,      setDestId]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState('');

  const cantNum = Number(cantidad);
  const stockPreview = tipo === 'AJUSTE' ? cantNum : tipo === 'ENTRADA' ? item.stock + cantNum : tipo === 'TRASLADO' ? item.stock : Math.max(0, item.stock - cantNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantNum && cantNum !== 0) { setErr('Ingresa una cantidad'); return; }
    if (tipo === 'TRASLADO' && (!ubicacionId || !destId)) { setErr('Selecciona ubicación origen y destino'); return; }
    setSaving(true); setErr('');
    try {
      await onSave({ tipo, cantidad: cantNum, codigoMotivo: motivo || null, notas: notas.trim() || null, ubicacionId: ubicacionId || null, ubicacionDestinoId: destId || null });
      onClose();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const TIPOS: MovimientoTipo[] = ['ENTRADA', 'SALIDA', 'AJUSTE', 'TRASLADO'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Registrar movimiento</h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--muted)' }}>{item.nombre} · Stock: <strong>{item.stock} {item.unidad}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><Icon name="x" size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Tipo */}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border)', marginBottom: 16 }}>
            {TIPOS.map((t, i) => (
              <button key={t} type="button" onClick={() => { setTipo(t); setMotivo(''); setDestId(''); }}
                style={{ flex: 1, padding: '9px 4px', border: 'none', borderLeft: i > 0 ? '1px solid var(--border)' : 'none', background: tipo === t ? TIPO_COLOR[t] : 'var(--bg)', color: tipo === t ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: tipo === t ? 700 : 500, cursor: 'pointer' }}>
                {TIPO_LABEL[t]}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {/* Cantidad / nuevo stock */}
            {tipo !== 'TRASLADO' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{tipo === 'AJUSTE' ? 'Nuevo stock (valor absoluto)' : `Cantidad (${item.unidad})`}</span>
                <input type="number" min={0} value={cantidad} onChange={e => setCantidad(e.target.value)} required style={{ ...inp, fontSize: 16, fontWeight: 600 }} />
              </label>
            )}

            {/* TRASLADO: cantidad a trasladar */}
            {tipo === 'TRASLADO' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Cantidad a trasladar ({item.unidad})</span>
                <input type="number" min={0} value={cantidad} onChange={e => setCantidad(e.target.value)} required style={{ ...inp, fontSize: 16, fontWeight: 600 }} />
              </label>
            )}

            {/* Ubicación */}
            {ubicaciones.length > 0 && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{tipo === 'TRASLADO' ? 'Ubicación origen *' : 'Ubicación'}</span>
                <select value={ubicacionId} onChange={e => setUbicacionId(e.target.value)} style={inp} required={tipo === 'TRASLADO'}>
                  <option value="">— Sin especificar —</option>
                  {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.parent ? `${u.parent.nombre} › ` : ''}{u.nombre} ({u.codigo})</option>)}
                </select>
              </label>
            )}

            {/* Ubicación destino (solo TRASLADO) */}
            {tipo === 'TRASLADO' && ubicaciones.length > 0 && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Ubicación destino *</span>
                <select value={destId} onChange={e => setDestId(e.target.value)} style={inp} required>
                  <option value="">— Seleccionar —</option>
                  {ubicaciones.filter(u => u.id !== ubicacionId).map(u => <option key={u.id} value={u.id}>{u.parent ? `${u.parent.nombre} › ` : ''}{u.nombre} ({u.codigo})</option>)}
                </select>
              </label>
            )}

            {/* Motivo */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Motivo</span>
              <select value={motivo} onChange={e => setMotivo(e.target.value)} style={inp}>
                <option value="">Sin especificar</option>
                {MOTIVOS[tipo].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Notas</span>
              <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Opcional" style={inp} />
            </label>
          </div>

          {/* Preview stock */}
          {cantidad !== '' && tipo !== 'TRASLADO' && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Stock actual: <strong>{item.stock} {item.unidad}</strong></span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>→</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: stockPreview < item.stock ? '#c0392b' : '#2e7d32' }}>{stockPreview} {item.unidad}</span>
            </div>
          )}
          {tipo === 'TRASLADO' && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f3e5f5', borderRadius: 8, fontSize: 13, color: '#6a1b9a' }}>
              El stock total del ítem no cambia. Solo redistribuye entre ubicaciones.
            </div>
          )}

          {err && <p style={{ marginTop: 10, color: '#c0392b', fontSize: 13 }}>{err}</p>}

          <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>Cancelar</button>
            <button type="submit" disabled={saving || cantidad === ''} style={{ padding: '9px 20px', background: TIPO_COLOR[tipo], color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: (saving || cantidad === '') ? .6 : 1 }}>
              {saving ? 'Registrando…' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── HistorialModal ────────────────────────────────────────────────────────────

function HistorialModal({ item, onClose }: { item: InventarioItemDetail; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 640, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Historial — {item.nombre}</h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--muted)' }}>Stock actual: <strong>{item.stock} {item.unidad}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ overflowY: 'auto', padding: '8px 0' }}>
          {item.movimientos.length === 0 ? (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Sin movimientos registrados</p>
          ) : item.movimientos.map(m => {
            const tc = TIPO_CONFIG[m.tipo];
            return (
              <div key={m.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tc.bg, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tc.color }}>{tc.sign}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tc.color }}>{TIPO_LABEL[m.tipo]}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.cantidad} {item.unidad}</span>
                    {m.codigoMotivo && <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--border-soft)', padding: '1px 6px', borderRadius: 4 }}>{m.codigoMotivo}</span>}
                    {m.ubicacion && <span style={{ fontSize: 11, color: '#1565c0', background: '#e3f2fd', padding: '1px 6px', borderRadius: 4 }}>{m.ubicacion.nombre}</span>}
                    {m.ubicacionDestino && <><span style={{ fontSize: 11, color: 'var(--muted)' }}>→</span><span style={{ fontSize: 11, color: '#1565c0', background: '#e3f2fd', padding: '1px 6px', borderRadius: 4 }}>{m.ubicacionDestino.nombre}</span></>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {m.stockAntes} → {m.stockDespues} {item.unidad}
                    {m.notas && <> · {m.notas}</>}
                    {m.realizadoPor && <> · {m.realizadoPor.nombre}</>}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted-2)', flexShrink: 0 }}>{fmtFecha(m.fechaMovimiento)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── LocationFormModal ─────────────────────────────────────────────────────────

function LocationFormModal({ location, allLocations, onSave, onClose }: {
  location?: StorageLocation | null; allLocations: StorageLocation[];
  onSave: (input: LocationInput) => Promise<void>; onClose: () => void;
}) {
  const [form, setForm] = useState<LocationInput>({
    nombre: location?.nombre ?? '', codigo: location?.codigo ?? '',
    descripcion: location?.descripcion ?? '', tipo: location?.tipo ?? 'storage',
    parentId: location?.parentId ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof LocationInput, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.codigo.trim()) { setErr('Nombre y código son requeridos'); return; }
    setSaving(true); setErr('');
    try { await onSave(form); onClose(); }
    catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const parents = allLocations.filter(u => u.id !== location?.id && !u.parentId); // solo raíces como padre

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{location ? 'Editar ubicación' : 'Nueva ubicación'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><Icon name="x" size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'grid', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Nombre *</span><input value={form.nombre} onChange={e => set('nombre', e.target.value)} required style={inp} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Código *</span><input value={form.codigo} onChange={e => set('codigo', e.target.value)} required style={inp} placeholder="ALM-001" /></label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Tipo</span>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={inp}>
                <option value="storage">Almacén</option>
                <option value="box">Box</option>
                <option value="cart">Carro</option>
                <option value="room">Sala</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Ubicación padre</span>
            <select value={form.parentId ?? ''} onChange={e => set('parentId', e.target.value || null)} style={inp}>
              <option value="">— Sin padre (raíz) —</option>
              {parents.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.codigo})</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Descripción</span><input value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)} style={inp} /></label>
          {err && <p style={{ margin: 0, color: '#c0392b', fontSize: 13 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: saving ? .6 : 1 }}>
              {saving ? 'Guardando…' : location ? 'Guardar' : 'Crear ubicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'productos' | 'por-ubicacion' | 'almacenes';

export function Inventario() {
  const inv = useInventario();
  const [tab, setTab]               = useState<Tab>('productos');
  const [busqueda, setBusqueda]     = useState('');
  const [catFiltro, setCatFiltro]   = useState('');
  const [soloAlerta, setSoloAlerta] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [editando, setEditando]     = useState<InventarioItem | null>(null);
  const [movimientoItem, setMovimientoItem] = useState<InventarioItem | null>(null);
  const [movimientoUbic, setMovimientoUbic] = useState('');
  const [historialItem, setHistorialItem]   = useState<InventarioItemDetail | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState<string | null>(null);
  const [modalLocation, setModalLocation]   = useState(false);
  const [editLocation, setEditLocation]     = useState<StorageLocation | null>(null);
  const [porUbicacion, setPorUbicacion]     = useState<{ id: string; nombre: string; codigo: string; parentNombre: string | null; totalItems: number; valorTotal: number; bajoStock: number; items: { quantity: number; item: InventarioItem }[] }[]>([]);
  const [loadingPU, setLoadingPU]           = useState(false);
  const [toast, setToast]                   = useState<string | null>(null);

  useEffect(() => {
    inv.loadItems();
    inv.loadDashboard();
    inv.loadCategorias();
    inv.loadUbicaciones();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadPorUbicacion = async () => {
    setLoadingPU(true);
    try {
      const data = await api.get<{ locations: typeof porUbicacion }>('/inventario/por-ubicacion');
      setPorUbicacion(data.locations);
    } catch { /* silent */ }
    finally { setLoadingPU(false); }
  };

  useEffect(() => { if (tab === 'por-ubicacion') loadPorUbicacion(); }, [tab]);

  const filtered = useMemo(() => {
    let list = inv.items;
    if (catFiltro) list = list.filter(i => i.categoria === catFiltro);
    if (soloAlerta) list = list.filter(i => i.stockMinimo > 0 && i.stock <= i.stockMinimo);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(i => i.nombre.toLowerCase().includes(q) || (i.sku ?? '').toLowerCase().includes(q) || (i.categoria ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [inv.items, catFiltro, soloAlerta, busqueda]);

  const handleSaveItem = async (input: ItemInput) => {
    if (editando) { await inv.updateItem(editando.id, input); showToast('Producto actualizado'); }
    else { await inv.createItem(input); showToast('Producto creado'); }
    inv.loadDashboard(); inv.loadCategorias();
  };

  const handleMovimiento = async (itemId: string, input: MovimientoInput) => {
    await inv.registrarMovimiento(itemId, input);
    inv.loadDashboard();
    showToast('Movimiento registrado');
  };

  const handleDelete = async (item: InventarioItem) => {
    if (!window.confirm(`¿Dar de baja "${item.nombre}"?`)) return;
    await inv.deleteItem(item.id); showToast('Dado de baja'); inv.loadDashboard();
  };

  const abrirMovimiento = (item: InventarioItem, ubicacionId = '') => {
    setMovimientoUbic(ubicacionId);
    setMovimientoItem(item);
  };

  const exportarCSV = () => {
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ['Nombre', 'SKU', 'Categoría', 'Stock', 'Mínimo', 'Unidad', 'Costo', 'Estado', 'Ubicaciones'];
    const rows = filtered.map(i => {
      const ubic = (i.locationInventario ?? []).filter(li => li.quantity > 0).map(li => `${li.location.codigo}:${li.quantity}`).join('; ');
      return [i.nombre, i.sku ?? '', i.categoria ?? '', i.stock, i.stockMinimo, i.unidad, i.costo, stockColor(i).label, ubic].map(esc).join(',');
    });
    const csv = '﻿' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${filtered.length} productos exportados`);
  };

  const handleVerHistorial = async (item: InventarioItem) => {
    setLoadingHistorial(item.id);
    try { setHistorialItem(await inv.getItem(item.id)); }
    finally { setLoadingHistorial(null); }
  };

  const handleSaveLocation = async (input: LocationInput) => {
    if (editLocation) { await inv.updateUbicacion(editLocation.id, input); showToast('Ubicación actualizada'); }
    else { await inv.createUbicacion(input); showToast('Ubicación creada'); }
  };

  const handleDeleteLocation = async (loc: StorageLocation) => {
    if (!window.confirm(`¿Desactivar "${loc.nombre}"?`)) return;
    await inv.deleteUbicacion(loc.id); showToast('Ubicación desactivada');
  };

  const d = inv.dashboard;
  const TABS: { id: Tab; label: string }[] = [
    { id: 'productos', label: 'Productos' },
    { id: 'por-ubicacion', label: 'Por almacén' },
    { id: 'almacenes', label: `Almacenes (${inv.ubicaciones.length})` },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Inventario</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Control de stock · <a href="/inv" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>App móvil ↗</a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'almacenes' && (
            <button onClick={() => { setEditLocation(null); setModalLocation(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <Icon name="plus" size={14} /> Nueva ubicación
            </button>
          )}
          <button onClick={() => { setEditando(null); setModalNuevo(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <Icon name="plus" size={15} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Dashboard cards */}
      {d && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Productos', value: d.totalItems, icon: 'box', color: 'var(--primary)' },
            { label: 'Almacenes', value: d.totalUbicaciones, icon: 'grid', color: 'var(--primary)' },
            { label: 'Bajo stock', value: d.bajoStock, icon: 'info', color: d.bajoStock > 0 ? '#e67e22' : '#2e7d32' },
            { label: 'Sin stock', value: d.sinStock, icon: 'xc', color: d.sinStock > 0 ? '#c0392b' : '#2e7d32' },
            { label: 'Valor total', value: fmtCLP(d.valorTotal), icon: 'credit', color: 'var(--primary)', str: true },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <Icon name={c.icon as string} size={14} style={{ color: c.color }} />
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{c.label}</span>
              </div>
              <div style={{ fontSize: c.str ? 16 : 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', border: 'none', borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? 'var(--primary)' : 'var(--muted)', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: PRODUCTOS ── */}
      {tab === 'productos' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, SKU…"
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--bg)', color: 'var(--text)' }} />
            </div>
            <select value={catFiltro} onChange={e => setCatFiltro(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--bg)', color: 'var(--text)', minWidth: 140 }}>
              <option value="">Todas las categorías</option>
              {inv.categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setSoloAlerta(a => !a)}
              style={{ padding: '8px 12px', border: `1px solid ${soloAlerta ? '#e67e22' : 'var(--border)'}`, borderRadius: 8, background: soloAlerta ? '#fef3e2' : 'var(--bg)', color: soloAlerta ? '#e67e22' : 'var(--muted)', fontSize: 13, fontWeight: soloAlerta ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="bell" size={14} /> Alertas{soloAlerta ? ' ✕' : ''}
            </button>
            <button onClick={exportarCSV} disabled={filtered.length === 0} title="Exportar a CSV"
              style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', color: 'var(--muted)', fontSize: 13, cursor: filtered.length === 0 ? 'default' : 'pointer', opacity: filtered.length === 0 ? .5 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="download" size={14} /> Exportar
            </button>
          </div>

          {inv.loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Cargando…</div>
          ) : inv.error ? (
            <div style={{ padding: 24, background: '#fce8e8', borderRadius: 8, color: '#c0392b', fontSize: 14 }}>{inv.error}</div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                  {inv.items.length === 0 ? 'No hay productos. Crea el primero.' : 'Sin resultados.'}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                      {['Producto', 'Categoría', 'Stock', 'Mín.', 'Unidad', 'Costo', 'Ubicaciones', ''].map(h => (
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
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontSize: 13, fontWeight: 700 }}>{item.stock}</span>
                            <span style={{ marginLeft: 5, fontSize: 10, color: sc.color, fontWeight: 600 }}>{item.stock === 0 || (item.stockMinimo > 0 && item.stock <= item.stockMinimo) ? sc.label : ''}</span>
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{item.stockMinimo}</td>
                          <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{item.unidad}</td>
                          <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{item.costo > 0 ? fmtCLP(item.costo) : '—'}</td>
                          <td style={{ padding: '11px 14px', maxWidth: 160 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {(item.locationInventario ?? []).filter(li => li.quantity > 0).slice(0, 3).map(li => (
                                <span key={li.id} style={{ fontSize: 10, background: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                                  {li.location.codigo}: {li.quantity}
                                </span>
                              ))}
                              {(item.locationInventario ?? []).filter(li => li.quantity > 0).length > 3 && (
                                <span style={{ fontSize: 10, color: 'var(--muted)' }}>+{(item.locationInventario ?? []).filter(li => li.quantity > 0).length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button title="Registrar movimiento" onClick={() => abrirMovimiento(item)} style={{ ...btnIcon, marginRight: 4 }}><Icon name="plus" size={13} /></button>
                            <button title="Ver historial" onClick={() => handleVerHistorial(item)} disabled={loadingHistorial === item.id} style={{ ...btnIcon, marginRight: 4 }}>
                              {loadingHistorial === item.id ? '…' : <Icon name="clock" size={13} />}
                            </button>
                            <button title="Editar" onClick={() => { setEditando(item); setModalNuevo(true); }} style={{ ...btnIcon, marginRight: 4 }}><Icon name="edit" size={13} /></button>
                            <button title="Dar de baja" onClick={() => handleDelete(item)} style={{ ...btnIcon, color: '#c0392b' }}><Icon name="trash" size={13} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted-2)' }}>{filtered.length} de {inv.items.length} producto{inv.items.length !== 1 ? 's' : ''}</p>
        </>
      )}

      {/* ── TAB: POR UBICACIÓN ── */}
      {tab === 'por-ubicacion' && (
        <div>
          {loadingPU ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Cargando…</div>
          ) : porUbicacion.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              Sin ubicaciones configuradas. Créalas en la pestaña Almacenes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {porUbicacion.map(loc => (
                <div key={loc.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{loc.nombre}</span>
                      {loc.parentNombre && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>en {loc.parentNombre}</span>}
                      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted-2)', background: 'var(--border-soft)', padding: '1px 6px', borderRadius: 4 }}>{loc.codigo}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
                      <span><strong style={{ color: 'var(--text)' }}>{loc.totalItems}</strong> ítems</span>
                      {loc.bajoStock > 0 && <span style={{ color: '#e67e22' }}><strong>{loc.bajoStock}</strong> bajo mín.</span>}
                      <span><strong style={{ color: 'var(--text)' }}>{fmtCLP(loc.valorTotal)}</strong></span>
                    </div>
                  </div>
                  {loc.items.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Sin stock registrado en esta ubicación</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {loc.items.map(li => {
                          const sc = stockColor({ ...li.item, stock: li.quantity, stockMinimo: li.item.stockMinimo });
                          return (
                            <tr key={li.item.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                              <td style={{ padding: '9px 16px' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{li.item.nombre}</div>
                                {li.item.categoria && <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>{li.item.categoria}</div>}
                              </td>
                              <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontSize: 13, fontWeight: 700 }}>{li.quantity} {li.item.unidad}</span>
                              </td>
                              <td style={{ padding: '9px 16px', textAlign: 'right', width: 1, whiteSpace: 'nowrap' }}>
                                <button title="Registrar movimiento en esta ubicación"
                                  onClick={() => { const full = inv.items.find(it => it.id === li.item.id); if (full) abrirMovimiento(full, loc.id); else showToast('Abre la pestaña Productos primero'); }}
                                  style={btnIcon}><Icon name="plus" size={13} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ALMACENES ── */}
      {tab === 'almacenes' && (
        <div>
          {inv.ubicaciones.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              No hay ubicaciones configuradas. <button onClick={() => { setEditLocation(null); setModalLocation(true); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Crear primera</button>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    {['Nombre', 'Código', 'Tipo', 'Padre', 'Ítems', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: h === '' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inv.ubicaciones.map(loc => (
                    <tr key={loc.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{loc.nombre}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}><span style={{ background: 'var(--border-soft)', padding: '2px 8px', borderRadius: 4 }}>{loc.codigo}</span></td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{loc.tipo}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{loc.parent?.nombre ?? '—'}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--muted)' }}>{loc._count?.locationInventario ?? 0}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                        <button onClick={() => { setEditLocation(loc); setModalLocation(true); }} style={{ ...btnIcon, marginRight: 4 }}><Icon name="edit" size={13} /></button>
                        <button onClick={() => handleDeleteLocation(loc)} style={{ ...btnIcon, color: '#c0392b' }}><Icon name="trash" size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modalNuevo && <ItemFormModal item={editando} categorias={inv.categorias} onSave={handleSaveItem} onClose={() => { setModalNuevo(false); setEditando(null); }} />}
      {movimientoItem && <MovimientoModal item={movimientoItem} ubicaciones={inv.ubicaciones} initialUbicacionId={movimientoUbic} onSave={async input => { await handleMovimiento(movimientoItem.id, input); if (tab === 'por-ubicacion') loadPorUbicacion(); }} onClose={() => { setMovimientoItem(null); setMovimientoUbic(''); }} />}
      {historialItem && <HistorialModal item={historialItem} onClose={() => setHistorialItem(null)} />}
      {modalLocation && <LocationFormModal location={editLocation} allLocations={inv.ubicaciones} onSave={handleSaveLocation} onClose={() => { setModalLocation(false); setEditLocation(null); }} />}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, zIndex: 2000, boxShadow: '0 4px 16px rgba(0,0,0,.3)', whiteSpace: 'nowrap' }}>{toast}</div>
      )}
    </div>
  );
}
