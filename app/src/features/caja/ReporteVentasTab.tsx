import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { money } from '../../lib/format';
import { exportCsv } from '../../lib/exportCsv';
import { Icon } from '../../lib/icons';
import type { VentasResumenMes } from '../../lib/types';

function currentPeriodo(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtPeriodo(p: string): string {
  const [y, m] = p.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
}

/** Reporte mensual de ventas por vendedor (solo admin). */
export function ReporteVentasTab() {
  const { toast } = useApp();
  const [periodo, setPeriodo] = useState(currentPeriodo());
  const [data, setData] = useState<VentasResumenMes | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let activo = true;
    setLoading(true);
    api.get<VentasResumenMes>(`/caja/ventas/resumen?periodo=${periodo}`)
      .then((d) => { if (activo) setData(d); })
      .catch(() => { if (activo) toast('Error al cargar el reporte'); })
      .finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, [periodo, toast]);

  const exportar = () => {
    if (!data) return;
    exportCsv(`ventas-${periodo}.csv`, [
      ['Reporte de ventas de productos', fmtPeriodo(periodo)],
      [],
      ['Vendedor', 'N° ventas', 'Total'],
      ...data.resumen.porVendedor.map((v) => [v.nombre, v.cantidad, v.total]),
      [],
      ['TOTAL MES', data.resumen.cantidad, data.resumen.total],
      [],
      ['Método de pago', 'Total'],
      ['Efectivo', data.resumen.porMetodoPago.EFECTIVO],
      ['Tarjeta', data.resumen.porMetodoPago.TARJETA],
      ['Transferencia', data.resumen.porMetodoPago.TRANSFERENCIA],
    ]);
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input" type="month" style={{ width: 'auto' }} value={periodo} onChange={(e) => e.target.value && setPeriodo(e.target.value)} />
        {data && data.meses.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {data.meses.slice(0, 6).map((m) => (
              <button
                key={m}
                onClick={() => setPeriodo(m)}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11.5, cursor: 'pointer',
                  border: periodo === m ? '1.5px solid var(--primary)' : '1px solid var(--border-soft)',
                  background: periodo === m ? 'var(--primary-soft)' : 'transparent',
                  color: periodo === m ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: periodo === m ? 600 : 400,
                }}
              >
                {fmtPeriodo(m)}
              </button>
            ))}
          </div>
        )}
        <button
          className="btn btn-soft"
          style={{ marginLeft: 'auto', fontSize: 12.5, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={exportar}
          disabled={!data || data.resumen.cantidad === 0}
        >
          <Icon name="download" size={13} /> Exportar CSV
        </button>
      </div>

      {loading || !data ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 13 }}>Cargando...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
            <Card label={`Total ${fmtPeriodo(periodo)}`} value={money(data.resumen.total)} accent />
            <Card label="N° de ventas" value={String(data.resumen.cantidad)} />
            <Card label="Efectivo" value={money(data.resumen.porMetodoPago.EFECTIVO)} />
            <Card label="Tarjeta" value={money(data.resumen.porMetodoPago.TARJETA)} />
            <Card label="Transferencia" value={money(data.resumen.porMetodoPago.TRANSFERENCIA)} />
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Ventas por persona</div>
          {data.resumen.porVendedor.length === 0 ? (
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Sin ventas registradas en {fmtPeriodo(periodo)}.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.resumen.porVendedor.map((v, i) => (
                <div key={v.vendedorId} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 13, background: i === 0 ? 'var(--primary)' : 'var(--primary-soft)', color: i === 0 ? '#fff' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.nombre}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>{v.cantidad} venta{v.cantidad === 1 ? '' : 's'}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{money(v.total)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: accent ? 'var(--primary)' : 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 5 }}>{label}</div>
    </div>
  );
}
