import { useRef, useState } from 'react';
import { useTareas, ETAPAS, ETAPA_LABEL, PRIORIDAD_LABEL, NEXT } from './useTareas';
import type { Task, Etapa } from '../../lib/types';
import { Icon } from '../../lib/icons';
import { AsyncState } from '../../components/AsyncState';
import { useApp } from '../../store/app-context';
import { useAuth } from '../../store/auth-context';
import { colorFromString } from '../../lib/format';
import { PRIO_STYLE, ETAPA_STYLE } from './tareasStyles';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { TareasCalendario } from './TareasCalendario';

type ViewMode = 'kanban' | 'tabla' | 'calendario';

export function Tareas() {
  const { toast } = useApp();
  const { hasRole } = useAuth();
  const { tasks, users, loading, error, reload, crear, mover, actualizar, getTask, eliminar } = useTareas();

  const [viewMode, setViewMode]     = useState<ViewMode>('kanban');
  const [filter, setFilter]         = useState('Todas');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDueAt, setCreateDueAt] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isAdmin = hasRole('ADMIN');
  const canEdit = !hasRole('LECTURA');

  const filtered = isAdmin && filter !== 'Todas'
    ? tasks.filter((t) => t.asignadas.some((u) => u.id === filter))
    : tasks;

  const handleCrear = async (data: Parameters<typeof crear>[0]) => {
    await crear(data);
    toast('Tarea creada');
  };

  const openCreate = (dueAt = '') => { setCreateDueAt(dueAt); setCreateOpen(true); };

  const handleEliminar = async (id: string) => {
    try { await eliminar(id); toast('Tarea eliminada'); } catch { toast('No se pudo eliminar'); }
  };

  const VIEWS: { mode: ViewMode; icon: string; label: string }[] = [
    { mode: 'kanban',     icon: 'grid',     label: 'Kanban'     },
    { mode: 'tabla',      icon: 'tasks',    label: 'Lista'      },
    { mode: 'calendario', icon: 'calendar', label: 'Calendario' },
  ];

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

            {/* Toggle de vistas */}
            <div style={{ display: 'flex', background: 'var(--border-softer)', borderRadius: 8, padding: 2, gap: 2 }}>
              {VIEWS.map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 11px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    background: viewMode === mode ? '#fff' : 'transparent',
                    color: viewMode === mode ? 'var(--text)' : 'var(--muted)',
                    boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all .15s',
                  }}
                >
                  <Icon name={icon} size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Filtro por usuario (solo admin) */}
            {isAdmin && (
              <div className="chips-row" style={{ marginBottom: 0 }}>
                <button className={`chip${filter === 'Todas' ? ' active' : ''}`} onClick={() => setFilter('Todas')}>Todas</button>
                {users.map((u) => (
                  <button key={u.id} className={`chip${filter === u.id ? ' active' : ''}`} onClick={() => setFilter(u.id)}>
                    {u.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {canEdit && (
            <button className="btn btn-primary" onClick={() => openCreate()}>
              <Icon name="plus" size={12} strokeWidth={2.5} /> Nueva tarea
            </button>
          )}
        </div>

        {/* ── Vistas ── */}
        {viewMode === 'kanban' && (
          <KanbanView tasks={filtered} onMover={mover} onEliminar={handleEliminar} onClickTask={setSelectedId} />
        )}
        {viewMode === 'tabla' && (
          <TablaView tasks={filtered} onMover={mover} onEliminar={handleEliminar} onClickTask={setSelectedId} />
        )}
        {viewMode === 'calendario' && (
          <TareasCalendario
            tasks={filtered}
            onClickTask={setSelectedId}
            onClickDay={openCreate}
          />
        )}

        {/* ── Modal crear tarea ── */}
        <TaskCreateModal
          open={createOpen}
          initialDueAt={createDueAt}
          users={users}
          onClose={() => setCreateOpen(false)}
          onGuardar={handleCrear}
        />

        {/* ── Modal de detalle ── */}
        <TaskDetailModal
          taskId={selectedId}
          users={users}
          onClose={() => setSelectedId(null)}
          onGetTask={getTask}
          onActualizar={actualizar}
          onEliminar={handleEliminar}
        />
      </div>
    </AsyncState>
  );
}

/* ═══════════════════════════════════════
   Vista Kanban con Drag & Drop
═══════════════════════════════════════ */

function KanbanView({ tasks, onMover, onEliminar, onClickTask }: {
  tasks: Task[];
  onMover: (id: string, etapa: Etapa) => void;
  onEliminar: (id: string) => void;
  onClickTask: (id: string) => void;
}) {
  const [dragId, setDragId]     = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Etapa | null>(null);
  const enterCount = useRef<Partial<Record<Etapa, number>>>({});

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragEnd   = () => { setDragId(null); setDragOver(null); enterCount.current = {}; };

  const handleDragEnter = (etapa: Etapa) => {
    enterCount.current[etapa] = (enterCount.current[etapa] ?? 0) + 1;
    setDragOver(etapa);
  };
  const handleDragLeave = (etapa: Etapa) => {
    const count = (enterCount.current[etapa] ?? 1) - 1;
    enterCount.current[etapa] = count;
    if (count <= 0) setDragOver(null);
  };
  const handleDrop = (etapa: Etapa) => {
    if (dragId) {
      const task = tasks.find((t) => t.id === dragId);
      if (task && task.etapa !== etapa) onMover(dragId, etapa);
    }
    setDragId(null); setDragOver(null); enterCount.current = {};
  };

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
      {ETAPAS.map((etapa) => {
        const cards   = tasks.filter((t) => t.etapa === etapa);
        const isOver  = dragOver === etapa;
        const sameCol = tasks.find((t) => t.id === dragId)?.etapa === etapa;
        return (
          <div
            key={etapa}
            onDragEnter={() => handleDragEnter(etapa)}
            onDragLeave={() => handleDragLeave(etapa)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(etapa)}
            style={{
              minWidth: 225, flexShrink: 0, borderRadius: 10,
              border: isOver && !sameCol ? '2px dashed var(--primary)' : '2px solid transparent',
              background: isOver && !sameCol ? 'var(--primary-soft)' : 'transparent',
              padding: isOver && !sameCol ? 6 : 0,
              transition: 'background .15s, border .15s, padding .15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, padding: '0 2px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ETAPA_LABEL[etapa]}</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--border-soft)', color: 'var(--muted)', padding: '2px 7px', borderRadius: 10 }}>{cards.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60 }}>
              {cards.map((t) => (
                <KanbanCard
                  key={t.id}
                  t={t}
                  isDragging={dragId === t.id}
                  onDragStart={() => handleDragStart(t.id)}
                  onDragEnd={handleDragEnd}
                  onMover={() => onMover(t.id, NEXT[t.etapa])}
                  onEliminar={() => onEliminar(t.id)}
                  onClick={() => onClickTask(t.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AvatarStack({ users }: { users: { id: string; nombre: string }[] }) {
  if (users.length === 0) return <span style={{ fontSize: 11, color: 'var(--muted-4)' }}>Sin asignar</span>;
  const visible = users.slice(0, 4);
  const extra   = users.length - visible.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex' }}>
        {visible.map((u, i) => (
          <div
            key={u.id}
            title={u.nombre}
            style={{
              width: 22, height: 22, borderRadius: 11, border: '2px solid #fff',
              background: colorFromString(u.nombre),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
              marginLeft: i > 0 ? -6 : 0,
            }}
          >
            {u.nombre.charAt(0)}
          </div>
        ))}
        {extra > 0 && (
          <div style={{
            width: 22, height: 22, borderRadius: 11, border: '2px solid #fff',
            background: 'var(--muted-3)', marginLeft: -6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            +{extra}
          </div>
        )}
      </div>
      {users.length === 1 && (
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{users[0].nombre}</span>
      )}
    </div>
  );
}

function KanbanCard({ t, isDragging, onDragStart, onDragEnd, onMover, onEliminar, onClick }: {
  t: Task; isDragging: boolean;
  onDragStart: () => void; onDragEnd: () => void;
  onMover: () => void; onEliminar: () => void; onClick: () => void;
}) {
  const prio = PRIO_STYLE[t.prioridad];
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid var(--border)', borderRadius: 9, padding: 13,
        cursor: 'grab', opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? 'rotate(1.5deg)' : 'none',
        transition: 'opacity .15s, transform .15s, box-shadow .15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 7 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--primary-soft)', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{t.tipo}</span>
        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: prio.bg, color: prio.color }}>{PRIORIDAD_LABEL[t.prioridad]}</span>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.45, marginBottom: 8 }}>{t.descripcion}</p>
      {t.paciente && (
        <div style={{ fontSize: 11, color: 'var(--muted-2)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="user" size={11} /> {t.paciente}
        </div>
      )}
      {t.dueAt && (
        <div style={{ fontSize: 10.5, color: '#3B78AF', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="calendar" size={10} />
          {new Date(t.dueAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
          {' '}
          {new Date(t.dueAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-softer)', paddingTop: 8 }}>
        <AvatarStack users={t.asignadas} />
        <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          {t.etapa !== 'CERRADO' && (
            <button onClick={onMover} title="Avanzar etapa" style={{ fontSize: 11.5, padding: '3px 8px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 4, border: 'none', fontWeight: 600 }}>→</button>
          )}
          <button onClick={onEliminar} title="Eliminar" style={{ fontSize: 11, padding: '3px 7px', background: 'var(--danger-soft)', color: 'var(--orange)', borderRadius: 4, border: 'none' }}>✕</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Vista Tabla / Lista
═══════════════════════════════════════ */

const TH: React.CSSProperties = {
  padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--muted)', whiteSpace: 'nowrap', letterSpacing: '0.3px',
  borderBottom: '1px solid var(--border)',
};

function TablaView({ tasks, onMover, onEliminar, onClickTask }: {
  tasks: Task[];
  onMover: (id: string, etapa: Etapa) => void;
  onEliminar: (id: string) => void;
  onClickTask: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
        <Icon name="tasks" size={36} style={{ opacity: 0.3 }} />
        <p style={{ marginTop: 12, fontSize: 14 }}>No hay tareas</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'var(--border-softer)' }}>
          <tr>
            <th style={TH}>Tipo</th>
            <th style={TH}>Descripción</th>
            <th style={TH}>Paciente</th>
            <th style={TH}>Fecha</th>
            <th style={TH}>Etapa</th>
            <th style={TH}>Prioridad</th>
            <th style={TH}>Asignada a</th>
            <th style={TH}>Creada por</th>
            <th style={{ ...TH, textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => {
            const prio      = PRIO_STYLE[t.prioridad];
            const estilo    = ETAPA_STYLE[t.etapa];
            const creadoPor = t.creadoPor?.nombre ?? '—';
            return (
              <tr
                key={t.id}
                onClick={() => onClickTask(t.id)}
                style={{ borderBottom: '1px solid var(--border-soft)', background: i % 2 === 0 ? '#fff' : 'var(--bg)', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-soft)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : 'var(--bg)'; }}
              >
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'var(--primary-soft)', color: 'var(--primary)' }}>{t.tipo}</span>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text)', maxWidth: 240 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descripcion}</div>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {t.paciente ?? <span style={{ color: 'var(--muted-4)' }}>—</span>}
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: 12, color: t.dueAt ? '#3B78AF' : 'var(--muted-4)' }}>
                  {t.dueAt
                    ? new Date(t.dueAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
                    : '—'}
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: estilo.bg, color: estilo.color }}>{ETAPA_LABEL[t.etapa]}</span>
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: prio.bg, color: prio.color }}>{PRIORIDAD_LABEL[t.prioridad]}</span>
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <AvatarStack users={t.asignadas} />
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{creadoPor}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    {t.etapa !== 'CERRADO' && (
                      <button onClick={() => onMover(t.id, NEXT[t.etapa])} title="Avanzar etapa" style={{ fontSize: 11, padding: '3px 9px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 4, border: 'none', fontWeight: 600 }}>→</button>
                    )}
                    <button onClick={() => onEliminar(t.id)} title="Eliminar" style={{ fontSize: 11, padding: '3px 7px', background: 'var(--danger-soft)', color: 'var(--orange)', borderRadius: 4, border: 'none' }}>✕</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
