import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { api } from '../../lib/api';
import type { Task, Etapa, Prioridad, TaskActivity, TaskChecklistItem } from '../../lib/types';
import type { UpdateTarea, AssignableUser } from './useTareas';
import { ETAPA_LABEL, ETAPAS } from './useTareas';
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

const ETAPA_STYLE: Record<string, { bg: string; color: string }> = {
  PENDIENTE:   { bg: '#F5F5F5', color: '#7A7066' },
  EN_PROCESO:  { bg: '#EBF3FB', color: '#3B78AF' },
  REVISION:    { bg: '#FFF8E1', color: '#B07C00' },
  COMPLETADA:  { bg: '#EDF5EF', color: '#4A7A5A' },
};

const ACTIVITY_ICON: Record<string, string> = {
  CREADA:    'plus',
  MOVIDA:    'act',
  REASIGNADA:'users',
  FECHA:     'calendar',
  EDITADA:   'pen',
};

type RightTab = 'checklist' | 'actividad';

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
  const [savingMeta, setSavingMeta] = useState(false);
  const [activeTab, setActiveTab] = useState<RightTab>('checklist');

  const [etapa, setEtapa]           = useState<Etapa>('PENDIENTE');
  const [prioridad, setPrioridad]   = useState<Prioridad>('NORMAL');
  const [asignadasIds, setAsignadasIds] = useState<string[]>([]);
  const [tags, setTags]             = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [paciente, setPaciente]     = useState('');
  const [dueDate, setDueDate]       = useState('');
  const [dueTime, setDueTime]       = useState('');
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
      const dt = t.dueAt ? toDateTimeLocal(t.dueAt) : '';
      setDueDate(dt ? dt.split('T')[0] : '');
      setDueTime(dt ? (dt.split('T')[1] ?? '') : '');
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
        dueAt: dueDate ? new Date(`${dueDate}T${dueTime || '00:00'}`).toISOString() : null,
      });
      const fresh = await onGetTask(task.id);
      setActivities(fresh.activities ?? []);
      setTask(updated);
    } finally {
      setSaving(false);
    }
  };

  const doneCount  = checklist.filter(i => i.done).length;
  const totalCount = checklist.length;
  const etapaStyle = ETAPA_STYLE[etapa] ?? ETAPA_STYLE.PENDIENTE;
  const prioStyle  = PRIO_STYLE[prioridad];

  // SVG chevron for styled selects
  const chevronBg = (color: string) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`;

  return (
    <Modal open={!!taskId} onClose={onClose} title={task?.tipo ?? 'Cargando…'} maxWidth={780}>
      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && task && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          margin: '-22px',
          borderRadius: '0 0 var(--radius-modal) var(--radius-modal)',
          overflow: 'hidden',
        }}>

          {/* ── LEFT PANEL — metadatos ── */}
          <div style={{
            borderRight: '1px solid var(--border)',
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
            maxHeight: '68vh',
          }}>

            {/* Etapa + prioridad */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={etapa}
                onChange={(e) => cambiarEtapa(e.target.value as Etapa)}
                disabled={savingMeta}
                style={{
                  background: etapaStyle.bg, color: etapaStyle.color,
                  border: 'none', borderRadius: 6, padding: '4px 22px 4px 9px',
                  fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  WebkitAppearance: 'none', appearance: 'none',
                  backgroundImage: chevronBg(etapaStyle.color),
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 7px center',
                }}
              >
                {ETAPAS.map(e => (
                  <option key={e} value={e}>{ETAPA_LABEL[e]}</option>
                ))}
              </select>
              <select
                value={prioridad}
                onChange={(e) => cambiarPrioridad(e.target.value as Prioridad)}
                disabled={savingMeta}
                style={{
                  background: prioStyle.bg, color: prioStyle.color,
                  border: 'none', borderRadius: 6, padding: '4px 22px 4px 9px',
                  fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  WebkitAppearance: 'none', appearance: 'none',
                  backgroundImage: chevronBg(prioStyle.color),
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 7px center',
                }}
              >
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
              </select>
              {savingMeta && <span style={{ fontSize: 10.5, color: 'var(--muted-3)' }}>Guardando…</span>}
            </div>

            {/* Metadata key-value */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
              <MetaRow label="Paciente">
                <input
                  className="input"
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="—"
                  style={{ fontSize: 12.5, padding: '4px 8px' }}
                />
              </MetaRow>

              <MetaRow label="Fecha">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="date"
                      className="input"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      style={{ flex: 1, fontSize: 12, padding: '4px 7px' }}
                    />
                    {dueDate && (
                      <button
                        onClick={() => { setDueDate(''); setDueTime(''); }}
                        title="Quitar fecha"
                        style={{ background: 'none', border: 'none', color: 'var(--muted-3)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '2px 4px', flexShrink: 0 }}
                      >✕</button>
                    )}
                  </div>
                  {dueDate && (
                    <input
                      type="time"
                      className="input"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                      style={{ fontSize: 12, padding: '4px 7px' }}
                    />
                  )}
                </div>
              </MetaRow>

              <MetaRow label="Asignada a">
                <UserMultiSelect users={users} selected={asignadasIds} onChange={setAsignadasIds} />
              </MetaRow>

              <MetaRow label="Etiquetas">
                <TagInput tags={tags} onChange={setTags} />
              </MetaRow>

              <MetaRow label="Creada por">
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{task.creadoPor?.nombre ?? '—'}</span>
              </MetaRow>

              <MetaRow label="Creación">
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{fmtDateTime(task.createdAt)}</span>
              </MetaRow>
            </div>

            {/* Stats */}
            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', gap: 0 }}>
              <StatBlock label="Checklist" value={`${doneCount}/${totalCount}`} />
              <div style={{ width: 1, background: 'var(--border-soft)', margin: '0 16px' }} />
              <StatBlock label="Actividad" value={String(activities.length)} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button className="btn btn-soft" onClick={() => { onEliminar(task.id); onClose(); }} style={{ color: 'var(--orange)', padding: '7px 11px' }} title="Eliminar tarea">
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>

          {/* ── RIGHT PANEL — descripción + tabs ── */}
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '68vh' }}>

            {/* Descripción */}
            <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
              <textarea
                className="input"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción de la tarea..."
                style={{ resize: 'none', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              padding: '0 20px',
              flexShrink: 0,
              marginTop: 8,
            }}>
              {(['checklist', 'actividad'] as RightTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none', border: 'none',
                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--muted)',
                    padding: '11px 16px', fontSize: 13,
                    fontWeight: activeTab === tab ? 600 : 400,
                    cursor: 'pointer', marginBottom: -1,
                    transition: 'color .15s',
                  }}
                >
                  {tab === 'checklist' ? 'Checklist' : 'Actividad'}
                  {tab === 'checklist' && totalCount > 0 && (
                    <span style={{
                      marginLeft: 6, fontSize: 11, fontWeight: 600,
                      background: activeTab === 'checklist' ? 'var(--primary-soft)' : 'var(--border-soft)',
                      color: activeTab === 'checklist' ? 'var(--primary)' : 'var(--muted-3)',
                      padding: '1px 5px', borderRadius: 10,
                    }}>
                      {doneCount}/{totalCount}
                    </span>
                  )}
                  {tab === 'actividad' && activities.length > 0 && (
                    <span style={{
                      marginLeft: 6, fontSize: 11, fontWeight: 600,
                      background: activeTab === 'actividad' ? 'var(--primary-soft)' : 'var(--border-soft)',
                      color: activeTab === 'actividad' ? 'var(--primary)' : 'var(--muted-3)',
                      padding: '1px 5px', borderRadius: 10,
                    }}>
                      {activities.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

              {/* ── CHECKLIST TAB ── */}
              {activeTab === 'checklist' && (
                <div>
                  {totalCount > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ width: '100%', height: 5, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', background: 'var(--primary)', borderRadius: 99,
                          width: `${totalCount ? Math.round(doneCount / totalCount * 100) : 0}%`,
                          transition: 'width .3s',
                        }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 14 }}>
                    {checklist.map((item, idx) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 8px',
                          borderBottom: idx < checklist.length - 1 ? '1px solid var(--border-soft)' : 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={async () => {
                            const updated = await api.patch<{ item: TaskChecklistItem }>(`/tasks/${task!.id}/checklist/${item.id}`, { done: !item.done });
                            setChecklist(c => c.map(i => i.id === item.id ? updated.item : i));
                          }}
                          style={{ width: 15, height: 15, accentColor: 'var(--primary)', flexShrink: 0, cursor: 'pointer' }}
                        />
                        <span style={{
                          flex: 1, fontSize: 13.5,
                          color: item.done ? 'var(--muted-3)' : 'var(--text)',
                          textDecoration: item.done ? 'line-through' : 'none',
                        }}>
                          {item.contenido}
                        </span>
                        <button
                          onClick={async () => {
                            await api.del(`/tasks/${task!.id}/checklist/${item.id}`);
                            setChecklist(c => c.filter(i => i.id !== item.id));
                          }}
                          style={{
                            background: 'none', border: 'none', color: 'var(--muted-4)',
                            cursor: 'pointer', padding: '2px 4px', fontSize: 13, opacity: 0,
                            transition: 'opacity .15s',
                          }}
                          className="checklist-del"
                        >✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Agregar paso */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      ref={checkInputRef}
                      className="input"
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      placeholder="+ Agregar paso..."
                      style={{ flex: 1, fontSize: 13 }}
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
                      style={{ padding: '7px 12px' }}
                      onClick={async () => {
                        if (!newItem.trim()) return;
                        const { item } = await api.post<{ item: TaskChecklistItem }>(`/tasks/${task!.id}/checklist`, { contenido: newItem.trim() });
                        setChecklist(c => [...c, item]);
                        setNewItem('');
                        checkInputRef.current?.focus();
                      }}
                    >
                      <Icon name="plus" size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── ACTIVIDAD TAB ── */}
              {activeTab === 'actividad' && (
                <div>
                  {activities.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--muted-4)', textAlign: 'center', paddingTop: 32 }}>
                      Sin actividad registrada
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {activities.map((a, i) => (
                        <ActivityItem key={a.id} a={a} isLast={i === activities.length - 1} />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}


function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, alignItems: 'start' }}>
      <span style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 5, fontWeight: 500 }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function ActivityItem({ a, isLast }: { a: TaskActivity; isLast: boolean }) {
  const iconName = ACTIVITY_ICON[a.tipo] ?? 'info';
  const nombre = a.user?.nombre ?? '?';
  return (
    <div style={{ display: 'flex', gap: 10, position: 'relative', paddingBottom: isLast ? 0 : 14 }}>
      {!isLast && (
        <div style={{ position: 'absolute', left: 12, top: 24, bottom: 0, width: 1, background: 'var(--border-soft)' }} />
      )}
      <div style={{
        width: 24, height: 24, borderRadius: 12, background: 'var(--primary-soft)',
        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 1,
      }}>
        <Icon name={iconName} size={11} />
      </div>
      <div style={{ flex: 1, paddingTop: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{
            width: 16, height: 16, borderRadius: 8, background: colorFromString(nombre),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#fff',
          }}>
            {nombre.charAt(0)}
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-2)' }}>{nombre}</span>
        </div>
        {a.detalle && <p style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 2 }}>{a.detalle}</p>}
        <span style={{ fontSize: 10.5, color: 'var(--muted-4)' }}>{fmtDateTime(a.createdAt)}</span>
      </div>
    </div>
  );
}
