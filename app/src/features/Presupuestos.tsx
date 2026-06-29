import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../lib/api';
import { useApp, useCopy } from '../store/app-context';
import { useResource } from '../lib/useResource';
import { money, fmtDateTime } from '../lib/format';
import { Icon } from '../lib/icons';
import type { Treatment, Quote, QuoteItem } from '../lib/types';

// ── Local form item type ──────────────────────────────────────────────────────

interface Item { nombre: string; cat: string; precio: number; cantidad: number }

// ── History list ──────────────────────────────────────────────────────────────

function HistoryList({
  quotes,
  loading,
  selected,
  onSelect,
  onDelete,
}: {
  quotes: Quote[];
  loading: boolean;
  selected: string | null;
  onSelect: (q: Quote) => void;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted-3)' }}>
        <Icon name="loader" size={20} strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 8px' }} />
        <div style={{ fontSize: 12 }}>Cargando historial…</div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--muted-3)' }}>
        <Icon name="inbox" size={28} strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 10px' }} />
        <div style={{ fontSize: 12 }}>Sin presupuestos guardados</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {quotes.map((q) => {
        const isSelected = q.id === selected;
        return (
          <div
            key={q.id}
            onClick={() => onSelect(q)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
              background: isSelected ? 'var(--primary-soft)' : '#fff',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {q.paciente}
                </div>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                  {money(q.total)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>
                  {fmtDateTime(q.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '2px 7px',
                  }}
                >
                  {q.items.length} ítem{q.items.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(q.id); }}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 2,
                    color: 'var(--orange)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                  title="Eliminar presupuesto"
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Presupuestos() {
  const { toast } = useApp();
  const copy = useCopy();
  const { data } = useResource<{ treatments: Treatment[] }>('/data/treatments');
  const treatments = useMemo(() => data?.treatments ?? [], [data]);

  // Form state
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState(0);
  const [notas, setNotas] = useState('');

  // History state
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load history on mount
  useEffect(() => {
    let cancelled = false;
    setHistLoading(true);
    api.get<{ quotes: Quote[] }>('/quotes')
      .then((res) => { if (!cancelled) setQuotes(res.quotes); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setHistLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Treatment search results
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q ? treatments.filter((t) => t.nombre.toLowerCase().includes(q)) : treatments;
    return base.slice(0, 8);
  }, [search, treatments]);

  // Totals
  const subtotal = items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const descAmt = subtotal * (desc / 100);
  const total = subtotal - descAmt;

  // Form actions
  const add = (t: Treatment) =>
    setItems((cur) => [...cur, { nombre: t.nombre, cat: t.categoria, precio: t.valorDesde || 0, cantidad: 1 }]);
  const remove = (idx: number) => setItems((cur) => cur.filter((_, i) => i !== idx));
  const changeQty = (idx: number, qty: number) =>
    setItems((cur) => cur.map((it, i) => (i === idx ? { ...it, cantidad: Math.max(1, qty) } : it)));

  const clear = useCallback(() => {
    setNombre(''); setRut(''); setTel(''); setEmail('');
    setItems([]); setDesc(0); setSearch(''); setNotas('');
    setSelectedId(null);
  }, []);

  // Load a saved quote into the form
  const loadQuote = useCallback((q: Quote) => {
    setNombre(q.paciente);
    setRut(q.rut ?? '');
    setTel(q.telefono ?? '');
    setEmail(q.email ?? '');
    setDesc(q.descuento);
    setNotas(q.notas ?? '');
    setItems(q.items.map((it: QuoteItem) => ({ nombre: it.nombre, cat: it.cat, precio: it.precio, cantidad: it.cantidad })));
    setSearch('');
    setSelectedId(q.id);
  }, []);

  // Delete a quote
  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.del(`/quotes/${id}`);
      setQuotes((cur) => cur.filter((q) => q.id !== id));
      if (selectedId === id) clear();
      toast('Presupuesto eliminado');
    } catch {
      toast('Error al eliminar el presupuesto');
    }
  }, [selectedId, clear, toast]);

  // Copy to clipboard
  const doCopy = () => {
    let txt = `PRESUPUESTO CLÍNICA CIALO\n`;
    if (nombre) txt += `\nPaciente: ${nombre}`;
    if (rut) txt += `\nRUT: ${rut}`;
    txt += '\n\nTRATAMIENTOS:\n';
    items.forEach((it) => { txt += `• ${it.nombre} (${it.cantidad}×): ${money(it.precio * it.cantidad)}\n`; });
    if (desc > 0) txt += `\nDescuento ${desc}%: −${money(descAmt)}`;
    txt += `\nTOTAL: ${money(total)}`;
    if (notas) txt += `\n\nNotas: ${notas}`;
    copy(txt, 'Presupuesto copiado');
  };

  const changePrice = (idx: number, price: number) =>
    setItems((cur) => cur.map((it, i) => (i === idx ? { ...it, precio: Math.max(0, price) } : it)));

  // Save to API
  const doSave = async () => {
    if (!nombre.trim()) { toast('Ingresa el nombre del paciente'); return; }
    if (items.length === 0) { toast('Agrega al menos un tratamiento'); return; }
    setSaving(true);
    try {
      const body = {
        paciente: nombre.trim(),
        rut: rut.trim() || null,
        telefono: tel.trim() || null,
        email: email.trim() || null,
        items: items.map((it) => ({ nombre: it.nombre, cat: it.cat, precio: it.precio, cantidad: it.cantidad })),
        descuento: desc,
        notas: notas.trim() || null,
      };
      if (selectedId) {
        const res = await api.patch<{ quote: Quote }>(`/quotes/${selectedId}`, body);
        setQuotes((cur) => cur.map((q) => q.id === selectedId ? res.quote : q));
        toast('Presupuesto actualizado');
      } else {
        const res = await api.post<{ quote: Quote }>('/quotes', body);
        setQuotes((cur) => [res.quote, ...cur]);
        setSelectedId(res.quote.id);
        toast('Presupuesto guardado');
      }
    } catch {
      toast('Error al guardar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fade-up"
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 320px',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      {/* ── Column 1: History ── */}
      <div className="card" style={{ padding: 16, position: 'sticky', top: 80, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Historial
        </div>
        <HistoryList
          quotes={quotes}
          loading={histLoading}
          selected={selectedId}
          onSelect={loadQuote}
          onDelete={handleDelete}
        />
      </div>

      {/* ── Column 2: Form ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
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
          <input
            className="input"
            placeholder="Buscar tratamiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
            {results.map((t) => (
              <button
                key={t.id}
                onClick={() => add(t)}
                className="pres-pick"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  textAlign: 'left',
                  background: '#fff',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{t.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>
                    {t.categoria} · {t.valorDesde ? money(t.valorDesde) : 'Evaluación'}
                  </div>
                </div>
                <span style={{ color: 'var(--primary)', display: 'flex', flexShrink: 0 }}>
                  <Icon name="plus" size={14} strokeWidth={2.5} />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <label className="label" style={{ marginBottom: 6, display: 'block' }}>Notas internas</label>
          <textarea
            className="input"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observaciones, condiciones especiales, etc."
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* ── Column 3: Summary ── */}
      <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
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
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-softer)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {it.nombre}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <input
                        type="number"
                        min={1}
                        value={it.cantidad}
                        onChange={(e) => changeQty(i, Number(e.target.value))}
                        style={{
                          width: 42,
                          padding: '2px 4px',
                          fontSize: 11,
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          textAlign: 'center',
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>×</span>
                        <input
                          type="number"
                          min={0}
                          value={it.precio}
                          onChange={(e) => changePrice(i, Number(e.target.value))}
                          style={{ width: 70, padding: '2px 4px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 4, textAlign: 'right' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{money(it.precio * it.cantidad)}</span>
                    <button
                      onClick={() => remove(i)}
                      style={{ color: 'var(--orange)', border: 'none', background: 'none', padding: 2, display: 'flex' }}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Descuento %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={desc}
                onChange={(e) => setDesc(Number(e.target.value))}
                className="input"
                style={{ width: 60, padding: '6px 8px', textAlign: 'center' }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 14 }}>
              <SummaryRow label="Subtotal" value={money(subtotal)} />
              {desc > 0 && <SummaryRow label={`Descuento ${desc}%`} value={`−${money(descAmt)}`} green />}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{money(total)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', gap: 7 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={doCopy}>
                  <Icon name="copy" size={13} style={{ marginRight: 5 }} />
                  Copiar
                </button>
                <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => window.print()}>
                  <Icon name="print" size={13} style={{ marginRight: 5 }} />
                  Imprimir
                </button>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--green-2)', borderColor: 'var(--green-2)' }}
                  onClick={doSave}
                  disabled={saving}
                >
                  <Icon name={saving ? 'loader' : 'save'} size={13} style={{ marginRight: 5 }} />
                  {saving ? 'Guardando…' : selectedId ? 'Actualizar presupuesto' : 'Guardar presupuesto'}
                </button>
                <button className="btn btn-danger" onClick={clear} title="Limpiar formulario">
                  <Icon name="x" size={13} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <button
                  className="btn btn-soft"
                  style={{ flex: 1, color: '#25D366' }}
                  onClick={() => {
                    let txt = `*PRESUPUESTO CLÍNICA CIALO*\n`;
                    if (nombre) txt += `\nPaciente: ${nombre}`;
                    txt += '\n\n*TRATAMIENTOS:*\n';
                    items.forEach((it) => { txt += `• ${it.nombre} (${it.cantidad}×): $${(it.precio * it.cantidad).toLocaleString('es-CL')}\n`; });
                    if (desc > 0) txt += `\nDescuento ${desc}%: −$${Math.round(subtotal * desc / 100).toLocaleString('es-CL')}`;
                    txt += `\n*TOTAL: $${total.toLocaleString('es-CL')}*`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
                  }}
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </>
        )}

        {items.length === 0 && (
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-soft" style={{ fontSize: 12 }} onClick={clear}>
              <Icon name="rotate-ccw" size={12} style={{ marginRight: 4 }} />
              Limpiar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
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
