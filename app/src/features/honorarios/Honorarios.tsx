import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useResource } from '../../lib/useResource';
import { Icon } from '../../lib/icons';
import { Modal } from '../../components/Modal';
import type { PagoProfesional, PagoEstado, HonorariosResumen, Professional } from '../../lib/types';

// ── Helpers ──

const clp = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0);

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fmtPeriodo(p: string) {
  const [y, m] = p.split('-').map(Number);
  if (!y || !m) return p;
  return `${MESES[m - 1]} ${y}`;
}

function currentPeriodo() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const ESTADOS: PagoEstado[] = ['PAGADO', 'PENDIENTE_PAGO', 'PENDIENTE_FACTURA', 'PENDIENTE_BOLETA'];

const ESTADO_META: Record<PagoEstado, { label: string; color: string; bg: string }> = {
  PAGADO:            { label: 'Pagado',            color: 'var(--green)',   bg: 'var(--surface-soft)' },
  PENDIENTE_PAGO:    { label: 'Pendiente de pago', color: 'var(--orange)',  bg: 'var(--danger-soft)' },
  PENDIENTE_FACTURA: { label: 'Pendiente factura', color: 'var(--primary)', bg: 'var(--cream)' },
  PENDIENTE_BOLETA:  { label: 'Pendiente boleta',  color: 'var(--primary)', bg: 'var(--cream)' },
};

function fmtFecha(iso?: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

// ── Modal de crear/editar pago ──

function PagoModal({ pago, professionals, onClose, onSaved }: {
  pago: PagoProfesional | null;
  professionals: Professional[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [professionalId, setProfessionalId] = useState(pago?.professionalId ?? '');
  const [periodo, setPeriodo] = useState(pago?.periodo ?? currentPeriodo());
  const [monto, setMonto] = useState(pago ? String(pago.monto) : '');
  const [estado, setEstado] = useState<PagoEstado>(pago?.estado ?? 'PENDIENTE_PAGO');
  const [fechaPago, setFechaPago] = useState(pago?.fechaPago ? pago.fechaPago.slice(0, 10) : '');
  const [notas, setNotas] = useState(pago?.notas ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esEdicion = !!pago;
  const valid = professionalId && /^\d{4}-\d{2}$/.test(periodo) && Number(monto) >= 0 && monto !== '';

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', fontSize: 13.5, border: '1px solid var(--border)', borderRadius: 7, outline: 'none', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text)' };
  const lbl: React.CSSProperties = { fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 };

  const guardar = async () => {
    if (!valid) return;
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        periodo,
        monto: Number(monto),
        estado,
        fechaPago: fechaPago || null,
        notas: notas.trim() || null,
      };
      if (esEdicion) {
        await api.patch(`/honorarios/${pago.id}`, payload);
      } else {
        await api.post('/honorarios', { professionalId, ...payload });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
      setGuardando(false);
    }
  };

  return (
    <Modal open onClose={onClose} eyebrow={esEdicion ? 'Editar pago' : 'Nuevo pago'} title="Honorario a profesional" maxWidth={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={lbl}>Profesional *</label>
          <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} style={inp} disabled={esEdicion}>
            <option value="">Selecciona…</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.especialidad}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Mes *</label>
            <input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Monto (CLP) *</label>
            <input type="number" min={0} step={1000} value={monto} onChange={(e) => setMonto(e.target.value)} style={inp} placeholder="0" />
          </div>
        </div>
        <div>
          <label style={lbl}>Estado *</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as PagoEstado)} style={inp}>
            {ESTADOS.map((es) => <option key={es} value={es}>{ESTADO_META[es].label}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Fecha de pago (opcional)</label>
          <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Notas (opcional)</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder="N° de boleta/factura, detalle…" />
        </div>

        {error && <div style={{ fontSize: 13, color: 'var(--orange)', background: 'var(--danger-soft)', borderRadius: 7, padding: '8px 12px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={onClose} className="btn btn-soft" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={guardar} disabled={!valid || guardando} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: !valid || guardando ? 0.5 : 1 }}>
            <Icon name="save" size={14} /> {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Registrar pago'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Vista principal ──

export function Honorarios() {
  const { data: profData } = useResource<{ professionals: Professional[] }>('/data/professionals');
  const professionals = useMemo(() => profData?.professionals ?? [], [profData]);

  const [pagos, setPagos] = useState<PagoProfesional[] | null>(null);
  const [resumen, setResumen] = useState<HonorariosResumen | null>(null);
  const [meses, setMeses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [fMes, setFMes] = useState('');            // '' = todos
  const [fProf, setFProf] = useState('');          // '' = todos
  const [fEstado, setFEstado] = useState<'' | PagoEstado>('');

  const [modal, setModal] = useState<{ open: boolean; pago: PagoProfesional | null }>({ open: false, pago: null });

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (fMes) qs.set('periodo', fMes);
      if (fProf) qs.set('professionalId', fProf);
      if (fEstado) qs.set('estado', fEstado);
      const [lista, res] = await Promise.all([
        api.get<{ pagos: PagoProfesional[] }>(`/honorarios${qs.toString() ? `?${qs}` : ''}`),
        api.get<{ resumen: HonorariosResumen; meses: string[] }>(`/honorarios/resumen${fMes ? `?periodo=${fMes}` : ''}`),
      ]);
      setPagos(lista.pagos);
      setResumen(res.resumen);
      setMeses(res.meses);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    }
  }, [fMes, fProf, fEstado]);

  useEffect(() => { void cargar(); }, [cargar]);

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este pago?')) return;
    await api.del(`/honorarios/${id}`).catch(() => {});
    void cargar();
  };

  const exportCsv = () => {
    if (!pagos?.length) return;
    const filas = [['Profesional', 'Especialidad', 'Mes', 'Monto', 'Estado', 'Fecha pago', 'Notas']];
    for (const p of pagos) {
      filas.push([
        p.professional?.nombreCompleto ?? '', p.professional?.especialidad ?? '',
        fmtPeriodo(p.periodo), String(p.monto), ESTADO_META[p.estado].label,
        p.fechaPago ? p.fechaPago.slice(0, 10) : '', (p.notas ?? '').replace(/\n/g, ' '),
      ]);
    }
    const csv = filas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `honorarios${fMes ? '-' + fMes : ''}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const selectStyle: React.CSSProperties = { padding: '7px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' };

  const pendienteTotal = resumen ? resumen.PENDIENTE_PAGO + resumen.PENDIENTE_FACTURA + resumen.PENDIENTE_BOLETA : 0;

  return (
    <div className="fade-up">
      {/* Acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
          Registro de pagos a profesionales. Filtra por mes, profesional o estado; el resumen muestra los totales del período.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCsv} className="btn btn-soft" disabled={!pagos?.length} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: pagos?.length ? 1 : 0.5 }}>
            <Icon name="download" size={14} /> CSV
          </button>
          <button onClick={() => setModal({ open: true, pago: null })} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={15} /> Registrar pago
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', marginBottom: 18 }}>
        {[
          { label: fMes ? `Total ${fmtPeriodo(fMes)}` : 'Total general', val: resumen?.total ?? 0, color: 'var(--text)' },
          { label: 'Pagado', val: resumen?.PAGADO ?? 0, color: 'var(--green)' },
          { label: 'Pendiente de pago', val: resumen?.PENDIENTE_PAGO ?? 0, color: 'var(--orange)' },
          { label: 'Pendiente doc. (fact./bol.)', val: pendienteTotal - (resumen?.PENDIENTE_PAGO ?? 0), color: 'var(--primary)' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{clp(c.val)}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={fMes} onChange={(e) => setFMes(e.target.value)} style={selectStyle}>
          <option value="">Todos los meses</option>
          {meses.map((m) => <option key={m} value={m}>{fmtPeriodo(m)}</option>)}
        </select>
        <select value={fProf} onChange={(e) => setFProf(e.target.value)} style={selectStyle}>
          <option value="">Todos los profesionales</option>
          {professionals.map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`chip${fEstado === '' ? ' active' : ''}`} onClick={() => setFEstado('')}>Todos</button>
          {ESTADOS.map((es) => (
            <button key={es} className={`chip${fEstado === es ? ' active' : ''}`} onClick={() => setFEstado(es)}>{ESTADO_META[es].label}</button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {error && <div style={{ padding: 24, textAlign: 'center', color: 'var(--orange)', fontSize: 14 }}>{error}</div>}
      {!pagos && !error && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>}

      {pagos && pagos.length === 0 && (
        <div style={{ padding: 44, textAlign: 'center', color: 'var(--muted-2)' }}>
          <Icon name="credit" size={26} />
          <p style={{ marginTop: 10, fontSize: 14 }}>
            {fMes || fProf || fEstado ? 'Sin pagos para este filtro.' : 'Aún no hay pagos registrados.'}
          </p>
        </div>
      )}

      {pagos && pagos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pagos.map((p) => {
            const est = ESTADO_META[p.estado];
            return (
              <div key={p.id} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>{p.professional?.nombreCompleto ?? 'Profesional'}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, color: est.color, background: est.bg, fontWeight: 600 }}>{est.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {fmtPeriodo(p.periodo)}
                    {p.fechaPago && ` · pagado ${fmtFecha(p.fechaPago)}`}
                    {p.notas && ` · ${p.notas}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{clp(p.monto)}</span>
                  <button onClick={() => setModal({ open: true, pago: p })} className="btn btn-soft" title="Editar" style={{ padding: '7px 9px' }}><Icon name="edit" size={14} /></button>
                  <button onClick={() => eliminar(p.id)} className="btn btn-soft" title="Eliminar" style={{ padding: '7px 9px', color: 'var(--orange)' }}><Icon name="trash" size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal.open && (
        <PagoModal
          pago={modal.pago}
          professionals={professionals}
          onClose={() => setModal({ open: false, pago: null })}
          onSaved={() => { setModal({ open: false, pago: null }); void cargar(); }}
        />
      )}
    </div>
  );
}
