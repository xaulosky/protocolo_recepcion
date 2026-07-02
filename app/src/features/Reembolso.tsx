import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useApp } from '../store/app-context';
import { useAuth } from '../store/auth-context';
import { fmtDateTime, clp } from '../lib/format';
import { Icon } from '../lib/icons';
import { Modal } from '../components/Modal';
import type { SolicitudReembolso, ReembolsoActividad, ReembolsoEstado } from '../lib/types';

const ESTADOS: ReembolsoEstado[] = ['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO'];

const ESTADO_LABEL: Record<ReembolsoEstado, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

const ESTADO_STYLE: Record<ReembolsoEstado, { bg: string; color: string }> = {
  PENDIENTE:   { bg: '#FFF8E8', color: '#B08030' },
  EN_REVISION: { bg: '#EBF3FB', color: '#3B78AF' },
  APROBADO:    { bg: '#EDF5EF', color: '#3A6A4A' },
  RECHAZADO:   { bg: '#FBF0EB', color: '#C04040' },
};

const TIPO_CUENTA_OPTS = ['Corriente', 'Vista / RUT', 'Ahorro', 'Empresa'];

const EMPTY_FORM = {
  paciente: '', rut: '', tel: '', email: '', fechaSolicitud: '', fecha: '',
  monto: '', motivo: '', banco: '', tipoCuenta: '', cuenta: '', titular: '', urgente: false,
};

const TIPO_ACTIVIDAD: Record<string, string> = {
  CREACION: 'Solicitud creada',
  ESTADO:   'Cambio de estado',
  EDICION:  'Campos editados',
};

export function Reembolso() {
  const { toast } = useApp();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState<ReembolsoEstado | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [lista, setLista] = useState<SolicitudReembolso[]>([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [resumen, setResumen] = useState<Record<ReembolsoEstado, number>>({ PENDIENTE: 0, EN_REVISION: 0, APROBADO: 0, RECHAZADO: 0 });
  const [detalle, setDetalle] = useState<SolicitudReembolso | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canManage = user?.role === 'ADMIN' || user?.role === 'RECEPCION';

  const fetchLista = async (q?: string) => {
    setLoadingLista(true);
    try {
      const params = new URLSearchParams();
      if (filtro !== 'TODOS') params.set('estado', filtro);
      if (q?.trim()) params.set('q', q.trim());
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api.get<{ reembolsos: SolicitudReembolso[]; resumen: Record<ReembolsoEstado, number> }>(`/reembolsos${qs}`);
      setLista(data.reembolsos ?? []);
      if (data.resumen) setResumen(data.resumen);
    } catch {
      toast('Error al cargar historial');
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    fetchLista(busqueda);
  }, [filtro]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLista(busqueda);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda]); // eslint-disable-line react-hooks/exhaustive-deps

  const registrar = async () => {
    if (!form.paciente.trim()) { toast('Ingresa el nombre del paciente'); return; }
    if (!form.motivo.trim()) { toast('Ingresa el motivo'); return; }
    setSaving(true);
    try {
      await api.post('/reembolsos', {
        paciente:       form.paciente.trim(),
        rut:            form.rut.trim() || null,
        telefono:       form.tel.trim() || null,
        email:          form.email.trim() || null,
        fechaSolicitud: form.fechaSolicitud || null,
        fechaPago:      form.fecha || null,
        monto:          form.monto.trim() || null,
        motivo:         form.motivo.trim(),
        banco:          form.banco.trim() || null,
        tipoCuenta:     form.tipoCuenta || null,
        cuenta:         form.cuenta.trim() || null,
        titular:        form.titular.trim() || null,
        urgente:        form.urgente,
      });
      toast('Solicitud registrada en el sistema');
      setForm(EMPTY_FORM);
      fetchLista(busqueda);
    } catch {
      toast('Error al registrar solicitud');
    } finally {
      setSaving(false);
    }
  };

  const enviarCorreo = () => {
    const lines = [
      'Estimado equipo,\n\nAdjunto los datos de la solicitud de reembolso.\n',
      `Paciente: ${form.paciente}`,
      form.rut            ? `RUT: ${form.rut}`                         : null,
      form.tel            ? `Teléfono: ${form.tel}`                    : null,
      form.email          ? `Correo: ${form.email}`                    : null,
      form.fechaSolicitud ? `Fecha de solicitud: ${form.fechaSolicitud}`: null,
      form.fecha          ? `Fecha del pago original: ${form.fecha}`   : null,
      form.monto          ? `Monto a reembolsar: ${form.monto}`        : null,
      `Motivo: ${form.motivo}`,
      form.banco          ? `Banco: ${form.banco}`                     : null,
      form.tipoCuenta     ? `Tipo de cuenta: ${form.tipoCuenta}`       : null,
      form.cuenta         ? `N° cuenta: ${form.cuenta}`                : null,
      form.titular        ? `Titular: ${form.titular}`                 : null,
      form.urgente        ? '\n** URGENTE **'                          : null,
    ].filter(Boolean).join('\n');
    window.open(`mailto:contacto@cialo.cl?subject=${encodeURIComponent('Solicitud de Reembolso – Clínica Cialo')}&body=${encodeURIComponent(lines)}`, '_blank');
    toast('Abriendo cliente de correo...');
  };

  const cambiarEstado = async (id: string, estado: ReembolsoEstado) => {
    try {
      await api.patch(`/reembolsos/${id}`, { estado });
      setLista((prev) => prev.map((r) => r.id === id ? { ...r, estado } : r));
      if (detalle?.id === id) setDetalle((d) => d ? { ...d, estado } : d);
    } catch {
      toast('Error al cambiar estado');
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta solicitud?')) return;
    try {
      await api.del(`/reembolsos/${id}`);
      setLista((prev) => prev.filter((r) => r.id !== id));
      if (detalle?.id === id) setDetalle(null);
      toast('Solicitud eliminada');
    } catch {
      toast('Error al eliminar');
    }
  };

  // Total monto de la lista visible (parseo heurístico de texto libre)
  const totalMonto = lista.reduce((acc, r) => {
    const n = parseInt((r.monto ?? '').replace(/\D/g, ''), 10);
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
  const hayMontoImparseable = lista.some((r) => r.monto && isNaN(parseInt((r.monto ?? '').replace(/\D/g, ''), 10)));

  return (
    <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
      {/* LEFT: Form */}
      <div className="card" style={{ padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ width: 40, height: 40, background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
            <Icon name="ref" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>Solicitud de Reembolso</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Registra en el sistema o envía por correo</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nombre del paciente" value={form.paciente} onChange={set('paciente')} placeholder="Nombre completo" />
          <Field label="RUT" value={form.rut} onChange={set('rut')} placeholder="12.345.678-9" />
          <Field label="Teléfono" value={form.tel} onChange={set('tel')} placeholder="+56 9 XXXX XXXX" />
          <Field label="Correo electrónico" value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" type="email" />
          <Field label="Fecha de solicitud" type="date" value={form.fechaSolicitud} onChange={set('fechaSolicitud')} />
          <Field label="Fecha del pago original" type="date" value={form.fecha} onChange={set('fecha')} />
          <Field span label="Monto a reembolsar" value={form.monto} onChange={set('monto')} placeholder="$ 0" />
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Motivo</label>
            <textarea className="textarea" rows={3} value={form.motivo} onChange={(e) => set('motivo')(e.target.value)} placeholder="Describe el motivo del reembolso..." />
          </div>
          <Field label="Banco" value={form.banco} onChange={set('banco')} placeholder="Banco Estado, Santander…" />
          <div>
            <label className="label">Tipo de cuenta</label>
            <select className="input" value={form.tipoCuenta} onChange={(e) => set('tipoCuenta')(e.target.value)}>
              <option value="">Selecciona tipo</option>
              {TIPO_CUENTA_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Número de cuenta" value={form.cuenta} onChange={set('cuenta')} placeholder="Número de cuenta" />
          <Field label="Nombre del titular" value={form.titular} onChange={set('titular')} placeholder="Si difiere del paciente" />
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.urgente} onChange={(e) => set('urgente')(e.target.checked)} style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
              <span style={{ fontSize: 13, color: 'var(--text)' }}>Marcar como urgente</span>
            </label>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          <button className="btn btn-primary" style={{ padding: 11, fontSize: 13.5 }} onClick={registrar} disabled={saving}>
            {saving ? 'Guardando...' : 'Registrar en sistema'}
          </button>
          <button className="btn btn-secondary" style={{ padding: 11, fontSize: 13.5 }} onClick={enviarCorreo}>
            Enviar por correo
          </button>
        </div>
      </div>

      {/* RIGHT: History */}
      <div className="card" style={{ padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ width: 40, height: 40, background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
            <Icon name="list" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>Historial</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Solicitudes registradas</div>
          </div>
        </div>

        <input
          className="input"
          style={{ marginBottom: 10, fontSize: 12.5 }}
          placeholder="Buscar por paciente o motivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {/* Filter chips with counters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {(['TODOS', ...ESTADOS] as const).map((e) => {
            const active = filtro === e;
            const style = e !== 'TODOS' ? ESTADO_STYLE[e as ReembolsoEstado] : null;
            const count = e !== 'TODOS' ? resumen[e as ReembolsoEstado] : null;
            return (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  border: active ? '1.5px solid currentColor' : '1px solid var(--border-soft)',
                  background: active && style ? style.bg : active ? 'var(--cream)' : 'transparent',
                  color: active && style ? style.color : active ? 'var(--primary)' : 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {e === 'TODOS' ? 'Todos' : ESTADO_LABEL[e as ReembolsoEstado]}
                {count !== null && count > 0 && (
                  <span style={{ marginLeft: 5, fontWeight: 700, opacity: 0.75 }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Total monto visible */}
        {lista.length > 0 && totalMonto > 0 && (
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
            Total visible: ${clp(totalMonto)}{hayMontoImparseable ? ' aprox.' : ''}
          </div>
        )}

        {/* List */}
        {loadingLista ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 13 }}>Cargando...</div>
        ) : lista.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 13 }}>Sin solicitudes</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
            {lista.map((r) => {
              const es = ESTADO_STYLE[r.estado];
              return (
                <div
                  key={r.id}
                  onClick={() => setDetalle(r)}
                  style={{
                    border: '1px solid var(--border-soft)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    background: 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{r.paciente}</span>
                        {r.urgente && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: '#FFF0CC', color: '#A06000', padding: '1px 7px', borderRadius: 20, letterSpacing: 0.3 }}>
                            URGENTE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                        {r.motivo}
                      </div>
                      {r.monto && (
                        <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2, fontWeight: 500 }}>{r.monto}</div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                        {r.fechaSolicitud ? `Solicitado: ${r.fechaSolicitud} · ` : ''}Registrado: {fmtDateTime(r.createdAt)}
                      </div>
                    </div>
                    <div
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: es.bg, color: es.color }}>
                        {ESTADO_LABEL[r.estado]}
                      </span>
                      {canManage && (
                        <select
                          value={r.estado}
                          onChange={(e) => cambiarEstado(r.id, e.target.value as ReembolsoEstado)}
                          style={{
                            fontSize: 11.5, padding: '2px 6px', borderRadius: 6,
                            border: '1px solid var(--border-soft)', background: 'var(--bg)',
                            color: 'var(--text)', cursor: 'pointer',
                          }}
                        >
                          {ESTADOS.map((s) => (
                            <option key={s} value={s}>{ESTADO_LABEL[s]}</option>
                          ))}
                        </select>
                      )}
                      {canManage && (
                        <button
                          onClick={() => eliminar(r.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, display: 'flex', alignItems: 'center' }}
                          title="Eliminar"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {canManage && (
                      <NotasEditor id={r.id} initial={r.notas ?? ''} onSave={(notas) => {
                        setLista(prev => prev.map(x => x.id === r.id ? { ...x, notas } : x));
                      }} />
                    )}
                    {!canManage && r.notas && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', background: 'var(--bg)', borderRadius: 6, padding: '6px 10px' }}>
                        {r.notas}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <DetalleReembolsoModal
        reembolso={detalle}
        onClose={() => setDetalle(null)}
        canManage={canManage}
        onEstadoChange={cambiarEstado}
        onEliminar={eliminar}
        onUpdate={(updated) => {
          setLista(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
          setDetalle(d => d ? { ...d, ...updated } : d);
        }}
      />
    </div>
  );
}

// ── DetalleReembolsoModal ──────────────────────────────────────────────────

interface DetalleProps {
  reembolso: SolicitudReembolso | null;
  onClose: () => void;
  canManage: boolean;
  onEstadoChange: (id: string, estado: ReembolsoEstado) => void;
  onEliminar: (id: string) => void;
  onUpdate: (updated: Partial<SolicitudReembolso> & { id: string }) => void;
}

function DetalleReembolsoModal({ reembolso, onClose, canManage, onEstadoChange, onEliminar, onUpdate }: DetalleProps) {
  const { toast } = useApp();
  const [actividad, setActividad] = useState<ReembolsoActividad[]>([]);
  const [loadingAct, setLoadingAct] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<{
    paciente: string; rut: string; telefono: string; email: string;
    fechaSolicitud: string; fechaPago: string; monto: string; motivo: string;
    banco: string; tipoCuenta: string; cuenta: string; titular: string; urgente: boolean;
  }>({
    paciente: '', rut: '', telefono: '', email: '', fechaSolicitud: '',
    fechaPago: '', monto: '', motivo: '', banco: '', tipoCuenta: '', cuenta: '', titular: '', urgente: false,
  });

  useEffect(() => {
    if (!reembolso) { setActividad([]); setEditing(false); return; }
    setEditing(false);
    setEditForm({
      paciente:       reembolso.paciente,
      rut:            reembolso.rut ?? '',
      telefono:       reembolso.telefono ?? '',
      email:          reembolso.email ?? '',
      fechaSolicitud: reembolso.fechaSolicitud ?? '',
      fechaPago:      reembolso.fechaPago ?? '',
      monto:          reembolso.monto ?? '',
      motivo:         reembolso.motivo,
      banco:          reembolso.banco ?? '',
      tipoCuenta:     reembolso.tipoCuenta ?? '',
      cuenta:         reembolso.cuenta ?? '',
      titular:        reembolso.titular ?? '',
      urgente:        reembolso.urgente,
    });
    setLoadingAct(true);
    api.get<{ reembolso: SolicitudReembolso }>(`/reembolsos/${reembolso.id}`)
      .then((d) => setActividad(d.reembolso.actividad ?? []))
      .catch(() => {})
      .finally(() => setLoadingAct(false));
  }, [reembolso?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const copiarDatos = () => {
    if (!reembolso) return;
    const lineas = [
      `Titular: ${reembolso.titular || reembolso.paciente}`,
      reembolso.rut      ? `RUT: ${reembolso.rut}`             : null,
      reembolso.banco    ? `Banco: ${reembolso.banco}`         : null,
      reembolso.tipoCuenta ? `Tipo: ${reembolso.tipoCuenta}`  : null,
      reembolso.cuenta   ? `N° cuenta: ${reembolso.cuenta}`   : null,
      reembolso.email    ? `Correo: ${reembolso.email}`        : null,
      reembolso.monto    ? `Monto: ${reembolso.monto}`         : null,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lineas).then(() => toast('Datos de transferencia copiados'));
  };

  const guardarEdicion = async () => {
    if (!reembolso) return;
    setSaving(true);
    try {
      const payload = {
        paciente:       editForm.paciente.trim() || undefined,
        rut:            editForm.rut.trim() || null,
        telefono:       editForm.telefono.trim() || null,
        email:          editForm.email.trim() || null,
        fechaSolicitud: editForm.fechaSolicitud || null,
        fechaPago:      editForm.fechaPago || null,
        monto:          editForm.monto.trim() || null,
        motivo:         editForm.motivo.trim() || undefined,
        banco:          editForm.banco.trim() || null,
        tipoCuenta:     editForm.tipoCuenta || null,
        cuenta:         editForm.cuenta.trim() || null,
        titular:        editForm.titular.trim() || null,
        urgente:        editForm.urgente,
      };
      const data = await api.patch<{ reembolso: SolicitudReembolso }>(`/reembolsos/${reembolso.id}`, payload);
      onUpdate(data.reembolso);
      setEditing(false);
      toast('Cambios guardados');
      // Refrescar actividad
      const d = await api.get<{ reembolso: SolicitudReembolso }>(`/reembolsos/${reembolso.id}`);
      setActividad(d.reembolso.actividad ?? []);
    } catch {
      toast('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  if (!reembolso) return null;
  const es = ESTADO_STYLE[reembolso.estado];

  return (
    <Modal open={!!reembolso} onClose={onClose} eyebrow="Solicitud de Reembolso" title={reembolso.paciente} maxWidth={580}>
      {/* Estado + urgente */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: es.bg, color: es.color }}>
          {ESTADO_LABEL[reembolso.estado]}
        </span>
        {reembolso.urgente && (
          <span style={{ fontSize: 11, fontWeight: 700, background: '#FFF0CC', color: '#A06000', padding: '3px 10px', borderRadius: 20, letterSpacing: 0.3 }}>
            URGENTE
          </span>
        )}
        {canManage && !editing && (
          <select
            value={reembolso.estado}
            onChange={(e) => onEstadoChange(reembolso.id, e.target.value as ReembolsoEstado)}
            style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', marginLeft: 'auto' }}
          >
            {ESTADOS.map((s) => <option key={s} value={s}>{ESTADO_LABEL[s]}</option>)}
          </select>
        )}
      </div>

      {/* Datos principales */}
      {!editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <DR label="Paciente"       value={reembolso.paciente} />
          {reembolso.rut      && <DR label="RUT"           value={reembolso.rut} />}
          {reembolso.telefono && <DR label="Teléfono"      value={reembolso.telefono} />}
          {reembolso.email    && <DR label="Correo"        value={reembolso.email} />}
          {reembolso.fechaSolicitud && <DR label="Fecha solicitud" value={reembolso.fechaSolicitud} />}
          {reembolso.fechaPago      && <DR label="Fecha pago"      value={reembolso.fechaPago} />}
          {reembolso.monto    && <DR label="Monto"         value={reembolso.monto} bold />}
          <DR label="Motivo"        value={reembolso.motivo} wrap />
          {(reembolso.banco || reembolso.tipoCuenta || reembolso.cuenta || reembolso.titular) && (
            <>
              <div style={{ borderTop: '1px solid var(--border-soft)', margin: '4px 0' }} />
              {reembolso.banco      && <DR label="Banco"        value={reembolso.banco} />}
              {reembolso.tipoCuenta && <DR label="Tipo cuenta"  value={reembolso.tipoCuenta} />}
              {reembolso.cuenta     && <DR label="N° cuenta"    value={reembolso.cuenta} />}
              {reembolso.titular    && <DR label="Titular"      value={reembolso.titular} />}
            </>
          )}
          <div style={{ borderTop: '1px solid var(--border-soft)', margin: '4px 0' }} />
          <DR label="Registrado"   value={fmtDateTime(reembolso.createdAt)} />
          {reembolso.creadoPor && <DR label="Por"          value={reembolso.creadoPor.nombre} />}
          {reembolso.notas    && <DR label="Notas"         value={reembolso.notas} wrap />}
        </div>
      ) : (
        /* Formulario de edición */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Nombre del paciente" value={editForm.paciente} onChange={(v) => setEditForm(f => ({ ...f, paciente: v }))} placeholder="Nombre completo" />
          <Field label="RUT" value={editForm.rut} onChange={(v) => setEditForm(f => ({ ...f, rut: v }))} placeholder="12.345.678-9" />
          <Field label="Teléfono" value={editForm.telefono} onChange={(v) => setEditForm(f => ({ ...f, telefono: v }))} placeholder="+56 9" />
          <Field label="Correo" value={editForm.email} onChange={(v) => setEditForm(f => ({ ...f, email: v }))} placeholder="correo@" type="email" />
          <Field label="Fecha solicitud" type="date" value={editForm.fechaSolicitud} onChange={(v) => setEditForm(f => ({ ...f, fechaSolicitud: v }))} />
          <Field label="Fecha pago" type="date" value={editForm.fechaPago} onChange={(v) => setEditForm(f => ({ ...f, fechaPago: v }))} />
          <Field span label="Monto" value={editForm.monto} onChange={(v) => setEditForm(f => ({ ...f, monto: v }))} placeholder="$0" />
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Motivo</label>
            <textarea className="textarea" rows={3} value={editForm.motivo} onChange={(e) => setEditForm(f => ({ ...f, motivo: e.target.value }))} />
          </div>
          <Field label="Banco" value={editForm.banco} onChange={(v) => setEditForm(f => ({ ...f, banco: v }))} placeholder="Banco Estado…" />
          <div>
            <label className="label">Tipo de cuenta</label>
            <select className="input" value={editForm.tipoCuenta} onChange={(e) => setEditForm(f => ({ ...f, tipoCuenta: e.target.value }))}>
              <option value="">Selecciona tipo</option>
              {TIPO_CUENTA_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="N° cuenta" value={editForm.cuenta} onChange={(v) => setEditForm(f => ({ ...f, cuenta: v }))} placeholder="Número de cuenta" />
          <Field label="Titular" value={editForm.titular} onChange={(v) => setEditForm(f => ({ ...f, titular: v }))} placeholder="Si difiere" />
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={editForm.urgente} onChange={(e) => setEditForm(f => ({ ...f, urgente: e.target.checked }))} style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
              <span style={{ fontSize: 13, color: 'var(--text)' }}>Marcar como urgente</span>
            </label>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-soft" style={{ fontSize: 12.5, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={copiarDatos}>
          <Icon name="copy" size={13} /> Copiar datos transferencia
        </button>
        {canManage && !editing && (
          <button className="btn btn-soft" style={{ fontSize: 12.5, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setEditing(true)}>
            <Icon name="pencil" size={13} /> Editar
          </button>
        )}
        {editing && (
          <>
            <button className="btn btn-primary" style={{ fontSize: 12.5, padding: '7px 14px' }} onClick={guardarEdicion} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button className="btn btn-soft" style={{ fontSize: 12.5, padding: '7px 14px' }} onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </>
        )}
        {canManage && !editing && (
          <button
            className="btn btn-soft"
            style={{ fontSize: 12.5, padding: '7px 14px', color: 'var(--danger)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => onEliminar(reembolso.id)}
          >
            <Icon name="trash" size={13} /> Eliminar
          </button>
        )}
      </div>

      {/* Actividad */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Historial de cambios</div>
        {loadingAct ? (
          <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '10px 0' }}>Cargando...</div>
        ) : actividad.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '6px 0' }}>Sin actividad registrada</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actividad.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text)' }}>
                    <span style={{ fontWeight: 600 }}>{a.user.nombre}</span>
                    {' · '}
                    {TIPO_ACTIVIDAD[a.tipo] ?? a.tipo}
                    {a.detalle ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> — {a.detalle}</span> : null}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>{fmtDateTime(a.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Componentes auxiliares ─────────────────────────────────────────────────

function DR({ label, value, bold, wrap }: { label: string; value: string; bold?: boolean; wrap?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: wrap ? 'flex-start' : 'center' }}>
      <span style={{ fontSize: 12.5, color: 'var(--muted-2)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12.5, color: 'var(--text-2)', textAlign: 'right', fontWeight: bold ? 600 : 400, whiteSpace: wrap ? 'pre-wrap' : undefined, wordBreak: wrap ? 'break-word' : undefined }}>
        {value}
      </span>
    </div>
  );
}

function NotasEditor({ id, initial, onSave }: { id: string; initial: string; onSave: (v: string) => void }) {
  const { toast } = useApp();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/reembolsos/${id}`, { notas: val || null });
      onSave(val);
      setEditing(false);
      toast('Notas guardadas');
    } catch { toast('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (!editing && !val) return (
    <button onClick={() => setEditing(true)} style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)', background: 'none', border: '1px dashed var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
      + Agregar nota interna...
    </button>
  );
  if (!editing) return (
    <div onClick={() => setEditing(true)} style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', background: 'var(--bg)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
      {val}
    </div>
  );
  return (
    <div style={{ marginTop: 8 }}>
      <textarea className="input" rows={2} value={val} onChange={(e) => setVal(e.target.value)} style={{ fontSize: 12, resize: 'none', width: '100%' }} autoFocus />
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button className="btn btn-primary" style={{ fontSize: 11, padding: '3px 10px' }} onClick={save} disabled={saving}>{saving ? '...' : 'Guardar'}</button>
        <button className="btn btn-soft" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => { setVal(initial); setEditing(false); }}>Cancelar</button>
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
