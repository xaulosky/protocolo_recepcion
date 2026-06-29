import { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import type { Task, Etapa, Prioridad, TaskActivity, TaskChecklistItem } from '../../lib/types';
import type { UpdateTarea, AssignableUser } from './useTareas';
import { ETAPA_LABEL, ETAPAS, PRIORIDAD_LABEL } from './useTareas';
import { Modal } from '../../components/Modal';
import { Icon } from '../../lib/icons';
import { colorFromString, fmtDateTime, toDateTimeLocal } from '../../lib/format';
import { UserMultiSelect } from '../../components/UserMultiSelect';
import { TagInput } from '../../components/TagInput';

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
  const [saving, setSaving]       = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  const [etapa, setEtapa]           = useState<Etapa>('PENDIENTE');
  const [prioridad, setPrioridad]   = useState<Prioridad>('NORMAL');
  const [asignadasIds, setAsignadasIds] = useState<string[]>([]);
  const [tags, setTags]             = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [paciente, setPaciente]     = useState('');
  const [dueAt, setDueAt]           = useState('');
  const [checklist, setChecklist]   = useState<TaskChecklistItem[]>([]);
  const [newItem, setNewItem]       = useState('');
  const checkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!taskId) { setTask(null); return; }
    setLoading(true);
    onGetTask(taskId).then((t) => {
      setTask(t);
      setActivities(t.activities ?? []);
      setEtapa(t.etapa);
      setPrioridad(t.prioridad);
      setAsignadasIds(t.asignadas.map((u) => u.id));
      setTags(t.tags ?? []);
      setDescripcion(t.descripcion);
      setPaciente(t.paciente ?? '');
      setDueAt(t.dueAt ? toDateTimeLocal(t.dueAt) : '');
      setChecklist(t.checklist ?? []);
    }).finally(() => setLoading(false));
  }, [taskId, onGetTask]);

  const cambiarEtapa = async (nueva: Etapa) => {
    if (!task || nueva === etapa || savingMeta) return;
    setSavingMeta(true);
    try {
      const updated = await onActualizar(task.id, { etapa: nueva });
      setEtapa(nueva);
      setTask(updated);
      const fresh = await onGetTask(task.id);
      setActivities(fresh.activities ?? []);
    } finally {
      setSavingMeta(false);
    }
  };

  const cambiarPrioridad = async (nueva: Prioridad) => {
    if (!task || nueva === prioridad || savingMeta) return;
    setSavingMeta(true);
    try {
      const updated = await onActualizar(task.id, { prioridad: nueva });
      setPrioridad(nueva);
      setTask(updated);
    } finally {
      setSavingMeta(false);
    }
  };

  const guardar = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await onActualizar(task.id, {
        etapa,
        prioridad,
        asignadasIds,
        tags,
        descripcion,
        paciente: paciente || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
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

          {/* ── Columna izquierda ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

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

            <div>
              <label className="label">Paciente</label>
              <input className="input" value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre del paciente (opcional)" />
            </div>

            {/* ── Stepper de etapa (auto-guarda al hacer clic) ── */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Etapa
                {savingMeta && <span style={{ fontSize: 10, color: 'var(--muted-3)', fontWeight: 400 }}>Guardando…</span>}
              </label>
              <div style={{ display: 'flex', borderRadius: 7, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                {ETAPAS.map((e, i) => {
                  const active = etapa === e;
                  const past   = ETAPAS.indexOf(etapa) > i;
                  return (
                    <button
                      key={e}
                      onClick={() => cambiarEtapa(e)}
                      disabled={savingMeta || active}
                      title={ETAPA_LABEL[e]}
                      style={{
                        flex: 1, padding: '8px 4px', border: 'none',
                        borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                        background: active ? 'var(--primary)' : past ? 'var(--primary-soft)' : '#fff',
                        color: active ? '#fff' : past ? 'var(--primary)' : 'var(--muted)',
                        fontSize: 11, fontWeight: active ? 700 : 500,
                        cursor: active || savingMeta ? 'default' : 'pointer',
                        transition: 'background .15s, color .15s',
                        opacity: savingMeta && !active ? 0.6 : 1,
                      }}
                    >
                      {ETAPA_LABEL[e]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Prioridad (auto-guarda al cambiar) ── */}
            <div>
              <label className="label">Prioridad</label>
              <select className="select" value={prioridad} onChange={(e) => cambiarPrioridad(e.target.value as Prioridad)} style={{ width: 150 }}>
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div>
              <label className="label">Asignada a</label>
              <UserMultiSelect users={users} selected={asignadasIds} onChange={setAsignadasIds} />
            </div>

            <div>
              <label className="label">Etiquetas</label>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            {/* ── Checklist ── */}
            <div>
              <label className="label">
                Checklist
                {checklist.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-2)', fontWeight: 400 }}>
                    {checklist.filter(i => i.done).length}/{checklist.length}
                  </span>
                )}
              </label>
              {checklist.length > 0 && (
                <div style={{ width: '100%', height: 4, background: 'var(--border-soft)', borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 99, width: `${checklist.length ? Math.round(checklist.filter(i => i.done).length / checklist.length * 100) : 0}%`, transition: 'width .3s' }} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                {checklist.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={async () => {
                        const updated = await api.patch<{ item: TaskChecklistItem }>(`/tasks/${task!.id}/checklist/${item.id}`, { done: !item.done });
                        setChecklist(c => c.map(i => i.id === item.id ? updated.item : i));
                      }}
                      style={{ width: 14, height: 14, accentColor: 'var(--primary)', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ flex: 1, fontSize: 13, color: item.done ? 'var(--muted-3)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.contenido}</span>
                    <button
                      onClick={async () => {
                        await api.del(`/tasks/${task!.id}/checklist/${item.id}`);
                        setChecklist(c => c.filter(i => i.id !== item.id));
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--muted-3)', cursor: 'pointer', padding: '2px 4px', fontSize: 12 }}
                    >✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  ref={checkInputRef}
                  className="input"
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  placeholder="Agregar paso..."
                  style={{ flex: 1, fontSize: 12.5 }}
                  onKeyDown={async e => {
                    if (e.key === 'Enter' && newItem.trim()) {
                      const { item } = await api.post<{ item: TaskChecklistItem }>(`/tasks/${task!.id}/checklist`, { contenido: newItem.trim() });
                      setChecklist(c => [...c, item]);
                      setNewItem('');
                    }
                  }}
                />
                <button
                  className="btn btn-soft"
                  style={{ padding: '7px 12px', fontSize: 12 }}
                  onClick={async () => {
                    if (!newItem.trim()) return;
                    const { item } = await api.post<{ item: TaskChecklistItem }>(`/tasks/${task!.id}/checklist`, { contenido: newItem.trim() });
                    setChecklist(c => [...c, item]);
                    setNewItem('');
                    checkInputRef.current?.focus();
                  }}
                >
                  <Icon name="plus" size={12} />
                </button>
              </div>
            </div>

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
      {!isLast && (
        <div style={{ position: 'absolute', left: 12, top: 24, bottom: 0, width: 1, background: 'var(--border-soft)' }} />
      )}
      <div style={{
        width: 24, height: 24, borderRadius: 12, background: 'var(--primary-soft)',
        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
      }}>
        <Icon name={iconName} size={11} />
      </div>
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
