import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { useAuth } from '../../store/auth-context';
import { money, fmtDateTime } from '../../lib/format';
import { Icon } from '../../lib/icons';
import type { Venta } from '../../lib/types';

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transf.',
};

/** Ventas del turno actual. El admin puede anular (repone stock). */
export function HistorialTurnoTab({ turnoId, onChange }: { turnoId: string; onChange: () => void }) {
  const { toast } = useApp();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const [ventas, setVentas] = useState<Venta[] | null>(null);

  const cargar = useCallback(async () => {
    try {
      const d = await api.get<{ ventas: Venta[] }>(`/caja/ventas?turnoId=${encodeURIComponent(turnoId)}`);
      setVentas(d.ventas);
    } catch {
      toast('Error al cargar las ventas');
      setVentas([]);
    }
  }, [turnoId, toast]);

  useEffect(() => { void cargar(); }, [cargar]);

  const anular = async (v: Venta) => {
    const motivo = window.prompt(`¿Anular la venta N° ${v.numero} por ${money(v.total)}? El stock se repone.\n\nMotivo (opcional):`);
    if (motivo === null) return; // canceló
    try {
      await api.patch(`/caja/ventas/${v.id}/anular`, { motivo: motivo.trim() || null });
      toast('Venta anulada — stock repuesto');
      void cargar();
      onChange();
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'Error al anular');
    }
  };

  if (ventas === null) {
    return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 13 }}>Cargando...</div>;
  }
  if (ventas.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 13 }}>Aún no hay ventas en este turno.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 760 }}>
      {ventas.map((v) => (
        <div key={v.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: v.anuladaAt ? 0.6 : 1 }}>
          <div style={{ textAlign: 'center', minWidth: 44 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>#{v.numero}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {v.items.map((it) => `${it.cantidad}× ${it.nombre}`).join(' · ')}
              {v.anuladaAt && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#FBF0EB', color: '#C04040', padding: '1px 8px', borderRadius: 20 }}>ANULADA</span>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 3 }}>
              {fmtDateTime(v.createdAt)} · {v.vendedor?.nombre ?? '—'} · {METODO_LABEL[v.metodoPago]}
              {v.cliente ? ` · Cliente: ${v.cliente}` : ''}
              {v.anuladaAt && v.motivoAnulacion ? ` · Motivo anulación: ${v.motivoAnulacion}` : ''}
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>{money(v.total)}</div>
          {isAdmin && !v.anuladaAt && (
            <button
              onClick={() => anular(v)}
              title="Anular venta (repone stock)"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, display: 'flex', flexShrink: 0 }}
            >
              <Icon name="xc" size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
