import { useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { Icon } from '../../lib/icons';
import type { Turno } from '../../lib/types';

/** Pantalla inicial cuando no hay caja abierta: registrar el efectivo inicial y abrir. */
export function AbrirCaja({ onAbierto }: { onAbierto: (turno: Turno) => void }) {
  const { toast } = useApp();
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [busy, setBusy] = useState(false);

  const abrir = async () => {
    const montoInicial = parseInt(monto.replace(/\D/g, ''), 10) || 0;
    setBusy(true);
    try {
      const d = await api.post<{ turno: Turno }>('/caja/turnos/abrir', {
        montoInicial,
        notas: notas.trim() || null,
      });
      toast('Caja abierta');
      onAbierto(d.turno);
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'Error al abrir la caja');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto', padding: 28, textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--cream)', border: '1px solid var(--cream-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 14px' }}>
        <Icon name="credit" size={22} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Abrir caja</div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>
        No hay una caja abierta. Ingresa el efectivo inicial del cajón para comenzar a vender.
      </p>
      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="label">Efectivo inicial (CLP)</label>
          <input className="input" inputMode="numeric" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="$ 0" />
        </div>
        <div>
          <label className="label">Notas (opcional)</label>
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: turno mañana" />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 18, width: '100%', padding: 11, fontSize: 13.5 }} onClick={abrir} disabled={busy}>
        {busy ? 'Abriendo...' : 'Abrir caja'}
      </button>
    </div>
  );
}
