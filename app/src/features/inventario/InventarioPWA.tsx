import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { api, setTokens, clearTokens, hasSession } from '../../lib/api';
import type { InventarioItem, InventarioItemDetail, InventarioDashboard, MovimientoTipo, StorageLocation } from '../../lib/types';
import type { ItemInput } from './useInventario';
import {
  stockColor, TIPO_CONFIG,
  MOTIVOS, UNIDADES, fmtCLP, calcStockDespues,
} from './inventarioShared';

// ── types ──────────────────────────────────────────────────────────────────────
type Screen   = 'home' | 'productos' | 'detalle' | 'movimiento' | 'form' | 'almacenes' | 'almacen-detalle' | 'mas';
type NavTab   = 'home' | 'productos' | 'almacenes' | 'mas';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ── brand ──────────────────────────────────────────────────────────────────────
const BR  = '#7C6247';
const BRL = '#f5f1ed';

// ── utils ──────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'ahora';
  if (d < 3600) return `hace ${Math.floor(d / 60)}m`;
  if (d < 86400) return `hace ${Math.floor(d / 3600)}h`;
  return `hace ${Math.floor(d / 86400)}d`;
}

// ── SVG icons (inline, no dependency) ─────────────────────────────────────────
const IC = {
  home:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  pkg:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  warehouse:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect x="6" y="10" width="12" height="12"/></svg>,
  more:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  back:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  plus:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  down:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
  up:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>,
  transfer:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/></svg>,
  sliders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  mapPin:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  trend:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  logout:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  filter:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  alert:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  install: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

// ── shared card style ──────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: '#fff', borderRadius: 12,
  border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
};

// ── TopBar ─────────────────────────────────────────────────────────────────────
function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px) saturate(180%)',
      borderBottom: '1px solid #e5e7eb',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, padding: '0 16px', maxWidth: 430, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '6px 8px 6px 4px', borderRadius: 8, cursor: 'pointer', color: '#374151', display: 'flex', flexShrink: 0 }}>
              {IC.back}
            </button>
          )}
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
        </div>
        {right && <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>{right}</div>}
      </div>
    </header>
  );
}

// ── BottomNav ──────────────────────────────────────────────────────────────────
function BottomNav({ active, onChange, criticalCount, lowCount }: {
  active: NavTab; onChange: (t: NavTab) => void;
  criticalCount: number; lowCount: number;
}) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home',      label: 'Inicio',    icon: IC.home },
    { id: 'productos', label: 'Insumos',   icon: IC.pkg },
    { id: 'almacenes', label: 'Almacenes', icon: IC.warehouse },
    { id: 'mas',       label: 'Más',       icon: IC.more },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, zIndex: 50,
      background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px) saturate(180%)',
      borderTop: '1px solid #e5e7eb',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    }}>
      <div style={{ display: 'flex', height: 56 }}>
        {tabs.map(t => {
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' }}>
              <div style={{ position: 'relative', color: on ? BR : '#9ca3af' }}>
                {t.icon}
                {t.id === 'home' && criticalCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 8, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {criticalCount > 9 ? '9+' : criticalCount}
                  </span>
                )}
                {t.id === 'home' && !criticalCount && lowCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: on ? 700 : 400, color: on ? BR : '#9ca3af' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#1f2937', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 14, zIndex: 200, whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.25)' }}>
      {msg}
    </div>
  );
}

// ── LoginForm ──────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [err,   setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';
      const res  = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al iniciar sesión');
      setTokens(data.accessToken, data.refreshToken);
      onLogin();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  const INP: React.CSSProperties = { padding: '13px 14px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 16, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BR, padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: BR, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {IC.warehouse}
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>Inventario Cialo</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Ingresa para continuar</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Correo electrónico" style={INP} />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="Contraseña" style={INP} />
          {err && <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>{err}</p>}
          <button type="submit" disabled={loading} style={{ padding: 14, background: BR, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────────
function HomeScreen({ dashboard, items, loading, onRefresh, onGoBajoStock, onGoAlmacenes, onGoMovimiento, installPrompt, onInstall, onLogout }: {
  dashboard: InventarioDashboard | null;
  items: InventarioItem[];
  loading: boolean;
  onRefresh: () => void;
  onGoBajoStock: () => void;
  onGoAlmacenes: () => void;
  onGoMovimiento: (tipo: MovimientoTipo) => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
  onLogout: () => void;
}) {
  const d = dashboard;
  const sinStock  = items.filter(i => i.stock === 0 && i.stockMinimo > 0).length;
  const bajoStock = items.filter(i => i.stockMinimo > 0 && i.stock > 0 && i.stock <= i.stockMinimo).length;
  const totalLow  = sinStock + bajoStock;
  const hasCrit   = sinStock > 0;

  const summaryCards = [
    { label: 'Insumos',    value: d?.totalItems ?? 0,      icon: IC.pkg,      color: BR,        bg: BRL },
    { label: 'Almacenes',  value: d?.totalUbicaciones ?? 0,icon: IC.warehouse,color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Bajo mínimo',value: d?.bajoStock ?? 0,        icon: IC.down,     color: '#d97706', bg: '#fffbeb' },
    { label: 'Sin stock',  value: d?.sinStock ?? 0,         icon: IC.trend,    color: '#dc2626', bg: '#fef2f2' },
  ];

  const quickActions = [
    { icon: IC.down,     label: 'Entrada',   color: '#16a34a', onClick: () => onGoMovimiento('ENTRADA') },
    { icon: IC.up,       label: 'Salida',    color: '#dc2626', onClick: () => onGoMovimiento('SALIDA') },
    { icon: IC.transfer, label: 'Traslado',  color: BR,        onClick: () => onGoMovimiento('TRASLADO') },
    { icon: IC.sliders,  label: 'Ajuste',    color: '#d97706', onClick: () => onGoMovimiento('AJUSTE') },
    { icon: IC.trend,    label: 'Stock bajo',color: '#7c3aed', onClick: onGoBajoStock },
    { icon: IC.warehouse,label: 'Almacenes', color: '#0891b2', onClick: onGoAlmacenes },
  ];

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Brand header */}
      <div style={{ background: BR, paddingTop: 'env(safe-area-inset-top)' }}>
        <div style={{ padding: '14px 16px 20px', maxWidth: 430, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', textTransform: 'uppercase', letterSpacing: 1 }}>Clínica Cialo</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {installPrompt && (
                <button onClick={onInstall} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                  Instalar
                </button>
              )}
              <button onClick={onRefresh} disabled={loading} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 14, cursor: 'pointer', opacity: loading ? .5 : 1 }}>
                {loading ? '…' : '↻'}
              </button>
            </div>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -.3 }}>Inventario</h1>
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Low stock alert */}
        {totalLow > 0 && (
          <button onClick={onGoBajoStock} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 12, border: `1px solid ${hasCrit ? '#fecaca' : '#fde68a'}`, background: hasCrit ? '#fef2f2' : '#fffbeb', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: hasCrit ? '#fecaca' : '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: hasCrit ? '#dc2626' : '#d97706' }}>
              {IC.alert}
            </div>
            <div style={{ flex: 1 }}>
              {hasCrit ? (
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#dc2626' }}>
                  {sinStock} agotado{sinStock !== 1 ? 's' : ''}
                  {bajoStock > 0 && <span style={{ fontWeight: 400 }}> · {bajoStock} bajo el mínimo</span>}
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#d97706' }}>
                  {totalLow} insumo{totalLow !== 1 ? 's' : ''} bajo el mínimo
                </p>
              )}
              <p style={{ margin: '2px 0 0', fontSize: 12, color: hasCrit ? '#ef4444' : '#f59e0b' }}>Toca para ver</p>
            </div>
          </button>
        )}

        {/* Summary cards 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {summaryCards.map(c => (
            <div key={c.label} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: c.color }}>
                {c.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{c.value}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b7280' }}>{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions 3-col */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>Acciones rápidas</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {quickActions.map(a => (
              <button key={a.label} onClick={a.onClick}
                style={{ ...CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 6px', cursor: 'pointer', border: '1px solid #f3f4f6' }}>
                <span style={{ color: a.color }}>{a.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent movements */}
        {d && d.ultimosMovimientos.length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>Movimientos recientes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d.ultimosMovimientos.slice(0, 8).map(m => {
                const tc = TIPO_CONFIG[m.tipo];
                return (
                  <div key={m.id} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: tc.bg, color: tc.color, flexShrink: 0, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {tc.label}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.item?.nombre ?? 'Insumo'}
                      </p>
                      {m.ubicacion && (
                        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
                          {m.ubicacion.nombre}{m.ubicacionDestino ? ` → ${m.ubicacionDestino.nombre}` : ''}
                        </p>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: tc.color }}>{tc.sign}{m.cantidad}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{timeAgo(m.fechaMovimiento)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={onLogout} style={{ padding: '13px', borderRadius: 12, border: '1px solid #f3f4f6', background: '#fff', color: '#6b7280', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {IC.logout} Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ── ProductosScreen ────────────────────────────────────────────────────────────
function ProductosScreen({ items, categorias, loading, bajoStockFilter, onDetalle, onNuevo, onClearBajoStock }: {
  items: InventarioItem[];
  categorias: string[];
  loading: boolean;
  bajoStockFilter: boolean;
  onDetalle: (item: InventarioItem) => void;
  onNuevo: () => void;
  onClearBajoStock: () => void;
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = items.filter(item => {
    if (bajoStockFilter && !(item.stockMinimo > 0 && item.stock <= item.stockMinimo)) return false;
    if (cat && item.categoria !== cat) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return item.nombre.toLowerCase().includes(lq) || (item.sku ?? '').toLowerCase().includes(lq);
    }
    return true;
  });

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title={bajoStockFilter ? 'Stock bajo' : 'Insumos'} right={
        bajoStockFilter ? (
          <button onClick={onClearBajoStock} style={{ padding: '6px 12px', background: BRL, border: 'none', borderRadius: 8, color: BR, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Todos</button>
        ) : (
          <button onClick={onNuevo} style={{ padding: 8, background: BR, color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex' }}>
            {IC.plus}
          </button>
        )
      } />

      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>{IC.search}</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o SKU…"
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 15, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
          </div>
          {!bajoStockFilter && (
            <button onClick={() => setShowFilters(f => !f)} style={{ padding: '10px 12px', border: `1px solid ${showFilters || cat ? BR : '#e5e7eb'}`, borderRadius: 12, background: showFilters || cat ? BRL : '#fff', color: showFilters || cat ? BR : '#6b7280', cursor: 'pointer', display: 'flex' }}>
              {IC.filter}
            </button>
          )}
        </div>
        {showFilters && !bajoStockFilter && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 10, paddingBottom: 2 }}>
            <button onClick={() => setCat('')} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: 'none', background: !cat ? BR : '#f3f4f6', color: !cat ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Todos</button>
            {categorias.map(c => (
              <button key={c} onClick={() => setCat(cat === c ? '' : c)} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: 'none', background: cat === c ? BR : '#f3f4f6', color: cat === c ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && [...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 68, borderRadius: 12, background: '#f3f4f6' }} />
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#d1d5db' }}>{IC.pkg}</div>
            <p style={{ margin: 0, fontSize: 14 }}>No se encontraron insumos</p>
          </div>
        )}
        {!loading && filtered.map(item => {
          const ratio = item.stockMinimo > 0 ? item.stock / item.stockMinimo : 999;
          const chipBg    = ratio <= 1 ? '#fef2f2' : ratio <= 1.5 ? '#fffbeb' : '#f0fdf4';
          const chipColor = ratio <= 1 ? '#dc2626' : ratio <= 1.5 ? '#d97706' : '#16a34a';
          return (
            <button key={item.id} onClick={() => onDetalle(item)}
              style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%', border: '1px solid #f3f4f6' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d1d5db' }}>
                {IC.pkg}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
                  {item.sku ? `SKU: ${item.sku}` : 'Sin SKU'}{item.categoria ? ` · ${item.categoria}` : ''}
                </p>
              </div>
              <span style={{ padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: chipBg, color: chipColor, flexShrink: 0 }}>
                {item.stock} {item.unidad}
              </span>
            </button>
          );
        })}
        {!loading && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', padding: '4px 0' }}>
            {filtered.length} de {items.length} insumo{items.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

// ── DetalleScreen ──────────────────────────────────────────────────────────────
function DetalleScreen({ item, onBack, onMovimiento, onEditar, onBaja }: {
  item: InventarioItemDetail;
  onBack: () => void;
  onMovimiento: (tipo?: MovimientoTipo) => void;
  onEditar: () => void;
  onBaja: () => void;
}) {
  const ratio  = item.stockMinimo > 0 ? item.stock / item.stockMinimo : 999;
  const sLabel = ratio <= 1 ? 'Bajo' : ratio <= 1.5 ? 'Alerta' : 'Normal';
  const sTxt   = ratio <= 1 ? '#dc2626' : ratio <= 1.5 ? '#d97706' : '#16a34a';

  return (
    <div style={{ paddingBottom: 24 }}>
      <TopBar title="Detalle de insumo" onBack={onBack} right={
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={onEditar} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', borderRadius: 8 }}>{IC.edit}</button>
          <button onClick={onBaja}   style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', borderRadius: 8 }}>{IC.trash}</button>
        </div>
      } />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Header */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 80, height: 80, borderRadius: 16, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d1d5db' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{item.nombre}</h2>
            <p style={{ margin: '4px 0 6px', fontSize: 13, color: '#6b7280' }}>{item.sku ?? 'Sin SKU'}{item.codigoBarras ? ` · ${item.codigoBarras}` : ''}</p>
            {item.categoria && (
              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 6, background: '#f3f4f6', fontSize: 12, color: '#6b7280' }}>{item.categoria}</span>
            )}
            {!item.activo && (
              <span style={{ display: 'inline-block', marginLeft: 6, padding: '2px 10px', borderRadius: 6, background: '#fef2f2', fontSize: 12, color: '#dc2626' }}>Inactivo</span>
            )}
          </div>
        </div>

        {/* 3-stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Stock actual', value: item.stock,         color: sTxt },
            { label: 'Mínimo',       value: item.stockMinimo,   color: '#111827' },
            { label: 'Estado',       value: sLabel,             color: sTxt, small: true },
          ].map(s => (
            <div key={s.label} style={{ ...CARD, padding: 12, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: s.small ? 15 : 24, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ margin: '3px 0 0', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: .3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons: 3 in a row + 1 full width */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <button onClick={() => onMovimiento('ENTRADA')} style={{ padding: '11px 4px', borderRadius: 12, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {IC.down}<span>Entrada</span>
          </button>
          <button onClick={() => onMovimiento('SALIDA')} style={{ padding: '11px 4px', borderRadius: 12, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {IC.up}<span>Salida</span>
          </button>
          <button onClick={() => onMovimiento('AJUSTE')} style={{ padding: '11px 4px', borderRadius: 12, border: '1.5px solid #fde68a', background: '#fffbeb', color: '#d97706', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {IC.sliders}<span>Ajuste</span>
          </button>
        </div>
        <button onClick={() => onMovimiento('TRASLADO')} style={{ padding: '12px', borderRadius: 12, border: `1.5px solid ${BR}30`, background: BRL, color: BR, fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {IC.transfer} Transferir a otro almacén
        </button>

        {/* Locations */}
        {(item.locationInventario ?? []).filter(li => li.quantity > 0).length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>Ubicaciones</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(item.locationInventario ?? []).filter(li => li.quantity > 0).map(li => (
                <div key={li.id} style={{ ...CARD, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: BR }}>{IC.mapPin}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{li.location.nombre}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{li.quantity} {item.unidad}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra info */}
        {(item.descripcion || item.notas || item.costo > 0) && (
          <div style={{ ...CARD, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.descripcion && <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>{item.descripcion}</p>}
            {item.costo > 0 && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Costo: {fmtCLP(item.costo)} · Valor en stock: {fmtCLP(item.costo * item.stock)}</p>}
            {item.notas && <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>{item.notas}</p>}
          </div>
        )}

        {/* Movement history */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>
            Historial ({item.movimientos.length})
          </p>
          {item.movimientos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 14 }}>Sin movimientos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.movimientos.map(m => {
                const tc = TIPO_CONFIG[m.tipo];
                return (
                  <div key={m.id} style={{ ...CARD, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: tc.bg, color: tc.color, flexShrink: 0, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{tc.label}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {m.codigoMotivo && <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{m.codigoMotivo}</p>}
                      {m.ubicacion && (
                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                          {m.ubicacion.nombre}{m.ubicacionDestino ? ` → ${m.ubicacionDestino.nombre}` : ''}
                        </p>
                      )}
                      {m.notas && <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notas}</p>}
                      {m.tipo !== 'TRASLADO' && (
                        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{m.stockAntes} → {m.stockDespues} {item.unidad}</p>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: tc.color }}>{tc.sign}{m.cantidad}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{timeAgo(m.fechaMovimiento)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MovimientoScreen ───────────────────────────────────────────────────────────
function MovimientoScreen({ item, initialTipo, initialUbicacionId, ubicaciones, onBack, onSave }: {
  item: InventarioItem;
  initialTipo: MovimientoTipo;
  initialUbicacionId?: string;
  ubicaciones: StorageLocation[];
  onBack: () => void;
  onSave: (tipo: MovimientoTipo, cantidad: number, codigoMotivo: string | null, notas: string | null, ubicacionId: string | null, ubicacionDestinoId: string | null) => Promise<void>;
}) {
  const [tipo,    setTipo]    = useState<MovimientoTipo>(initialTipo);
  const [cantidad, setCantidad] = useState(1);
  const [motivo,  setMotivo]  = useState('');
  const [notas,   setNotas]   = useState('');
  const [ubicId,  setUbicId]  = useState(initialUbicacionId ?? '');
  const [destId,  setDestId]  = useState('');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const preview = tipo !== 'TRASLADO' ? calcStockDespues(item, tipo, cantidad) : null;
  const tc = TIPO_CONFIG[tipo];

  const TYPE_STYLE: Record<MovimientoTipo, { border: string; bg: string; color: string }> = {
    ENTRADA:  { border: '#bbf7d0', bg: '#f0fdf4', color: '#16a34a' },
    SALIDA:   { border: '#fecaca', bg: '#fef2f2', color: '#dc2626' },
    AJUSTE:   { border: '#fde68a', bg: '#fffbeb', color: '#d97706' },
    TRASLADO: { border: `${BR}40`,  bg: BRL,      color: BR },
  };

  const handleTipo = (t: MovimientoTipo) => { setTipo(t); setMotivo(''); setDestId(''); };

  const submit = async () => {
    if (!cantidad || cantidad <= 0) { setErr('Ingresa una cantidad válida'); return; }
    if (tipo === 'TRASLADO' && (!ubicId || !destId)) { setErr('Selecciona almacén origen y destino'); return; }
    setSaving(true); setErr('');
    try {
      await onSave(tipo, cantidad, motivo || null, notas.trim() || null, ubicId || null, destId || null);
    } catch (e) { setErr((e as Error).message); setSaving(false); }
  };

  const INP: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ paddingBottom: 24 }}>
      <TopBar title="Registrar movimiento" onBack={onBack} />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Product chip */}
        <div style={{ ...CARD, padding: '12px 14px', borderLeft: `4px solid ${tc.color}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Insumo</p>
            <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#111827' }}>{item.nombre}</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>
              Stock actual: <strong style={{ color: stockColor(item).color }}>{item.stock} {item.unidad}</strong>
            </p>
          </div>
        </div>

        {/* Type selector 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(['ENTRADA', 'SALIDA', 'AJUSTE', 'TRASLADO'] as MovimientoTipo[]).map(t => {
            const ts = TYPE_STYLE[t];
            const on = tipo === t;
            return (
              <button key={t} onClick={() => handleTipo(t)} style={{ padding: '12px', borderRadius: 12, border: `2px solid ${on ? ts.color : '#e5e7eb'}`, background: on ? ts.bg : '#fff', color: on ? ts.color : '#9ca3af', fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer' }}>
                {TIPO_CONFIG[t].sign} {TIPO_CONFIG[t].label}
              </button>
            );
          })}
        </div>

        {/* Quantity with +/- */}
        <div style={{ ...CARD, padding: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>
            {tipo === 'AJUSTE' ? 'Nuevo stock (absoluto)' : `Cantidad en ${item.unidad}`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setCantidad(c => Math.max(0, c - 1))}
              style={{ width: 48, height: 48, borderRadius: 12, background: '#f3f4f6', border: 'none', fontSize: 26, fontWeight: 700, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <input type="number" min={0} inputMode="numeric" value={cantidad}
              onChange={e => setCantidad(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ flex: 1, textAlign: 'center', fontSize: 30, fontWeight: 800, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 12, color: tc.color, outline: 'none' }} />
            <button onClick={() => setCantidad(c => c + 1)}
              style={{ width: 48, height: 48, borderRadius: 12, background: '#f3f4f6', border: 'none', fontSize: 26, fontWeight: 700, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          {preview !== null && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f9fafb', borderRadius: 10, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Nuevo stock: </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: preview === 0 ? '#dc2626' : preview <= (item.stockMinimo ?? 0) ? '#d97706' : '#16a34a' }}>
                {preview} {item.unidad}
              </span>
            </div>
          )}
          {tipo === 'TRASLADO' && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: BRL, borderRadius: 10, fontSize: 13, color: BR }}>
              El stock total no cambia — solo redistribuye entre almacenes
            </div>
          )}
        </div>

        {/* Locations */}
        {ubicaciones.length > 0 && (
          <div style={{ ...CARD, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>
                {tipo === 'TRASLADO' ? 'Almacén origen *' : 'Almacén (opcional)'}
              </p>
              <select value={ubicId} onChange={e => setUbicId(e.target.value)} required={tipo === 'TRASLADO'} style={{ ...INP }}>
                <option value="">— Sin especificar —</option>
                {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.parent ? `${u.parent.nombre} › ` : ''}{u.nombre}</option>)}
              </select>
            </div>
            {tipo === 'TRASLADO' && (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>Almacén destino *</p>
                <select value={destId} onChange={e => setDestId(e.target.value)} required style={{ ...INP }}>
                  <option value="">— Seleccionar —</option>
                  {ubicaciones.filter(u => u.id !== ubicId).map(u => <option key={u.id} value={u.id}>{u.parent ? `${u.parent.nombre} › ` : ''}{u.nombre}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div style={{ ...CARD, padding: 16 }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>Motivo</p>
          <select value={motivo} onChange={e => setMotivo(e.target.value)} style={{ ...INP }}>
            <option value="">Sin especificar</option>
            {MOTIVOS[tipo].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Notes */}
        <div style={{ ...CARD, padding: 16 }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>Notas (opcional)</p>
          <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: Factura #123, consumo sala 2…" style={{ ...INP }} />
        </div>

        {err && <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>{err}</p>}

        <button onClick={submit} disabled={saving || !cantidad}
          style={{ padding: 14, borderRadius: 12, border: 'none', background: tc.color, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: (saving || !cantidad) ? .6 : 1 }}>
          {saving ? 'Registrando…' : `Registrar ${tc.label}`}
        </button>
      </div>
    </div>
  );
}

// ── AlmacenesScreen ────────────────────────────────────────────────────────────
function AlmacenesScreen({ ubicaciones, loading, onOpen }: {
  ubicaciones: StorageLocation[];
  loading: boolean;
  onOpen: (loc: StorageLocation) => void;
}) {
  const roots = ubicaciones.filter(u => !u.parentId);
  const kids  = ubicaciones.filter(u => u.parentId);

  const ROW: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Almacenes" />
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && [...Array(3)].map((_, i) => <div key={i} style={{ height: 60, borderRadius: 12, background: '#f3f4f6' }} />)}
        {!loading && roots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#d1d5db' }}>{IC.warehouse}</div>
            <p style={{ margin: 0, fontSize: 14 }}>Sin almacenes configurados</p>
          </div>
        )}
        {!loading && roots.map(root => {
          const sub = kids.filter(c => c.parentId === root.id);
          return (
            <div key={root.id} style={{ ...CARD }}>
              <button onClick={() => onOpen(root)} style={{ ...ROW, padding: '12px 14px' }}>
                <span style={{ color: BR }}>{IC.warehouse}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{root.nombre}</p>
                  {root.codigo && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Código: {root.codigo}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af' }}>
                  <span style={{ fontSize: 12 }}>{root._count?.locationInventario ?? 0} items</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
              {sub.length > 0 && (
                <div style={{ borderTop: '1px solid #f3f4f6' }}>
                  {sub.map((kid, idx) => (
                    <button key={kid.id} onClick={() => onOpen(kid)}
                      style={{ ...ROW, padding: '9px 14px 9px 44px', borderBottom: idx < sub.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <span style={{ color: '#9ca3af' }}>{IC.mapPin}</span>
                      <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{kid.nombre}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af' }}>
                        <span style={{ fontSize: 12 }}>{kid._count?.locationInventario ?? 0} items</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', padding: '4px 0' }}>
          {ubicaciones.length} almacén{ubicaciones.length !== 1 ? 'es' : ''} en total
        </p>
      </div>
    </div>
  );
}

// ── AlmacenDetalleScreen ───────────────────────────────────────────────────────
interface LocInvEntry {
  id: string;
  itemId: string;
  quantity: number;
  stockMinimo: number | null;
  item: { id: string; nombre: string; sku: string | null; unidad: string; categoria: string | null; costo: number; stockMinimo: number };
}

function AlmacenDetalleScreen({ almacen, allItems, onBack, onDetalle, onMovimiento, onAdd }: {
  almacen: StorageLocation;
  allItems: InventarioItem[];
  onBack: () => void;
  onDetalle: (item: InventarioItem) => void;
  onMovimiento: (item: InventarioItem, tipo: MovimientoTipo) => void;
  onAdd: (itemId: string, cantidad: number, ubicacionId: string) => Promise<void>;
}) {
  const [entries, setEntries] = useState<LocInvEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [picked, setPicked] = useState<InventarioItem | null>(null);
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ location: { locationInventario: LocInvEntry[] } }>(`/inventario/ubicaciones/${almacen.id}`);
      setEntries(data.location.locationInventario);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [almacen.id]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const filtered = useMemo(() => {
    if (!q.trim()) return entries;
    const lq = q.toLowerCase();
    return entries.filter(e => e.item.nombre.toLowerCase().includes(lq) || (e.item.sku ?? '').toLowerCase().includes(lq));
  }, [entries, q]);

  const bajoStock = useMemo(
    () => entries.filter(e => e.item.stockMinimo > 0 && e.quantity <= e.item.stockMinimo).length,
    [entries],
  );

  const addResults = useMemo(() => {
    if (!addSearch.trim()) return [];
    const lq = addSearch.toLowerCase();
    return allItems.filter(i => i.activo && (
      i.nombre.toLowerCase().includes(lq) || (i.sku ?? '').toLowerCase().includes(lq)
    )).slice(0, 20);
  }, [allItems, addSearch]);

  function openAdd() { setAddOpen(true); setPicked(null); setAddSearch(''); }
  function closeAdd() { setAddOpen(false); setPicked(null); setAddSearch(''); }

  async function handleAdd() {
    if (!picked) return;
    setSaving(true);
    try {
      await onAdd(picked.id, qty, almacen.id);
      setLastAdded(`+${qty} ${picked.unidad} · ${picked.nombre}`);
      setPicked(null); setAddSearch(''); setQty(1);
      loadEntries();
    } catch { /* error handled by parent */ }
    finally { setSaving(false); }
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title={almacen.nombre} onBack={onBack} right={
        almacen.codigo ? <span style={{ fontSize: 12, color: '#9ca3af', paddingRight: 4 }}>{almacen.codigo}</span> : undefined
      } />

      {/* Stats bar */}
      <div style={{ background: BRL, borderBottom: '1px solid #e5e7eb', padding: '10px 16px' }}>
        <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: BR }}>{entries.length}</p>
            <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>Insumos</p>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #e5e7eb', paddingLeft: 16 }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: bajoStock > 0 ? '#d97706' : '#16a34a' }}>{bajoStock}</p>
            <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>Stock bajo</p>
          </div>
          {almacen.descripcion && (
            <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 14, flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{almacen.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>{IC.search}</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar en este almacén…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        </div>

        {/* Items list */}
        {loading && [...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 64, borderRadius: 12, background: '#f3f4f6' }} />
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#d1d5db' }}>{IC.warehouse}</div>
            <p style={{ margin: 0, fontSize: 14 }}>Sin insumos en este almacén</p>
            <button onClick={openAdd} style={{ marginTop: 16, padding: '10px 20px', background: BR, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {IC.plus} Agregar insumo
            </button>
          </div>
        )}
        {!loading && filtered.map(entry => {
          const full = allItems.find(i => i.id === entry.itemId);
          const minStock = entry.item.stockMinimo;
          const ratio = minStock > 0 ? entry.quantity / minStock : 999;
          const chipBg    = ratio <= 1 ? '#fef2f2' : ratio <= 1.5 ? '#fffbeb' : '#f0fdf4';
          const chipColor = ratio <= 1 ? '#dc2626' : ratio <= 1.5 ? '#d97706' : '#16a34a';
          const ACT: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 };
          return (
            <div key={entry.id} style={{ ...CARD, overflow: 'hidden' }}>
              <button onClick={() => full && onDetalle(full)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: full ? 'pointer' : 'default', textAlign: 'left', width: '100%', background: 'none', border: 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d1d5db' }}>
                  {IC.pkg}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.item.nombre}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
                    {entry.item.sku ? `SKU: ${entry.item.sku}` : 'Sin SKU'}
                    {full ? ` · Total: ${full.stock} ${entry.item.unidad}` : ''}
                  </p>
                </div>
                <span style={{ padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: chipBg, color: chipColor, flexShrink: 0 }}>
                  {entry.quantity} {entry.item.unidad}
                </span>
              </button>
              {full && (
                <div style={{ display: 'flex', borderTop: '1px solid #f3f4f6' }}>
                  <button onClick={() => onMovimiento(full, 'ENTRADA')} style={{ ...ACT, color: '#16a34a', borderRight: '1px solid #f3f4f6' }}>{IC.down} Entrada</button>
                  <button onClick={() => onMovimiento(full, 'SALIDA')}  style={{ ...ACT, color: '#dc2626', borderRight: '1px solid #f3f4f6' }}>{IC.up} Salida</button>
                  <button onClick={() => onMovimiento(full, 'TRASLADO')} style={{ ...ACT, color: BR }}>{IC.transfer} Trasladar</button>
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
            {filtered.length} insumo{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* FAB */}
      {!addOpen && (
        <button onClick={openAdd} style={{ position: 'fixed', bottom: 24, right: 'max(16px, calc((100vw - 430px) / 2 + 16px))', height: 56, padding: '0 20px', borderRadius: 28, background: BR, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, boxShadow: `0 4px 20px ${BR}50`, zIndex: 30 }}>
          {IC.plus} Agregar
        </button>
      )}

      {/* Add bottom sheet */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={closeAdd} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {picked && (
                  <button onClick={() => { setPicked(null); setAddSearch(''); }}
                    style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>{IC.back}</button>
                )}
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                  {picked ? 'Cantidad a recibir' : `Agregar a ${almacen.nombre}`}
                </h3>
              </div>
              <button onClick={closeAdd} style={{ background: 'none', border: 'none', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: '1' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!picked ? (
                <>
                  {lastAdded && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13, color: '#16a34a' }}>
                      ✓ Recibido: {lastAdded}. Agrega otro o cierra.
                    </div>
                  )}
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>{IC.search}</span>
                    <input value={addSearch} onChange={e => setAddSearch(e.target.value)}
                      placeholder="Buscar insumo por nombre o SKU…" autoFocus
                      style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 12, paddingBottom: 12, border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 15, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
                  </div>
                  {addSearch ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {addResults.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: 14 }}>Sin resultados</p>
                      ) : addResults.map(item => (
                        <button key={item.id} onClick={() => { setPicked(item); setQty(1); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid #f3f4f6', background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d1d5db' }}>{IC.pkg}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{item.sku ?? 'Sin SKU'} · Stock: {item.stock} {item.unidad}</p>
                          </div>
                          <span style={{ color: BR, flexShrink: 0 }}>{IC.plus}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '16px 0' }}>
                      Escribe el nombre o SKU para buscar en el catálogo
                    </p>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ ...CARD, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d1d5db' }}>{IC.pkg}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{picked.nombre}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Stock total: {picked.stock} {picked.unidad}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', padding: '8px 0' }}>
                    <button onClick={() => setQty(prev => Math.max(1, prev - 1))}
                      style={{ width: 56, height: 56, borderRadius: 16, background: '#f3f4f6', border: 'none', fontSize: 28, fontWeight: 700, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <div style={{ textAlign: 'center' }}>
                      <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ width: 80, textAlign: 'center', fontSize: 36, fontWeight: 800, border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px', outline: 'none', color: BR, boxSizing: 'border-box' }} />
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' }}>{picked.unidad}</p>
                    </div>
                    <button onClick={() => setQty(prev => prev + 1)}
                      style={{ width: 56, height: 56, borderRadius: 16, background: '#f3f4f6', border: 'none', fontSize: 28, fontWeight: 700, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button onClick={handleAdd} disabled={saving}
                    style={{ padding: '14px', borderRadius: 12, border: 'none', background: '#16a34a', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {IC.down} {saving ? 'Registrando…' : `Recibir ${qty} ${picked.unidad} en ${almacen.nombre}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MasScreen ──────────────────────────────────────────────────────────────────
function MasScreen({ onLogout, installPrompt, onInstall }: {
  onLogout: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
}) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Más" />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {installPrompt && (
          <button onClick={onInstall} style={{ ...CARD, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%', textAlign: 'left', border: `1px solid ${BR}40`, background: BRL }}>
            <span style={{ color: BR }}>{IC.install}</span>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: BR }}>Instalar app</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Agregar al inicio como app</p>
            </div>
          </button>
        )}
        <div style={CARD}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: .5 }}>Sistema</p>
          </div>
          <button onClick={onLogout} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
            <span style={{ color: '#dc2626' }}>{IC.logout}</span>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#dc2626' }}>Cerrar sesión</p>
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#d1d5db' }}>Inventario Cialo · v2.0</p>
      </div>
    </div>
  );
}

// ── FormScreen ─────────────────────────────────────────────────────────────────
function FormScreen({ item, categorias, onBack, onSave }: {
  item?: InventarioItem | null;
  categorias: string[];
  onBack: () => void;
  onSave: (input: ItemInput) => Promise<void>;
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
    } catch (e) { setErr((e as Error).message); setSaving(false); }
  };

  const INP: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box' };

  const F = (label: string, node: React.ReactNode) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
      {node}
    </label>
  );

  return (
    <div style={{ paddingBottom: 24 }}>
      <TopBar title={item ? 'Editar insumo' : 'Nuevo insumo'} onBack={onBack} />
      <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...CARD, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {F('Nombre *', <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required style={INP} />)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {F('SKU', <input value={form.sku ?? ''} onChange={e => set('sku', e.target.value)} style={INP} />)}
            {F('Cód. barras', <input value={form.codigoBarras ?? ''} onChange={e => set('codigoBarras', e.target.value)} style={INP} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {F('Categoría',
              <><input value={form.categoria ?? ''} onChange={e => set('categoria', e.target.value)} list="pwa-cats" style={INP} />
              <datalist id="pwa-cats">{categorias.map(c => <option key={c} value={c} />)}</datalist></>
            )}
            {F('Unidad',
              <><input value={form.unidad ?? 'unidad'} onChange={e => set('unidad', e.target.value)} list="pwa-units" style={INP} />
              <datalist id="pwa-units">{UNIDADES.map(u => <option key={u} value={u} />)}</datalist></>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {F('Stock inicial', <input type="number" min={0} value={form.stock ?? 0} onChange={e => set('stock', Number(e.target.value))} style={INP} />)}
            {F('Stock mínimo', <input type="number" min={0} value={form.stockMinimo ?? 0} onChange={e => set('stockMinimo', Number(e.target.value))} style={INP} />)}
            {F('Costo ($)', <input type="number" min={0} value={form.costo ?? 0} onChange={e => set('costo', Number(e.target.value))} style={INP} />)}
          </div>
          {F('Descripción', <input value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)} style={INP} />)}
          {F('Notas internas', <textarea rows={2} value={form.notas ?? ''} onChange={e => set('notas', e.target.value)} style={{ ...INP, resize: 'vertical' }} />)}
        </div>
        {err && <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>{err}</p>}
        <button type="submit" disabled={saving} style={{ padding: 14, background: BR, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1 }}>
          {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear insumo'}
        </button>
      </form>
    </div>
  );
}

// ── Main PWA ───────────────────────────────────────────────────────────────────
export function InventarioPWA() {
  const [authed, setAuthed] = useState(hasSession());

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
  const [bajoStockFilter, setBajoStockFilter] = useState(false);

  const [detalleItem,     setDetalleItem]     = useState<InventarioItemDetail | null>(null);
  const [movItem,         setMovItem]         = useState<InventarioItem | null>(null);
  const [movTipo,         setMovTipo]         = useState<MovimientoTipo>('SALIDA');
  const [movUbic,         setMovUbic]         = useState('');
  const [movReturn,       setMovReturn]       = useState<Screen>('productos');
  const [formItem,        setFormItem]        = useState<InventarioItem | null | undefined>(undefined);
  const [selectedAlmacen, setSelectedAlmacen] = useState<StorageLocation | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const loadHome = useCallback(async () => {
    setLoadingHome(true);
    try {
      const db = await api.get<{ dashboard: InventarioDashboard }>('/inventario/dashboard');
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

  const loadUbicaciones = useCallback(async () => {
    try {
      const locs = await api.get<{ locations: StorageLocation[] }>('/inventario/ubicaciones');
      setUbicaciones(locs.locations);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { if (authed) { loadHome(); loadProductos(); } }, [authed]);

  const handleNavTab = (tab: NavTab) => {
    setNavTab(tab);
    setScreen(tab);
    setBajoStockFilter(false);
  };

  const openDetalle = async (item: InventarioItem) => {
    try {
      const data = await api.get<{ item: InventarioItemDetail }>(`/inventario/${item.id}`);
      setDetalleItem(data.item);
      setScreen('detalle');
    } catch (e) { showToast(`Error: ${(e as Error).message}`); }
  };

  const submitMovimiento = async (tipo: MovimientoTipo, cantidad: number, codigoMotivo: string | null, notas: string | null, ubicacionId: string | null, ubicacionDestinoId: string | null) => {
    if (!movItem) return;
    const data = await api.post<{ movimiento: { stockDespues: number } }>(
      `/inventario/${movItem.id}/movimiento`,
      { tipo, cantidad, codigoMotivo, notas, ubicacionId, ubicacionDestinoId },
    );
    const nuevoStock = data.movimiento.stockDespues;
    if (tipo !== 'TRASLADO') {
      setItems(prev => prev.map(i => i.id === movItem.id ? { ...i, stock: nuevoStock } : i));
    }
    if (detalleItem?.id === movItem.id) {
      setDetalleItem(prev => prev ? { ...prev, stock: nuevoStock } : prev);
    }
    loadHome();
    loadUbicaciones();
    showToast('Movimiento registrado ✓');
    if (movReturn === 'detalle' && detalleItem?.id === movItem.id) {
      const updated = await api.get<{ item: InventarioItemDetail }>(`/inventario/${movItem.id}`);
      setDetalleItem(updated.item);
      setScreen('detalle');
    } else {
      setScreen(movReturn);
    }
  };

  const submitForm = async (input: ItemInput) => {
    if (formItem) {
      const data = await api.patch<{ item: InventarioItem }>(`/inventario/${formItem.id}`, input);
      setItems(prev => prev.map(i => i.id === formItem.id ? data.item : i));
      if (detalleItem?.id === formItem.id) setDetalleItem(prev => prev ? { ...prev, ...data.item } : prev);
      showToast('Insumo actualizado ✓');
      setScreen('detalle');
    } else {
      const data = await api.post<{ item: InventarioItem }>('/inventario', input);
      setItems(prev => [...prev, data.item].sort((a, b) => (a.categoria ?? '').localeCompare(b.categoria ?? '') || a.nombre.localeCompare(b.nombre)));
      loadHome();
      showToast('Insumo creado ✓');
      const detail = await api.get<{ item: InventarioItemDetail }>(`/inventario/${data.item.id}`);
      setDetalleItem(detail.item);
      setScreen('detalle');
    }
    setFormItem(undefined);
  };

  const submitEntradaAlmacen = async (itemId: string, cantidad: number, ubicacionId: string) => {
    const data = await api.post<{ movimiento: { stockDespues: number } }>(
      `/inventario/${itemId}/movimiento`,
      { tipo: 'ENTRADA', cantidad, codigoMotivo: null, notas: null, ubicacionId, ubicacionDestinoId: null },
    );
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, stock: data.movimiento.stockDespues } : i));
    loadHome();
    loadUbicaciones();
    showToast('Entrada registrada ✓');
  };

  const darDeBaja = async () => {
    if (!detalleItem) return;
    if (!window.confirm(`¿Dar de baja "${detalleItem.nombre}"? Se ocultará del inventario activo.`)) return;
    await api.del(`/inventario/${detalleItem.id}`);
    setItems(prev => prev.filter(i => i.id !== detalleItem.id));
    loadHome();
    showToast('Insumo dado de baja');
    setDetalleItem(null);
    setScreen(navTab);
  };

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  const criticalCount = items.filter(i => i.stock === 0 && i.stockMinimo > 0).length;
  const lowCount      = items.filter(i => i.stockMinimo > 0 && i.stock > 0 && i.stock <= i.stockMinimo).length;

  // ── sub-screens (no bottom nav) ──
  if (screen === 'form') return (
    <>
      <FormScreen item={formItem ?? null} categorias={categorias} onBack={() => { if (formItem && detalleItem?.id === formItem.id) setScreen('detalle'); else setScreen(navTab); setFormItem(undefined); }} onSave={submitForm} />
      {toast && <Toast msg={toast} />}
    </>
  );

  if (screen === 'movimiento' && movItem) return (
    <>
      <MovimientoScreen item={movItem} initialTipo={movTipo} initialUbicacionId={movUbic} ubicaciones={ubicaciones}
        onBack={() => { if (movReturn === 'detalle' && detalleItem?.id === movItem.id) setScreen('detalle'); else setScreen(movReturn); }}
        onSave={submitMovimiento} />
      {toast && <Toast msg={toast} />}
    </>
  );

  if (screen === 'almacen-detalle' && selectedAlmacen) return (
    <>
      <AlmacenDetalleScreen
        almacen={selectedAlmacen}
        allItems={items}
        onBack={() => { setScreen('almacenes'); setNavTab('almacenes'); }}
        onDetalle={async (item) => { await openDetalle(item); }}
        onMovimiento={(item, tipo) => { setMovItem(item); setMovTipo(tipo); setMovUbic(selectedAlmacen?.id ?? ''); setMovReturn('almacen-detalle'); setScreen('movimiento'); }}
        onAdd={submitEntradaAlmacen}
      />
      {toast && <Toast msg={toast} />}
    </>
  );

  if (screen === 'detalle' && detalleItem) return (
    <>
      <DetalleScreen item={detalleItem} onBack={() => setScreen(navTab)}
        onMovimiento={(tipo = 'SALIDA') => { setMovItem(detalleItem); setMovTipo(tipo); setMovUbic(''); setMovReturn('detalle'); setScreen('movimiento'); }}
        onEditar={() => { setFormItem(detalleItem); setScreen('form'); }}
        onBaja={darDeBaja} />
      {toast && <Toast msg={toast} />}
    </>
  );

  // ── main screens (with bottom nav) ──
  const onGoMovimiento = (tipo: MovimientoTipo) => {
    setNavTab('productos'); setScreen('productos');
    setBajoStockFilter(false);
    showToast(`Selecciona el insumo para ${TIPO_CONFIG[tipo].label.toLowerCase()}`);
    setMovTipo(tipo);
  };

  return (
    <>
      <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100svh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {navTab === 'home' && (
          <HomeScreen dashboard={dashboard} items={items} loading={loadingHome}
            onRefresh={() => { loadHome(); loadProductos(); }}
            onGoBajoStock={() => { setNavTab('productos'); setScreen('productos'); setBajoStockFilter(true); }}
            onGoAlmacenes={() => handleNavTab('almacenes')}
            onGoMovimiento={onGoMovimiento}
            installPrompt={installPrompt}
            onInstall={async () => { await installPrompt!.prompt(); setInstallPrompt(null); }}
            onLogout={() => { clearTokens(); setAuthed(false); }}
          />
        )}
        {navTab === 'productos' && (
          <ProductosScreen items={items} categorias={categorias} loading={loadingList}
            bajoStockFilter={bajoStockFilter}
            onDetalle={openDetalle}
            onNuevo={() => { setFormItem(null); setScreen('form'); }}
            onClearBajoStock={() => setBajoStockFilter(false)}
          />
        )}
        {navTab === 'almacenes' && (
          <AlmacenesScreen ubicaciones={ubicaciones} loading={loadingList}
            onOpen={(loc) => { setSelectedAlmacen(loc); setScreen('almacen-detalle'); }} />
        )}
        {navTab === 'mas' && (
          <MasScreen
            onLogout={() => { clearTokens(); setAuthed(false); }}
            installPrompt={installPrompt}
            onInstall={async () => { await installPrompt!.prompt(); setInstallPrompt(null); }}
          />
        )}
      </div>
      <BottomNav active={navTab} onChange={handleNavTab} criticalCount={criticalCount} lowCount={lowCount} />
      {toast && <Toast msg={toast} />}
    </>
  );
}
