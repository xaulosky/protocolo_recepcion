import { useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { money } from '../../lib/format';
import { Modal } from '../../components/Modal';
import type { Turno } from '../../lib/types';

/** Modal de cierre: conteo de efectivo vs esperado. Tarjeta/transferencia son informativos. */
export function CerrarCaja({ turno, onClose, onCerrado }: { turno: Turno; onClose: () => void; onCerrado: () => void }) {
  const { toast } = useApp();
  const [contado, setContado] = useState('');
  const [notas, setNotas] = useState('');
  const [busy, setBusy] = useState(false);

  const efectivoVentas = turno.resumen?.EFECTIVO ?? 0;
  const esperado = turno.montoInicial + efectivoVentas;
  const contadoNum = parseInt(contado.replace(/\D/g, ''), 10) || 0;
  const diferencia = contadoNum - esperado;

  const cerrar = async () => {
    if (!contado.trim()) { toast('Ingresa el efectivo contado'); return; }
    if (!window.confirm(`¿Cerrar la caja con ${money(contadoNum)} contados?`)) return;
    setBusy(true);
    try {
      const d = await api.patch<{ turno: Turno }>(`/caja/turnos/${turno.id}/cerrar`, {
        montoContado: contadoNum,
        notas: notas.trim() || null,
      });
      const dif = d.turno.diferencia ?? 0;
      toast(dif === 0
        ? 'Caja cerrada — cuadró exacto ✓'
        : `Caja cerrada — diferencia de ${dif > 0 ? '+' : ''}${money(dif)}`);
      onCerrado();
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'Error al cerrar la caja');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} eyebrow="Cierre de caja" title="Conteo de efectivo" maxWidth={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
        <Row label="Efectivo inicial" value={money(turno.montoInicial)} />
        <Row label="Ventas en efectivo" value={money(efectivoVentas)} />
        <Row label="Efectivo esperado en caja" value={money(esperado)} bold />
        <div style={{ borderTop: '1px solid var(--border-soft)', margin: '4px 0' }} />
        <Row label="Ventas con tarjeta (informativo)" value={money(turno.resumen?.TARJETA ?? 0)} muted />
        <Row label="Ventas por transferencia (informativo)" value={money(turno.resumen?.TRANSFERENCIA ?? 0)} muted />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="label">Efectivo contado (CLP)</label>
          <input className="input" inputMode="numeric" value={contado} onChange={(e) => setContado(e.target.value)} placeholder="$ 0" autoFocus />
        </div>
        {contado.trim() && (
          <div style={{
            fontSize: 13, fontWeight: 600, padding: '8px 12px', borderRadius: 8,
            background: diferencia === 0 ? '#EDF5EF' : '#FFF8E8',
            color: diferencia === 0 ? '#3A6A4A' : '#B08030',
          }}>
            {diferencia === 0 ? 'Cuadra exacto ✓' : `Diferencia: ${diferencia > 0 ? '+' : ''}${money(diferencia)}`}
          </div>
        )}
        <div>
          <label className="label">Notas de cierre (opcional)</label>
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: faltó sencillo para vuelto" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" style={{ fontSize: 13, padding: '8px 16px' }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={cerrar} disabled={busy}>
          {busy ? 'Cerrando...' : 'Cerrar caja'}
        </button>
      </div>
    </Modal>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: muted ? 'var(--muted-2)' : 'var(--muted)' }}>{label}</span>
      <span style={{ color: muted ? 'var(--muted-2)' : 'var(--text)', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}
