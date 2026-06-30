import { useEffect, useState, useCallback, useRef } from 'react';
import { api, setTokens, clearTokens, hasSession } from '../../lib/api';
import type { InventarioItem, InventarioItemDetail, InventarioDashboard, MovimientoTipo, StorageLocation } from '../../lib/types';
import type { ItemInput } from './useInventario';
import {
  stockColor, TIPO_CONFIG,
  MOTIVOS, UNIDADES, fmtCLP, fmtFecha, fmtFechaCorta, calcStockDespues,
} from './inventarioShared';

// ── types ─────────────────────────────────────────────────────────────────────

type Screen = 'home' | 'productos' | 'detalle' | 'movimiento' | 'form';
type NavTab  = 'home' | 'productos';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ── shared styles ─────────────────────────────────────────────────────────────

const S: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  background: '#F8F7F5',
  minHeight: '100svh',
  maxWidth: 430,
  margin: '0 auto',
  position: 'relative',
  paddingBottom: 72,
};
const HEADER: React.CSSProperties = {
  background: '#7C6247', color: '#fff', padding: '14px 16px 12px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  position: 'sticky', top: 0, zIndex: 10,
};
const CARD: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
};
const BTN_PRIMARY: React.CSSProperties = {
  background: '#7C6247', color: '#fff', border: 'none', borderRadius: 10,
  padding: '13px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%',
};
const INPUT: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0',
  borderRadius: 10, fontSize: 16, background: '#fff', boxSizing: 'border-box',
};
const LABEL_SM: React.CSSProperties = {
  fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: .5,
};

// ── login ─────────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [err,   setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';
      const res  = await fetch(`${BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al iniciar sesión');
      setTokens(data.accessToken, data.refreshToken);
      onLogin();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#7C6247', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360, boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#7C6247', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><rect x="1" y="10" width="22" height="12" rx="2"/><line x1="12" y1="10" x2="12" y2="22"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1918' }}>Inventario Cialo</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>Ingresa para continuar</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Correo electrónico"
            style={{ padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 15 }} />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="Contraseña"
            style={{ padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 15 }} />
          {err && <p style={{ margin: 0, color: '#c0392b', fontSize: 13 }}>{err}</p>}
          <button type="submit" disabled={loading}
            style={{ padding: '13px', background: '#7C6247', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, zIndex: 200, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
      {msg}
    </div>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────

function BottomNav({ active, onChange }: { active: NavTab; onChange: (t: NavTab) => void }) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home', label: 'Inicio',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      id: 'productos', label: 'Productos',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><rect x="1" y="10" width="22" height="12" rx="2"/><line x1="12" y1="10" x2="12" y2="22"/></svg>,
    },
  ];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: '1px solid #e0e0e0', display: 'flex', padding: '8px 0 max(8px, env(safe-area-inset-bottom))', zIndex: 20 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ flex: 1, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: active === t.id ? '#7C6247' : '#aaa' }}>
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: active === t.id ? 700 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────

function HomeScreen({
  dashboard, bajoStockItems, loading,
  onRefresh, onMovimiento, onLogout, installPrompt, onInstall,
}: {
  dashboard: InventarioDashboard | null;
  bajoStockItems: InventarioItem[];
  loading: boolean;
  onRefresh: () => void;
  onMovimiento: (item: InventarioItem, tipo?: MovimientoTipo) => void;
  onLogout: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
}) {
  const d = dashboard;
  return (
    <div style={S}>
      <div style={{ ...HEADER, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: 1 }}>Clínica Cialo</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {installPrompt && (
              <button onClick={onInstall}
                style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Instalar app
              </button>
            )}
            <button onClick={onRefresh} disabled={loading}
              style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer', opacity: loading ? .5 : 1 }}>
              {loading ? '…' : '↻'}
            </button>
          </div>
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3 }}>Inventario</span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Stats 4 cards */}
        {d && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Productos', value: String(d.totalItems), color: '#7C6247' },
              { label: 'Valor total', value: fmtCLP(d.valorTotal), color: '#7C6247', small: true },
              { label: 'Bajo mínimo', value: String(d.bajoStock), color: d.bajoStock > 0 ? '#e67e22' : '#2e7d32' },
              { label: 'Sin stock',   value: String(d.sinStock),  color: d.sinStock  > 0 ? '#c0392b' : '#2e7d32' },
            ].map(s => (
              <div key={s.label} style={{ ...CARD, textAlign: 'center', padding: '14px 10px' }}>
                <div style={{ fontSize: s.small ? 16 : 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Alertas bajo stock */}
        {bajoStockItems.length > 0 && (
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e67e22' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e67e22' }}>Bajo stock ({bajoStockItems.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bajoStockItems.slice(0, 6).map(item => {
                const sc = stockColor(item);
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1918', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>Mín: {item.stockMinimo} {item.unidad}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: sc.color }}>{item.stock}</span>
                      <button onClick={() => onMovimiento(item, 'ENTRADA')}
                        style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid #2e7d32', background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                );
              })}
              {bajoStockItems.length > 6 && (
                <div style={{ textAlign: 'center', fontSize: 12, color: '#aaa', paddingTop: 4 }}>y {bajoStockItems.length - 6} más…</div>
              )}
            </div>
          </div>
        )}

        {/* Últimos movimientos */}
        {d && d.ultimosMovimientos.length > 0 && (
          <div style={CARD}>
            <div style={{ ...LABEL_SM, marginBottom: 10 }}>Últimos movimientos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {d.ultimosMovimientos.slice(0, 10).map(m => {
                const tc = TIPO_CONFIG[m.tipo];
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: tc.color }}>{tc.sign}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1918', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.item?.nombre ?? 'Producto'}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>
                        {tc.label} · {m.cantidad} {m.item?.unidad}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>{fmtFechaCorta(m.fechaMovimiento)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={onLogout}
          style={{ ...CARD, border: '1px solid #e0e0e0', textAlign: 'center', color: '#888', fontSize: 13, cursor: 'pointer', padding: '12px', background: '#fff' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ── ProductosScreen ───────────────────────────────────────────────────────────

function ProductosScreen({
  items, categorias, loading,
  onDetalle, onNuevo,
}: {
  items: InventarioItem[];
  categorias: string[];
  loading: boolean;
  onDetalle: (item: InventarioItem) => void;
  onNuevo: () => void;
}) {
  const [q,   setQ]   = useState('');
  const [cat, setCat] = useState('');

  const filtered = items.filter(item => {
    if (cat && item.categoria !== cat) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return item.nombre.toLowerCase().includes(lq) || (item.sku ?? '').toLowerCase().includes(lq);
    }
    return true;
  });

  return (
    <div style={S}>
      <div style={{ ...HEADER }}>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Productos</span>
        <button onClick={onNuevo}
          style={{ background: 'rgba(255,255,255,.25)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + Nuevo
        </button>
      </div>

      <div style={{ padding: '12px 16px 8px', background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o SKU…"
          style={{ ...INPUT, padding: '10px 14px', fontSize: 15 }} />
        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <button onClick={() => setCat('')}
            style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${cat === '' ? '#7C6247' : '#e0e0e0'}`, background: cat === '' ? '#7C6247' : '#fff', color: cat === '' ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Todas
          </button>
          {categorias.map(c => (
            <button key={c} onClick={() => setCat(cat === c ? '' : c)}
              style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${cat === c ? '#7C6247' : '#e0e0e0'}`, background: cat === c ? '#7C6247' : '#fff', color: cat === c ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontSize: 14 }}>Cargando…</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 14 }}>Sin resultados</div>
        )}
        {filtered.map(item => {
          const sc = stockColor(item);
          return (
            <button key={item.id} onClick={() => onDetalle(item)}
              style={{ ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '14px 16px', width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1918', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  {item.categoria ?? '—'}{item.sku ? ` · SKU: ${item.sku}` : ''}
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right', marginLeft: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: sc.color }}>{item.stock}</div>
                <div style={{ fontSize: 11, color: sc.color, fontWeight: 600 }}>{item.unidad}</div>
              </div>
              <svg style={{ marginLeft: 8, flexShrink: 0, color: '#ccc' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          );
        })}
        <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', paddingTop: 4 }}>
          {filtered.length} de {items.length} producto{items.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

// ── DetalleScreen ─────────────────────────────────────────────────────────────

function DetalleScreen({
  item, onBack, onMovimiento, onEditar, onBaja,
}: {
  item: InventarioItemDetail;
  onBack: () => void;
  onMovimiento: (tipo?: MovimientoTipo) => void;
  onEditar: () => void;
  onBaja: () => void;
}) {
  const sc = stockColor(item);
  return (
    <div style={S}>
      <div style={HEADER}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{item.nombre}</span>
        <button onClick={onEditar}
          style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Editar
        </button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Ficha */}
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1918' }}>{item.nombre}</div>
              {item.categoria && <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{item.categoria}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: sc.color }}>{item.stock}</div>
              <div style={{ fontSize: 12, color: sc.color, fontWeight: 600 }}>{item.unidad} · {sc.label}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Stock mínimo', value: `${item.stockMinimo} ${item.unidad}` },
              { label: 'Costo unitario', value: item.costo > 0 ? fmtCLP(item.costo) : '—' },
              { label: 'Valor en stock', value: item.costo > 0 ? fmtCLP(item.costo * item.stock) : '—' },
              { label: 'SKU', value: item.sku ?? '—' },
              { label: 'Cód. barras', value: item.codigoBarras ?? '—' },
              { label: 'Unidad', value: item.unidad },
            ].map(r => (
              <div key={r.label} style={{ background: '#f8f7f5', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1918' }}>{r.value}</div>
              </div>
            ))}
          </div>
          {item.descripcion && <p style={{ margin: '12px 0 0', fontSize: 13, color: '#555' }}>{item.descripcion}</p>}
          {item.notas      && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>{item.notas}</p>}
        </div>

        {/* Ubicaciones */}
        {(item.locationInventario ?? []).filter(li => li.quantity > 0).length > 0 && (
          <div style={{ ...CARD, padding: '12px 14px' }}>
            <div style={{ ...LABEL_SM, marginBottom: 8 }}>Distribución por almacén</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(item.locationInventario ?? []).filter(li => li.quantity > 0).map(li => (
                <div key={li.id} style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  {li.location.nombre}: {li.quantity} {item.unidad}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(['ENTRADA', 'SALIDA', 'AJUSTE', 'TRASLADO'] as MovimientoTipo[]).map(t => {
            const tc = TIPO_CONFIG[t];
            return (
              <button key={t} onClick={() => onMovimiento(t)}
                style={{ padding: '10px 4px', borderRadius: 10, border: `2px solid ${tc.color}`, background: tc.bg, color: tc.color, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {tc.sign} {tc.label}
              </button>
            );
          })}
        </div>

        {/* Historial */}
        <div style={CARD}>
          <div style={{ ...LABEL_SM, marginBottom: 10 }}>Historial ({item.movimientos.length})</div>
          {item.movimientos.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#aaa', textAlign: 'center', padding: '12px 0' }}>Sin movimientos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {item.movimientos.map(m => {
                const tc = TIPO_CONFIG[m.tipo];
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid #f0ede9' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: tc.color }}>{tc.sign}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1918' }}>
                        {tc.label} · <span style={{ color: tc.color }}>{m.cantidad} {item.unidad}</span>
                        {m.codigoMotivo && <span style={{ marginLeft: 6, fontSize: 11, color: '#aaa', background: '#f0ede9', padding: '1px 6px', borderRadius: 4 }}>{m.codigoMotivo}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                        {m.stockAntes} → {m.stockDespues} {item.unidad}
                        {m.ubicacion && <> · <span style={{ color: '#1565c0' }}>{m.ubicacion.nombre}{m.ubicacionDestino ? ` → ${m.ubicacionDestino.nombre}` : ''}</span></>}
                        {m.notas && ` · ${m.notas}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>{fmtFecha(m.fechaMovimiento)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Baja */}
        <button onClick={onBaja}
          style={{ padding: '12px', borderRadius: 10, border: '1.5px solid #c0392b', background: '#fce8e8', color: '#c0392b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Dar de baja este producto
        </button>
      </div>
    </div>
  );
}

// ── MovimientoScreen ──────────────────────────────────────────────────────────

function MovimientoScreen({
  item, initialTipo, ubicaciones, onBack, onSave,
}: {
  item: InventarioItem;
  initialTipo: MovimientoTipo;
  ubicaciones: StorageLocation[];
  onBack: () => void;
  onSave: (tipo: MovimientoTipo, cantidad: number, codigoMotivo: string | null, notas: string | null, ubicacionId: string | null, ubicacionDestinoId: string | null) => Promise<void>;
}) {
  const [tipo,    setTipo]    = useState<MovimientoTipo>(initialTipo);
  const [cantidad, setCantidad] = useState('');
  const [motivo,  setMotivo]  = useState('');
  const [notas,   setNotas]   = useState('');
  const [ubicId,  setUbicId]  = useState('');
  const [destId,  setDestId]  = useState('');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const cantNum = Number(cantidad);
  const preview = (cantidad && tipo !== 'TRASLADO') ? calcStockDespues(item, tipo, cantNum) : null;
  const tc = TIPO_CONFIG[tipo];

  const handleTipoChange = (t: MovimientoTipo) => { setTipo(t); setMotivo(''); setUbicId(''); setDestId(''); };

  const submit = async () => {
    if (!cantidad) return;
    if (tipo === 'TRASLADO' && (!ubicId || !destId)) { setErr('Selecciona ubicación origen y destino'); return; }
    setSaving(true); setErr('');
    try {
      await onSave(tipo, cantNum, motivo || null, notas.trim() || null, ubicId || null, destId || null);
    } catch (e) { setErr((e as Error).message); setSaving(false); }
  };

  return (
    <div style={S}>
      <div style={HEADER}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Registrar movimiento</span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...CARD, borderLeft: `4px solid ${tc.color}` }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 3 }}>Producto</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1918' }}>{item.nombre}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>
            Stock actual: <strong style={{ color: stockColor(item).color }}>{item.stock} {item.unidad}</strong>
          </div>
        </div>

        {/* Tipo */}
        <div style={CARD}>
          <div style={{ ...LABEL_SM, marginBottom: 10 }}>Tipo de movimiento</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['ENTRADA', 'SALIDA', 'AJUSTE', 'TRASLADO'] as MovimientoTipo[]).map(t => {
              const c = TIPO_CONFIG[t];
              const active = tipo === t;
              return (
                <button key={t} onClick={() => handleTipoChange(t)}
                  style={{ padding: '10px 4px', borderRadius: 8, border: `2px solid ${active ? c.color : '#e0e0e0'}`, background: active ? c.bg : '#fff', color: active ? c.color : '#888', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                  {c.sign} {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cantidad */}
        <div style={CARD}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={LABEL_SM}>{tipo === 'AJUSTE' ? 'Nuevo stock (absoluto)' : `Cantidad en ${item.unidad}`}</span>
            <input type="number" min={0} inputMode="numeric" value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              style={{ ...INPUT, fontSize: 28, fontWeight: 700, textAlign: 'center', color: tc.color }}
              autoFocus />
          </label>
          {preview !== null && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8f7f5', borderRadius: 8, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#888' }}>Nuevo stock: </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: preview === 0 ? '#c0392b' : preview <= (item.stockMinimo ?? 0) ? '#e67e22' : '#2e7d32' }}>
                {preview} {item.unidad}
              </span>
            </div>
          )}
          {tipo === 'TRASLADO' && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#f3e5f5', borderRadius: 8, fontSize: 12, color: '#6a1b9a' }}>
              El stock total no cambia — solo redistribuye entre almacenes
            </div>
          )}
        </div>

        {/* Ubicaciones */}
        {ubicaciones.length > 0 && (
          <div style={CARD}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={LABEL_SM}>{tipo === 'TRASLADO' ? 'Almacén origen *' : 'Almacén (opcional)'}</span>
                <select value={ubicId} onChange={e => setUbicId(e.target.value)} style={{ ...INPUT, fontSize: 15 }} required={tipo === 'TRASLADO'}>
                  <option value="">— Sin especificar —</option>
                  {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.parent ? `${u.parent.nombre} › ` : ''}{u.nombre}</option>)}
                </select>
              </label>
              {tipo === 'TRASLADO' && (
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={LABEL_SM}>Almacén destino *</span>
                  <select value={destId} onChange={e => setDestId(e.target.value)} style={{ ...INPUT, fontSize: 15 }} required>
                    <option value="">— Seleccionar —</option>
                    {ubicaciones.filter(u => u.id !== ubicId).map(u => <option key={u.id} value={u.id}>{u.parent ? `${u.parent.nombre} › ` : ''}{u.nombre}</option>)}
                  </select>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Motivo */}
        <div style={CARD}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={LABEL_SM}>Motivo</span>
            <select value={motivo} onChange={e => setMotivo(e.target.value)}
              style={{ ...INPUT, fontSize: 15 }}>
              <option value="">Sin especificar</option>
              {MOTIVOS[tipo].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>
        </div>

        {/* Notas */}
        <div style={CARD}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={LABEL_SM}>Notas (opcional)</span>
            <input value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Ej: Factura #123, consumo sala 2…"
              style={INPUT} />
          </label>
        </div>

        {err && <p style={{ margin: 0, color: '#c0392b', fontSize: 13 }}>{err}</p>}

        <button onClick={submit} disabled={saving || !cantidad}
          style={{ ...BTN_PRIMARY, background: tc.color, opacity: (saving || !cantidad) ? .6 : 1 }}>
          {saving ? 'Registrando…' : `Registrar ${tc.label}`}
        </button>
      </div>
    </div>
  );
}

// ── FormScreen ────────────────────────────────────────────────────────────────

function FormScreen({
  item, categorias, onBack, onSave,
}: {
  item?: InventarioItem | null;
  categorias: string[];
  onBack: () => void;
  onSave: (input: ItemInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ItemInput>({
    nombre:       item?.nombre       ?? '',
    sku:          item?.sku          ?? '',
    codigoBarras: item?.codigoBarras ?? '',
    descripcion:  item?.descripcion  ?? '',
    stock:        item?.stock        ?? 0,
    stockMinimo:  item?.stockMinimo  ?? 0,
    unidad:       item?.unidad       ?? 'unidad',
    categoria:    item?.categoria    ?? '',
    costo:        item?.costo        ?? 0,
    notas:        item?.notas        ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const set = (k: keyof ItemInput, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setErr('El nombre es requerido'); return; }
    setSaving(true); setErr('');
    try {
      await onSave({
        ...form,
        sku:          form.sku?.trim()          || null,
        codigoBarras: form.codigoBarras?.trim() || null,
        descripcion:  form.descripcion?.trim()  || null,
        categoria:    form.categoria?.trim()    || null,
        notas:        form.notas?.trim()        || null,
      });
    } catch (e) { setErr((e as Error).message); setSaving(false); }
  };

  const field = (label: string, node: React.ReactNode) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={LABEL_SM}>{label}</span>
      {node}
    </label>
  );
  const inp = (extra?: React.InputHTMLAttributes<HTMLInputElement>) => ({ style: INPUT, ...extra });

  return (
    <div style={S}>
      <div style={HEADER}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0 }}>
          ← Volver
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{item ? 'Editar producto' : 'Nuevo producto'}</span>
        <div style={{ width: 60 }} />
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={CARD}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {field('Nombre *', <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required {...inp()} />)}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('SKU', <input value={form.sku ?? ''} onChange={e => set('sku', e.target.value)} {...inp()} />)}
              {field('Cód. barras', <input value={form.codigoBarras ?? ''} onChange={e => set('codigoBarras', e.target.value)} {...inp()} />)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('Categoría',
                <>
                  <input value={form.categoria ?? ''} onChange={e => set('categoria', e.target.value)} list="pwa-cats" {...inp()} />
                  <datalist id="pwa-cats">{categorias.map(c => <option key={c} value={c} />)}</datalist>
                </>
              )}
              {field('Unidad',
                <>
                  <input value={form.unidad ?? 'unidad'} onChange={e => set('unidad', e.target.value)} list="pwa-units" {...inp()} />
                  <datalist id="pwa-units">{UNIDADES.map(u => <option key={u} value={u} />)}</datalist>
                </>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {field('Stock inicial', <input type="number" min={0} value={form.stock ?? 0} onChange={e => set('stock', Number(e.target.value))} {...inp()} />)}
              {field('Stock mínimo', <input type="number" min={0} value={form.stockMinimo ?? 0} onChange={e => set('stockMinimo', Number(e.target.value))} {...inp()} />)}
              {field('Costo ($)', <input type="number" min={0} value={form.costo ?? 0} onChange={e => set('costo', Number(e.target.value))} {...inp()} />)}
            </div>

            {field('Descripción', <input value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)} {...inp()} />)}
            {field('Notas internas', <textarea rows={2} value={form.notas ?? ''} onChange={e => set('notas', e.target.value)}
              style={{ ...INPUT, resize: 'vertical', fontSize: 15 }} />)}
          </div>
        </div>

        {err && <p style={{ margin: 0, color: '#c0392b', fontSize: 13 }}>{err}</p>}

        <button type="submit" disabled={saving}
          style={{ ...BTN_PRIMARY, opacity: saving ? .6 : 1 }}>
          {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </form>
    </div>
  );
}

// ── Main PWA ──────────────────────────────────────────────────────────────────

export function InventarioPWA() {
  const [authed, setAuthed] = useState(hasSession());

  // ── state ──
  const [screen,      setScreen]      = useState<Screen>('home');
  const [navTab,      setNavTab]      = useState<NavTab>('home');
  const [dashboard,   setDashboard]   = useState<InventarioDashboard | null>(null);
  const [items,       setItems]       = useState<InventarioItem[]>([]);
  const [categorias,  setCategorias]  = useState<string[]>([]);
  const [ubicaciones, setUbicaciones] = useState<StorageLocation[]>([]);
  const [loadingHome, setLoadingHome] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [toast,       setToast]       = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // For detalle / movimiento / form
  const [detalleItem, setDetalleItem]   = useState<InventarioItemDetail | null>(null);
  const [movItem,     setMovItem]       = useState<InventarioItem | null>(null);
  const [movTipo,     setMovTipo]       = useState<MovimientoTipo>('SALIDA');
  const [formItem,    setFormItem]      = useState<InventarioItem | null | undefined>(undefined);
  // undefined = not open, null = new, InventarioItem = edit

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // ── beforeinstallprompt ──
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ── loaders ──
  const loadHome = useCallback(async () => {
    setLoadingHome(true);
    try {
      const [db] = await Promise.all([
        api.get<{ dashboard: InventarioDashboard }>('/inventario/dashboard'),
      ]);
      setDashboard(db.dashboard);
    } catch { /* silent */ }
    finally { setLoadingHome(false); }
  }, []);

  const loadProductos = useCallback(async () => {
    setLoadingList(true);
    try {
      const [it, cats, locs] = await Promise.all([
        api.get<{ items: InventarioItem[] }>('/inventario'),
        api.get<{ categorias: string[] }>('/inventario/categorias'),
        api.get<{ locations: StorageLocation[] }>('/inventario/ubicaciones'),
      ]);
      setItems(it.items);
      setCategorias(cats.categorias);
      setUbicaciones(locs.locations);
    } catch { /* silent */ }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { if (authed) { loadHome(); loadProductos(); } }, [authed]);

  // ── nav tab ──
  const handleNavTab = (tab: NavTab) => {
    setNavTab(tab);
    setScreen(tab);
  };

  // ── open detalle ──
  const openDetalle = async (item: InventarioItem) => {
    try {
      const data = await api.get<{ item: InventarioItemDetail }>(`/inventario/${item.id}`);
      setDetalleItem(data.item);
      setScreen('detalle');
    } catch (e) { showToast(`Error: ${(e as Error).message}`); }
  };

  // ── registrar movimiento ──
  const submitMovimiento = async (tipo: MovimientoTipo, cantidad: number, codigoMotivo: string | null, notas: string | null, ubicacionId: string | null, ubicacionDestinoId: string | null) => {
    if (!movItem) return;
    const data = await api.post<{ movimiento: { stockDespues: number } }>(
      `/inventario/${movItem.id}/movimiento`,
      { tipo, cantidad, codigoMotivo, notas, ubicacionId, ubicacionDestinoId },
    );
    // Optimistic update: no extra GET needed
    const nuevoStock = data.movimiento.stockDespues;
    setItems(prev => prev.map(i => i.id === movItem.id ? { ...i, stock: nuevoStock } : i));
    // Update detalle if open for same item
    if (detalleItem?.id === movItem.id) {
      setDetalleItem(prev => prev ? { ...prev, stock: nuevoStock } : prev);
    }
    // Refresh dashboard counters silently
    loadHome();
    showToast('Movimiento registrado ✓');
    // Return to origin screen
    if (screen === 'movimiento') {
      if (detalleItem?.id === movItem.id) {
        // Refresh detalle
        const updated = await api.get<{ item: InventarioItemDetail }>(`/inventario/${movItem.id}`);
        setDetalleItem(updated.item);
        setScreen('detalle');
      } else {
        setScreen(navTab);
      }
    }
  };

  // ── crear / editar producto ──
  const submitForm = async (input: ItemInput) => {
    if (formItem) {
      // edit
      const data = await api.patch<{ item: InventarioItem }>(`/inventario/${formItem.id}`, input);
      setItems(prev => prev.map(i => i.id === formItem.id ? data.item : i));
      if (detalleItem?.id === formItem.id) {
        setDetalleItem(prev => prev ? { ...prev, ...data.item } : prev);
      }
      showToast('Producto actualizado ✓');
      setScreen('detalle');
    } else {
      // new
      const data = await api.post<{ item: InventarioItem }>('/inventario', input);
      setItems(prev => [...prev, data.item].sort((a, b) =>
        (a.categoria ?? '').localeCompare(b.categoria ?? '') || a.nombre.localeCompare(b.nombre)
      ));
      loadHome();
      showToast('Producto creado ✓');
      // Open detalle for new item
      const detail = await api.get<{ item: InventarioItemDetail }>(`/inventario/${data.item.id}`);
      setDetalleItem(detail.item);
      setScreen('detalle');
    }
    setFormItem(undefined);
  };

  // ── dar de baja ──
  const darDeBaja = async () => {
    if (!detalleItem) return;
    if (!window.confirm(`¿Dar de baja "${detalleItem.nombre}"? Se ocultará del inventario activo.`)) return;
    await api.del(`/inventario/${detalleItem.id}`);
    setItems(prev => prev.filter(i => i.id !== detalleItem.id));
    loadHome();
    showToast('Producto dado de baja');
    setDetalleItem(null);
    setScreen(navTab);
  };

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  // ── screens ──

  if (screen === 'form') {
    return (
      <>
        <FormScreen
          item={formItem ?? null}
          categorias={categorias}
          onBack={() => {
            if (formItem && detalleItem?.id === formItem.id) setScreen('detalle');
            else setScreen(navTab);
            setFormItem(undefined);
          }}
          onSave={submitForm}
        />
        {toast && <Toast msg={toast} />}
      </>
    );
  }

  if (screen === 'movimiento' && movItem) {
    return (
      <>
        <MovimientoScreen
          item={movItem}
          initialTipo={movTipo}
          ubicaciones={ubicaciones}
          onBack={() => {
            if (detalleItem?.id === movItem.id) setScreen('detalle');
            else setScreen(navTab);
          }}
          onSave={submitMovimiento}
        />
        {toast && <Toast msg={toast} />}
      </>
    );
  }

  if (screen === 'detalle' && detalleItem) {
    return (
      <>
        <DetalleScreen
          item={detalleItem}
          onBack={() => setScreen(navTab)}
          onMovimiento={(tipo = 'SALIDA') => {
            setMovItem(detalleItem);
            setMovTipo(tipo);
            setScreen('movimiento');
          }}
          onEditar={() => {
            setFormItem(detalleItem);
            setScreen('form');
          }}
          onBaja={darDeBaja}
        />
        {toast && <Toast msg={toast} />}
      </>
    );
  }

  // ── home / productos (with bottom nav) ──
  return (
    <>
      {navTab === 'home' ? (
        <HomeScreen
          dashboard={dashboard}
          bajoStockItems={items.filter(i => i.stockMinimo > 0 && i.stock <= i.stockMinimo)}
          loading={loadingHome}
          onRefresh={() => { loadHome(); loadProductos(); }}
          onMovimiento={(item, tipo = 'SALIDA') => {
            setMovItem(item); setMovTipo(tipo); setDetalleItem(null); setScreen('movimiento');
          }}
          onLogout={() => { clearTokens(); setAuthed(false); }}
          installPrompt={installPrompt}
          onInstall={async () => { await installPrompt!.prompt(); setInstallPrompt(null); }}
        />
      ) : (
        <ProductosScreen
          items={items}
          categorias={categorias}
          loading={loadingList}
          onDetalle={openDetalle}
          onNuevo={() => { setFormItem(null); setScreen('form'); }}
        />
      )}
      <BottomNav active={navTab} onChange={handleNavTab} />
      {toast && <Toast msg={toast} />}
    </>
  );
}
