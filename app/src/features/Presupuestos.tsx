import { useMemo, useState } from 'react';
import { useResource } from '../lib/useResource';
import { useCopy } from '../store/app-context';
import { money } from '../lib/format';
import { Icon } from '../lib/icons';
import type { Treatment } from '../lib/types';

interface Item { nombre: string; cat: string; precio: number; cantidad: number }

export function Presupuestos() {
  const copy = useCopy();
  const { data } = useResource<{ treatments: Treatment[] }>('/data/treatments');
  const treatments = useMemo(() => data?.treatments ?? [], [data]);
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState(0);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q ? treatments.filter((t) => t.nombre.toLowerCase().includes(q)) : treatments;
    return base.slice(0, 8);
  }, [search, treatments]);

  const subtotal = items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const descAmt = subtotal * (desc / 100);
  const total = subtotal - descAmt;

  const add = (t: Treatment) =>
    setItems((cur) => [...cur, { nombre: t.nombre, cat: t.categoria, precio: t.valorDesde || 0, cantidad: 1 }]);
  const remove = (idx: number) => setItems((cur) => cur.filter((_, i) => i !== idx));
  const clear = () => { setNombre(''); setRut(''); setTel(''); setEmail(''); setItems([]); setDesc(0); setSearch(''); };

  const doCopy = () => {
    let txt = `PRESUPUESTO CLÍNICA CIALO\n`;
    if (nombre) txt += `\nPaciente: ${nombre}`;
    if (rut) txt += `\nRUT: ${rut}`;
    txt += '\n\nTRATAMIENTOS:\n';
    items.forEach((it) => { txt += `• ${it.nombre} (${it.cantidad}×): ${money(it.precio * it.cantidad)}\n`; });
    if (desc > 0) txt += `\nDescuento ${desc}%: −${money(descAmt)}`;
    txt += `\nTOTAL: ${money(total)}`;
    copy(txt, 'Presupuesto copiado');
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Datos del paciente</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Nombre" value={nombre} onChange={setNombre} placeholder="Nombre completo" />
            <Field label="RUT" value={rut} onChange={setRut} placeholder="12.345.678-9" />
            <Field label="Teléfono" value={tel} onChange={setTel} placeholder="+56 9 XXXX XXXX" />
            <Field label="Correo" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" />
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Agregar tratamiento</div>
          <input className="input" placeholder="Buscar tratamiento..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
            {results.map((t) => (
              <button key={t.id} onClick={() => add(t)} className="pres-pick" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 7, textAlign: 'left', background: '#fff' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{t.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>{t.categoria} · {t.valorDesde ? money(t.valorDesde) : 'Evaluación'}</div>
                </div>
                <span style={{ color: 'var(--primary)', display: 'flex', flexShrink: 0 }}><Icon name="plus" size={14} strokeWidth={2.5} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ width: 320, padding: 20, position: 'sticky', top: 80 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Resumen</div>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--muted-3)' }}>
            <Icon name="file" size={30} strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 12.5 }}>Agrega tratamientos<br />para comenzar</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 14 }}>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-softer)' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>{it.cantidad}× · {money(it.precio)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{money(it.precio * it.cantidad)}</span>
                    <button onClick={() => remove(i)} style={{ color: 'var(--orange)', border: 'none', background: 'none', padding: 2, display: 'flex' }}><Icon name="trash" size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Descuento %</label>
              <input type="number" min={0} max={100} value={desc} onChange={(e) => setDesc(Number(e.target.value))} className="input" style={{ width: 60, padding: '6px 8px', textAlign: 'center' }} />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 14 }}>
              <SummaryRow label="Subtotal" value={money(subtotal)} />
              {desc > 0 && <SummaryRow label={`Descuento ${desc}%`} value={`−${money(descAmt)}`} green />}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{money(total)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={doCopy}>Copiar</button>
              <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => window.print()}>Imprimir</button>
              <button className="btn btn-danger" onClick={clear}>Limpiar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SummaryRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontSize: 12.5, color: green ? 'var(--green-2)' : 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 12.5, color: green ? 'var(--green-2)' : 'var(--text)' }}>{value}</span>
    </div>
  );
}
