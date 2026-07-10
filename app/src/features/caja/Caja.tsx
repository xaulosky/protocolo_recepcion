import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../store/auth-context';
import { money, fmtDateTime } from '../../lib/format';
import { Icon } from '../../lib/icons';
import type { Turno } from '../../lib/types';
import { AbrirCaja } from './AbrirCaja';
import { VenderTab } from './VenderTab';
import { HistorialTurnoTab } from './HistorialTurnoTab';
import { CerrarCaja } from './CerrarCaja';
import { ReporteVentasTab } from './ReporteVentasTab';

type Tab = 'vender' | 'historial' | 'reporte';

export function Caja() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const [turno, setTurno] = useState<Turno | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('vender');
  const [cerrando, setCerrando] = useState(false);

  const cargarTurno = useCallback(async () => {
    try {
      const d = await api.get<{ turno: Turno | null }>('/caja/turnos/actual');
      setTurno(d.turno);
    } catch {
      /* sin permiso o error de red: se muestra la pantalla de apertura */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargarTurno(); }, [cargarTurno]);

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '48px 0', fontSize: 13 }}>Cargando caja...</div>;
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'vender', label: 'Vender' },
    { id: 'historial', label: 'Ventas del turno' },
    ...(isAdmin ? [{ id: 'reporte' as Tab, label: 'Reporte mensual' }] : []),
  ];

  return (
    <div className="fade-up">
      {/* Cabecera del turno (nunca se imprime) */}
      {turno && (
        <div className="no-print card" style={{ padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: '#4A7A5A', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              Caja abierta · {turno.abiertoPor?.nombre ?? '—'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 1 }}>
              Desde {fmtDateTime(turno.abiertoAt)} · inicial {money(turno.montoInicial)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{money(turno.resumen?.total ?? 0)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>{turno.resumen?.ventas ?? 0} venta{(turno.resumen?.ventas ?? 0) === 1 ? '' : 's'} del turno</div>
          </div>
          <button
            className="btn btn-soft"
            style={{ fontSize: 12.5, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setCerrando(true)}
          >
            <Icon name="xc" size={13} /> Cerrar caja
          </button>
        </div>
      )}

      {/* Tabs (nunca se imprimen) */}
      <div className="no-print" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-soft)', marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '9px 16px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer',
              border: 'none', background: 'none',
              color: tab === t.id ? 'var(--primary)' : 'var(--muted)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'vender' && (
        turno
          ? <VenderTab onVenta={cargarTurno} />
          : <AbrirCaja onAbierto={(t) => { setTurno(t); }} />
      )}
      {tab === 'historial' && (
        turno
          ? <HistorialTurnoTab turnoId={turno.id} onChange={cargarTurno} />
          : <AbrirCaja onAbierto={(t) => { setTurno(t); setTab('vender'); }} />
      )}
      {tab === 'reporte' && isAdmin && <ReporteVentasTab />}

      {cerrando && turno && (
        <CerrarCaja
          turno={turno}
          onClose={() => setCerrando(false)}
          onCerrado={() => { setCerrando(false); setTurno(null); setTab('vender'); }}
        />
      )}
    </div>
  );
}
