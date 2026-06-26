import { useState } from 'react';
import { useApp } from '../store/app-context';
import { clp } from '../lib/format';

export function GiftCards() {
  const { toast } = useApp();
  const [para, setPara] = useState('');
  const [de, setDe] = useState('');
  const [monto, setMonto] = useState('');
  const [msg, setMsg] = useState('');
  const [codigo, setCodigo] = useState('GC-' + (10000 + Math.floor(Math.random() * 90000)));

  const rawMonto = parseFloat((monto || '').replace(/\./g, '')) || 50000;

  return (
    <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
      <div className="card" style={{ flex: 1, minWidth: 260, padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Datos de la Gift Card</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Para (destinatario)" value={para} onChange={setPara} placeholder="Nombre del destinatario" />
          <Field label="De (remitente)" value={de} onChange={setDe} placeholder="Con cariño de..." />
          <Field label="Monto (CLP)" value={monto} onChange={setMonto} placeholder="50000" />
          <div>
            <label className="label">Mensaje</label>
            <textarea className="textarea" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Mensaje personalizado..." />
          </div>
          <button className="btn btn-primary" style={{ padding: 10 }} onClick={() => { setCodigo('GC-' + (10000 + Math.floor(Math.random() * 90000))); toast('Gift Card generada'); }}>
            Generar Gift Card
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'linear-gradient(135deg,#7C6247 0%,#A88560 55%,#7C6247 100%)', borderRadius: 14, padding: 30, color: '#fff', minHeight: 190, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 130, height: 130, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 110, height: 110, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', opacity: 0.65, marginBottom: 18 }}>Clínica Cialo · Gift Card</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Para</div>
          <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 12 }}>{para || 'Destinatario'}</div>
          <div style={{ fontSize: 25, fontWeight: 700 }}>${clp(rawMonto)}</div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>{msg || 'Disfruta este regalo especial'}</div>
          <div style={{ position: 'absolute', bottom: 18, right: 20, fontSize: 10, opacity: 0.45, letterSpacing: '1px' }}>{codigo}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 4 }}>Con cariño de:</div>
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 8 }}>{de || 'Remitente'}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>Vigencia: 6 meses desde la emisión · No canjeable por dinero en efectivo</div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" style={{ padding: '9px 12px' }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
