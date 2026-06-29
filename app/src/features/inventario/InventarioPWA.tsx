import { useEffect, useState, useCallback } from 'react';
import type { InventarioItem, InventarioDashboard, MovimientoTipo } from '../../lib/types';

import { api, setTokens, clearTokens, hasSession } from '../../lib/api';

// ── helpers wrapper ──────────────────────────────────────────────────────────
// La PWA reutiliza el cliente api.ts (cialo_access/cialo_refresh) para ser
// consistente con el resto de la app y beneficiarse del refresh automático.
async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  if (opts?.method && opts.method !== 'GET') {
    const body = opts.body ? JSON.parse(opts.body as string) : undefined;
    const m = opts.method.toUpperCase();
    if (m === 'POST') return api.post<T>(path, body);
    if (m === 'PATCH') return api.patch<T>(path, body);
    if (m === 'DELETE') return api.del<T>(path);
  }
  return api.get<T>(path);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function stockColor(item: InventarioItem) {
  if (item.stock === 0) return '#c0392b';
  if (item.stockMinimo > 0 && item.stock <= item.stockMinimo) return '#e67e22';
  return '#2e7d32';
}

const TIPO_CONFIG = {
  ENTRADA: { label: 'Entrada', color: '#2e7d32', bg: '#e8f5e9', sign: '+' },
  SALIDA:  { label: 'Salida',  color: '#c0392b', bg: '#fce8e8', sign: '−' },
  AJUSTE:  { label: 'Ajuste',  color: '#1565c0', bg: '#e3f2fd', sign: '=' },
} as const;

// ── login screen ─────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al iniciar sesión');
      setTokens(data.accessToken, data.refreshToken);
      onLogin(data.accessToken);
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

// ── movimiento form ──────────────────────────────────────────────────────────

interface MovForm {
  item: InventarioItem | null;
  tipo: MovimientoTipo;
  cantidad: string;
  notas: string;
}

// ── main PWA app ─────────────────────────────────────────────────────────────

type Screen = 'home' | 'search' | 'movimiento';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InventarioPWA() {
  const [authed, setAuthed] = useState(hasSession());
  const [screen, setScreen] = useState<Screen>('home');
  const [dashboard, setDashboard] = useState<InventarioDashboard | null>(null);
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [movForm, setMovForm] = useState<MovForm>({ item: null, tipo: 'ENTRADA', cantidad: '', notas: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Capturar el evento beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const loadData = useCallback(async () => {
    try {
      const [db, it] = await Promise.all([
        apiFetch<{ dashboard: InventarioDashboard }>('/inventario/dashboard'),
        apiFetch<{ items: InventarioItem[] }>('/inventario'),
      ]);
      setDashboard(db.dashboard);
      setItems(it.items);
    } catch { /* silent on background refresh */ }
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  const bajoStockItems = items.filter(i => i.stockMinimo > 0 && i.stock <= i.stockMinimo);

  const searchResults = busqueda.trim()
    ? items.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (i.sku ?? '').toLowerCase().includes(busqueda.toLowerCase()))
    : [];

  const openMovimiento = (item: InventarioItem, tipo: MovimientoTipo = 'SALIDA') => {
    setMovForm({ item, tipo, cantidad: '', notas: '' });
    setScreen('movimiento');
  };

  const submitMovimiento = async () => {
    if (!movForm.item || !movForm.cantidad) return;
    setSaving(true);
    try {
      await apiFetch(`/inventario/${movForm.item.id}/movimiento`, {
        method: 'POST',
        body: JSON.stringify({ tipo: movForm.tipo, cantidad: Number(movForm.cantidad), notas: movForm.notas || null }),
      });
      showToast('Movimiento registrado ✓');
      setScreen('home');
      loadData();
    } catch (e) { showToast(`Error: ${(e as Error).message}`); }
    finally { setSaving(false); }
  };

  const stockPreview = movForm.item && movForm.cantidad
    ? movForm.tipo === 'AJUSTE' ? Number(movForm.cantidad)
    : movForm.tipo === 'ENTRADA' ? movForm.item.stock + Number(movForm.cantidad)
    : Math.max(0, movForm.item.stock - Number(movForm.cantidad))
    : null;

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  const S: React.CSSProperties = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#F8F7F5', minHeight: '100svh', maxWidth: 430, margin: '0 auto', position: 'relative', paddingBottom: 72 };
  const HEADER: React.CSSProperties = { background: '#7C6247', color: '#fff', padding: '14px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const CARD: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,.08)' };
  const BTN_PRIMARY: React.CSSProperties = { background: '#7C6247', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' };
  const INPUT: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 16, background: '#fff', boxSizing: 'border-box' };

  // ── movimiento screen ────────────────────────────────────────────────────
  if (screen === 'movimiento' && movForm.item) {
    const tc = TIPO_CONFIG[movForm.tipo];
    return (
      <div style={S}>
        <div style={HEADER}>
          <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Volver
          </button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Registrar movimiento</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...CARD, borderLeft: `4px solid ${tc.color}` }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Producto</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1918' }}>{movForm.item.nombre}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>Stock actual: <strong style={{ color: stockColor(movForm.item) }}>{movForm.item.stock} {movForm.item.unidad}</strong></div>
          </div>

          {/* Tipo selector */}
          <div style={{ ...CARD }}>
            <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>Tipo de movimiento</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['ENTRADA', 'SALIDA', 'AJUSTE'] as MovimientoTipo[]).map(t => {
                const c = TIPO_CONFIG[t];
                const active = movForm.tipo === t;
                return (
                  <button key={t} onClick={() => setMovForm(p => ({ ...p, tipo: t }))}
                    style={{ flex: 1, padding: '10px 4px', borderRadius: 8, border: `2px solid ${active ? c.color : '#e0e0e0'}`, background: active ? c.bg : '#fff', color: active ? c.color : '#888', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                    {c.sign} {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={CARD}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>
                {movForm.tipo === 'AJUSTE' ? 'Nuevo stock (absoluto)' : `Cantidad en ${movForm.item.unidad}`}
              </span>
              <input type="number" min={0} inputMode="numeric" value={movForm.cantidad}
                onChange={e => setMovForm(p => ({ ...p, cantidad: e.target.value }))}
                style={{ ...INPUT, fontSize: 28, fontWeight: 700, textAlign: 'center', color: tc.color }}
                autoFocus />
            </label>

            {stockPreview !== null && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8f7f5', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: '#888' }}>Nuevo stock: </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: stockPreview === 0 ? '#c0392b' : stockPreview < (movForm.item.stockMinimo ?? 0) ? '#e67e22' : '#2e7d32' }}>
                  {stockPreview} {movForm.item.unidad}
                </span>
              </div>
            )}
          </div>

          <div style={CARD}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Notas (opcional)</span>
              <input value={movForm.notas} onChange={e => setMovForm(p => ({ ...p, notas: e.target.value }))}
                placeholder="Ej: Compra factura #123, consumo sala 2…"
                style={{ ...INPUT }} />
            </label>
          </div>

          <button onClick={submitMovimiento} disabled={saving || !movForm.cantidad}
            style={{ ...BTN_PRIMARY, background: tc.color, opacity: (saving || !movForm.cantidad) ? .6 : 1 }}>
            {saving ? 'Registrando…' : `Registrar ${tc.label}`}
          </button>
        </div>

        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, zIndex: 100 }}>{toast}</div>
        )}
      </div>
    );
  }

  // ── search screen ────────────────────────────────────────────────────────
  if (screen === 'search') {
    return (
      <div style={S}>
        <div style={HEADER}>
          <button onClick={() => { setScreen('home'); setBusqueda(''); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0 }}>
            ← Volver
          </button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Buscar producto</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: 16 }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o SKU…" autoFocus
            style={{ ...INPUT, marginBottom: 14 }} />

          {searchResults.length === 0 && busqueda.trim() && (
            <p style={{ textAlign: 'center', color: '#888', fontSize: 14 }}>Sin resultados</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {searchResults.map(item => (
              <div key={item.id} style={{ ...CARD }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1918' }}>{item.nombre}</div>
                    {item.sku && <div style={{ fontSize: 12, color: '#aaa' }}>SKU: {item.sku}</div>}
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: stockColor(item) }}>{item.stock} <span style={{ fontSize: 12, fontWeight: 400 }}>{item.unidad}</span></span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openMovimiento(item, 'ENTRADA')} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid #2e7d32', background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ Entrada</button>
                  <button onClick={() => openMovimiento(item, 'SALIDA')} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid #c0392b', background: '#fce8e8', color: '#c0392b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>− Salida</button>
                  <button onClick={() => openMovimiento(item, 'AJUSTE')} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid #1565c0', background: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>=  Ajuste</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── home screen ──────────────────────────────────────────────────────────
  const d = dashboard;
  return (
    <div style={S}>
      <div style={{ ...HEADER, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: 1 }}>Clínica Cialo</span>
          {installPrompt && (
            <button onClick={async () => { await installPrompt.prompt(); setInstallPrompt(null); }}
              style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              Instalar app
            </button>
          )}
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3 }}>Inventario</span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Stats */}
        {d && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Productos', value: d.totalItems, color: '#7C6247' },
              { label: 'Bajo mín.', value: d.bajoStock, color: d.bajoStock > 0 ? '#e67e22' : '#2e7d32' },
              { label: 'Sin stock', value: d.sinStock, color: d.sinStock > 0 ? '#c0392b' : '#2e7d32' },
            ].map(s => (
              <div key={s.label} style={{ ...CARD, textAlign: 'center', padding: '12px 8px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Buscar */}
        <button onClick={() => setScreen('search')}
          style={{ ...CARD, border: '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: 'pointer', background: '#fff', padding: '13px 16px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ fontSize: 15, color: '#999' }}>Buscar producto…</span>
        </button>

        {/* Alertas bajo stock */}
        {bajoStockItems.length > 0 && (
          <div style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e67e22' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e67e22' }}>Bajo stock ({bajoStockItems.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bajoStockItems.slice(0, 6).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1918', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>Mín: {item.stockMinimo} {item.unidad}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: stockColor(item) }}>{item.stock}</span>
                    <button onClick={() => openMovimiento(item, 'ENTRADA')}
                      style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid #2e7d32', background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              ))}
              {bajoStockItems.length > 6 && (
                <div style={{ textAlign: 'center', fontSize: 12, color: '#aaa', paddingTop: 4 }}>y {bajoStockItems.length - 6} más…</div>
              )}
            </div>
          </div>
        )}

        {/* Últimos movimientos */}
        {d && d.ultimosMovimientos.length > 0 && (
          <div style={CARD}>
            <div style={{ fontSize: 12, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Últimos movimientos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {d.ultimosMovimientos.slice(0, 8).map((m) => {
                const tc = TIPO_CONFIG[m.tipo];
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: tc.color }}>{tc.sign}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1918', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(m as { item?: { nombre: string } }).item?.nombre ?? 'Producto'}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>
                        {tc.label} · {m.cantidad} {(m as { item?: { unidad: string } }).item?.unidad}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>
                      {new Date(m.fechaMovimiento).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={() => { clearTokens(); setAuthed(false); }}
          style={{ ...CARD, border: '1px solid #e0e0e0', textAlign: 'center', color: '#888', fontSize: 13, cursor: 'pointer', padding: '12px', background: '#fff' }}>
          Cerrar sesión
        </button>
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: '1px solid #e0e0e0', display: 'flex', padding: '8px 0 max(8px, env(safe-area-inset-bottom))' }}>
        <button onClick={() => setScreen('home')} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: '#7C6247' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700 }}>Inicio</span>
        </button>
        <button onClick={() => setScreen('search')} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: '#aaa' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 400 }}>Buscar</span>
        </button>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, zIndex: 100, whiteSpace: 'nowrap' }}>{toast}</div>
      )}
    </div>
  );
}
