import { useState } from 'react';
import { useApp } from '../store/app-context';
import { Icon } from '../lib/icons';

export function Reembolso() {
  const { toast } = useApp();
  const [form, setForm] = useState({
    paciente: '', rut: '', tel: '', fecha: '', monto: '', motivo: '', banco: '', cuenta: '', urgente: false,
  });
  const set = (k: keyof typeof form) => (v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const enviar = () => {
    const sub = encodeURIComponent('Solicitud de Reembolso – Clínica Cialo');
    const body = encodeURIComponent(
      `Estimado equipo,\n\nAdjunto los datos de la solicitud de reembolso.\n\n` +
      `Paciente: ${form.paciente}\nRUT: ${form.rut}\nTeléfono: ${form.tel}\n` +
      `Fecha del pago: ${form.fecha}\nMonto: ${form.monto}\nMotivo: ${form.motivo}\n` +
      `Banco: ${form.banco}\nCuenta: ${form.cuenta}\n` +
      `${form.urgente ? '\n** URGENTE **' : ''}`,
    );
    window.open(`mailto:contacto@cialo.cl?subject=${sub}&body=${body}`, '_blank');
    toast('Abriendo cliente de correo...');
  };

  return (
    <div className="fade-up" style={{ maxWidth: 680 }}>
      <div className="card" style={{ padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ width: 40, height: 40, background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
            <Icon name="ref" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>Solicitud de Reembolso</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Envío a contacto@cialo.cl</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nombre del paciente" value={form.paciente} onChange={set('paciente')} placeholder="Nombre completo" />
          <Field label="RUT" value={form.rut} onChange={set('rut')} placeholder="12.345.678-9" />
          <Field label="Teléfono" value={form.tel} onChange={set('tel')} placeholder="+56 9 XXXX XXXX" />
          <Field label="Fecha del pago original" type="date" value={form.fecha} onChange={set('fecha')} />
          <Field span label="Monto a reembolsar" value={form.monto} onChange={set('monto')} placeholder="$ 0" />
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Motivo</label>
            <textarea className="textarea" rows={3} value={form.motivo} onChange={(e) => set('motivo')(e.target.value)} placeholder="Describe el motivo del reembolso..." />
          </div>
          <Field label="Banco" value={form.banco} onChange={set('banco')} placeholder="Banco" />
          <Field label="Número de cuenta" value={form.cuenta} onChange={set('cuenta')} placeholder="Número de cuenta" />
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.urgente} onChange={(e) => set('urgente')(e.target.checked)} style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
              <span style={{ fontSize: 13, color: 'var(--text)' }}>Marcar como urgente</span>
            </label>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 20, width: '100%', padding: 11, fontSize: 13.5 }} onClick={enviar}>
          Enviar por correo
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', span }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; span?: boolean;
}) {
  return (
    <div style={span ? { gridColumn: '1/-1' } : undefined}>
      <label className="label">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
