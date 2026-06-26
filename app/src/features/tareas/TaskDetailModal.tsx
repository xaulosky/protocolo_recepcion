import { useEffect, useState } from 'react';
import type { Task, Etapa, Prioridad, TaskActivity } from '../../lib/types';
import type { UpdateTarea, AssignableUser } from './useTareas';
import { ETAPA_LABEL, ETAPAS, PRIORIDAD_LABEL } from './useTareas';
import { Modal } from '../../components/Modal';
import { Icon } from '../../lib/icons';
import { colorFromString, fmtDateTime, toDateTimeLocal } from '../../lib/format';

const PRIO_STYLE: Record<Prioridad, { bg: string; color: string }> = {
  URGENTE: { bg: '#FBF0EB', color: '#C97B4B' },
  BAJA:    { bg: '#EDF5EF', color: '#4A7A5A' },
  NORMAL:  { bg: '#F5F5F5', color: '#7A7066' },
};

const ACTIVITY_ICON: Record<string, string> = {
  CREADA:    'plus',
  MOVIDA:    'act',
  REASIGNADA:'users',
  FECHA:     'calendar',
  EDITADA:   'pen',
};

interface Props {
  taskId: string | null;
  users: AssignableUser[];
  onClose: () => void;
  onGetTask: (id: string) => Promise<Task>;
  onActualizar: (id: string, data: UpdateTarea) => Promise<Task>;
  onEliminar: (id: string) => void;
}

export function TaskDetailModal({ taskId, users, onClose, onGetTask, onActualizar, onEliminar }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Campos editables
  const [etapa, setEtapa]           = useState<Etapa>('PENDIENTE');
  const [prioridad, setPrioridad]   = useState<Prioridad>('NORMAL');
  const [asignadaId, setAsignadaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [paciente, setPaciente]     = useState('');
  const [dueAt, setDueAt]           = useState('');

  useEffect(() => {
    if (!taskId) { setTask(null); return; }
    setLoading(true);
    onGetTask(taskId).then((t) => {
      setTask(t);
      setActivities(t.activities ?? []);
      setEtapa(t.etapa);
      setPrioridad(t.prioridad);
      setAsignadaId(t.asignada?.id ?? '');
      setDescripcion(t.descripcion);
      setPaciente(t.paciente ?? '');
      setDueAt(t.dueAt ? toDateTimeLocal(t.dueAt) : '');
    }).finally(() => setLoading(false));
  }, [taskId, onGetTask]);

  const guardar = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await onActualizar(task.id, {
        etapa,
        prioridad,
        asignadaId: asignadaId || null,
        descripcion,
        paciente: paciente || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
      // Recargar historial
      const fresh = await onGetTask(task.id);
      setActivities(fresh.activities ?? []);
      setTask(updated);
    } finally {
      setSaving(false);
    }
  };

  const prio = task ? PRIO_STYLE[task.prioridad] : PRIO_STYLE.NORMAL;

  return (
    <Modal open={!!taskId} onClose={onClose} title={task?.tipo ?? 'Cargando…'} maxWidth={780}>
      {loading && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && task && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>

          {/* ── Columna izquierda: detalles + edición ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Badges de estado actuales */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                {task.tipo}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: prio.bg, color: prio.color }}>
                {PRIORIDAD_LABEL[task.prioridad]}
              </span>
              {task.dueAt && (
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 5, background: '#EBF3FB', color: '#3B78AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="calendar" size={11} /> {fmtDateTime(task.dueAt)}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="label">Descripción</label>
              <textarea
                className="input"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Paciente */}
            <div>
              <label className="label">Paciente</label>
              <input className="input" value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre del paciente (opcional)" />
            </div>

            {/* Etapa + Prioridad */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Etapa</label>
                <select className="select" value={etapa} onChange={(e) => setEtapa(e.target.value as Etapa)}>
                  {ETAPAS.map((e) => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Prioridad</label>
                <select className="select" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
                  <option value="BAJA">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
            </div>

            {/* Asignada a */}
            <div>
              <label className="label">Asignada a</label>
              <select className="select" value={asignadaId} onChange={(e) => setAsignadaId(e.target.value)}>
                <option value="">Sin asignar</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </div>

            {/* Fecha y hora */}
            <div>
              <label className="label">Fecha y hora programada</label>
              <input
                type="datetime-local"
                className="input"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
              {dueAt && (
                <button
                  onClick={() => setDueAt('')}
                  style={{ marginTop: 6, fontSize: 11, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  ✕ Quitar fecha
                </button>
              )}
            </div>

            {/* Creada por / fecha */}
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {task.creadoPor && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="user" size={11} /> Creada por <strong style={{ color: 'var(--text-2)' }}>{task.creadoPor.nombre}</strong>
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="clock" size={11} /> {fmtDateTime(task.createdAt)}
              </span>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
              <button className="btn btn-primary" onClick={guardar} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button
                className="btn btn-soft"
                onClick={() => { onEliminar(task.id); onClose(); }}
                style={{ color: 'var(--orange)' }}
              >
                <Icon name="trash" size={13} /> Eliminar
              </button>
            </div>
          </div>

          {/* ── Columna derecha: historial ── */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>
              Historial
            </div>
            {activities.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--muted-4)' }}>Sin actividad registrada</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activities.map((a, i) => (
                  <ActivityItem key={a.id} a={a} isLast={i === activities.length - 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function ActivityItem({ a, isLast }: { a: TaskActivity; isLast: boolean }) {
  const iconName = ACTIVITY_ICON[a.tipo] ?? 'info';
  const nombre = a.user?.nombre ?? '?';
  return (
    <div style={{ display: 'flex', gap: 10, position: 'relative', paddingBottom: isLast ? 0 : 16 }}>
      {/* Línea vertical */}
      {!isLast && (
        <div style={{ position: 'absolute', left: 12, top: 24, bottom: 0, width: 1, background: 'var(--border-soft)' }} />
      )}
      {/* Icono */}
      <div style={{
        width: 24, height: 24, borderRadius: 12, background: 'var(--primary-soft)',
        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
      }}>
        <Icon name={iconName} size={11} />
      </div>
      {/* Contenido */}
      <div style={{ flex: 1, paddingTop: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, background: colorFromString(nombre), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
            {nombre.charAt(0)}
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-2)' }}>{nombre}</span>
        </div>
        {a.detalle && <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{a.detalle}</p>}
        <span style={{ fontSize: 10, color: 'var(--muted-4)' }}>{fmtDateTime(a.createdAt)}</span>
      </div>
    </div>
  );
}
