import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useTareas, ETAPAS, ETAPA_LABEL, PRIORIDAD_LABEL, NEXT } from './useTareas';
import type { Task, Etapa } from '../../lib/types';
import { Icon } from '../../lib/icons';
import { AsyncState } from '../../components/AsyncState';
import { Pagination } from '../../components/Pagination';
import { useApp } from '../../store/app-context';
import { useAuth } from '../../store/auth-context';
import { colorFromString } from '../../lib/format';
import { PRIO_STYLE, ETAPA_STYLE } from './tareasStyles';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { TareasCalendario } from './TareasCalendario';

const TABLE_PAGE_SIZE = 20;

type ViewMode = 'kanban' | 'tabla' | 'calendario';

export function Tareas() {
  const { toast } = useApp();
  const { hasRole } = useAuth();
  const { tasks, users, loading, error, reload, crear, mover, actualizar, getTask, eliminar } = useTareas();

  const [viewMode, setViewMode]       = useState<ViewMode>('kanban');
  const [filter, setFilter]           = useState('Todas');
  const [quickFilter, setQuickFilter] = useState<'vencidas' | null>(null);
  const [busqueda, setBusqueda]       = useState('');
  const [createOpen, setCreateOpen]   = useState(false);
  const [createDueAt, setCreateDueAt] = useState('');
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [bulkSel, setBulkSel]         = useState<Set<string>>(new Set());
  const [tablePage, setTablePage]     = useState(1);

  const isAdmin = hasRole('ADMIN');
  const canEdit = !hasRole('LECTURA');

  const filtered = useMemo(() => {
    let base = isAdmin && filter !== 'Todas'
      ? tasks.filter((t) => t.asignadas.some((u) => u.id === filter))
      : tasks;
    if (quickFilter === 'vencidas') {
      base = base.filter(t => !!t.dueAt && new Date(t.dueAt) < new Date() && t.etapa !== 'CERRADO');
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      base = base.filter((t) =>
        t.descripcion.toLowerCase().includes(q) ||
        (t.paciente ?? '').toLowerCase().includes(q) ||
        t.tipo.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return base;
  }, [tasks, isAdmin, filter, quickFilter, busqueda]);

  useEffect(() => { setTablePage(1); }, [filtered]);
  const totalTablePages = Math.ceil(filtered.length / TABLE_PAGE_SIZE);
  const pagedFiltered = filtered.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);

  const toggleBulk = useCallback((id: string) => {
    setBulkSel(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setBulkSel(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(t => t.id)));
  }, [filtered]);

  const bulkMover = useCallback(async (etapa: Etapa) => {
    await Promise.allSettled([...bulkSel].map(id => mover(id, etapa)));
    setBulkSel(new Set());
    toast(`${bulkSel.size} tarea${bulkSel.size !== 1 ? 's' : ''} movidas a ${ETAPA_LABEL[etapa]}`);
  }, [bulkSel, mover, toast]);

  const bulkEliminar = useCallback(async () => {
    if (!confirm(`¿Eliminar ${bulkSel.size} tarea${bulkSel.size !== 1 ? 's' : ''}?`)) return;
    await Promise.allSettled([...bulkSel].map(id => eliminar(id)));
    setBulkSel(new Set());
    toast('Tareas eliminadas');
  }, [bulkSel, eliminar, toast]);

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
                    background: viewMode === mode ? 'var(--surface)' : 'transparent',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="input"
              style={{ width: 200, fontSize: 12.5 }}
              placeholder="Buscar tarea..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {(() => {
              const vencidas = tasks.filter(t => !!t.dueAt && new Date(t.dueAt) < new Date() && t.etapa !== 'CERRADO').length;
              return vencidas > 0 ? (
                <button
                  onClick={() => setQuickFilter(prev => prev === 'vencidas' ? null : 'vencidas')}
                  title={quickFilter === 'vencidas' ? 'Quitar filtro' : 'Filtrar solo vencidas'}
                  style={{
                    fontSize: 11.5, fontWeight: 700, border: 'none', cursor: 'pointer',
                    background: quickFilter === 'vencidas' ? '#C04040' : '#FBF0F0',
                    color: quickFilter === 'vencidas' ? '#fff' : '#C04040',
                    padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                    transition: 'background .15s, color .15s',
                  }}
                >
                  {vencidas} vencida{vencidas !== 1 ? 's' : ''}
                  {quickFilter === 'vencidas' && ' ✕'}
                </button>
              ) : null;
            })()}
            {canEdit && (
              <button className="btn btn-primary" onClick={() => openCreate()}>
                <Icon name="plus" size={12} strokeWidth={2.5} /> Nueva tarea
              </button>
            )}
          </div>
        </div>

        {/* ── Bulk action bar ── */}
        {bulkSel.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 10, background: 'var(--primary-soft)', borderRadius: 8, border: '1px solid var(--primary)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginRight: 4 }}>{bulkSel.size} seleccionada{bulkSel.size !== 1 ? 's' : ''}</span>
            {ETAPAS.map(e => (
              <button key={e} className="btn btn-soft" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => bulkMover(e)}>{ETAPA_LABEL[e]}</button>
            ))}
            <button className="btn" style={{ fontSize: 11.5, padding: '5px 10px', background: 'var(--danger-soft)', color: 'var(--orange)', border: 'none' }} onClick={bulkEliminar}>Eliminar</button>
            <button className="btn btn-soft" style={{ fontSize: 11.5, padding: '5px 10px', marginLeft: 'auto' }} onClick={() => setBulkSel(new Set())}>Cancelar</button>
          </div>
        )}

        {/* ── Vistas ── */}
        {viewMode === 'kanban' && (
          <KanbanView tasks={filtered} onMover={mover} onEliminar={handleEliminar} onClickTask={setSelectedId} bulkSel={bulkSel} onToggleBulk={toggleBulk} />
        )}
        {viewMode === 'tabla' && (
          <>
            <TablaView tasks={pagedFiltered} onMover={mover} onEliminar={handleEliminar} onClickTask={setSelectedId} bulkSel={bulkSel} onToggleBulk={toggleBulk} onSelectAll={selectAll} />
            <Pagination page={tablePage} totalPages={totalTablePages} onChange={setTablePage} />
          </>
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

function KanbanView({ tasks, onMover, onEliminar, onClickTask, bulkSel, onToggleBulk }: {
  tasks: Task[];
  onMover: (id: string, etapa: Etapa) => void;
  onEliminar: (id: string) => void;
  onClickTask: (id: string) => void;
  bulkSel: Set<string>;
  onToggleBulk: (id: string) => void;
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
                  isSelected={bulkSel.has(t.id)}
                  onDragStart={() => handleDragStart(t.id)}
                  onDragEnd={handleDragEnd}
                  onMover={() => onMover(t.id, NEXT[t.etapa])}
                  onEliminar={() => onEliminar(t.id)}
                  onClick={() => onClickTask(t.id)}
                  onToggleBulk={() => onToggleBulk(t.id)}
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

function KanbanCard({ t, isDragging, isSelected, onDragStart, onDragEnd, onMover, onEliminar, onClick, onToggleBulk }: {
  t: Task; isDragging: boolean; isSelected: boolean;
  onDragStart: () => void; onDragEnd: () => void;
  onMover: () => void; onEliminar: () => void; onClick: () => void; onToggleBulk: () => void;
}) {
  const prio = PRIO_STYLE[t.prioridad];
  const isOverdue = !!t.dueAt && new Date(t.dueAt) < new Date() && t.etapa !== 'CERRADO';
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        background: isSelected ? 'var(--primary-soft)' : 'var(--surface)',
        border: isSelected ? '1.5px solid var(--primary)' : isOverdue ? '1.5px solid #C04040' : '1px solid var(--border)',
        borderRadius: 9, padding: 13,
        cursor: 'grab', opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? 'rotate(1.5deg)' : 'none',
        transition: 'opacity .15s, transform .15s, box-shadow .15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 7 }}>
        <input type="checkbox" checked={isSelected} onChange={onToggleBulk} onClick={e => e.stopPropagation()} style={{ width: 13, height: 13, flexShrink: 0, accentColor: 'var(--primary)', cursor: 'pointer' }} />
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
        <div style={{ fontSize: 10.5, color: isOverdue ? '#C04040' : '#3B78AF', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="calendar" size={10} />
          {new Date(t.dueAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
          {' '}
          {new Date(t.dueAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      {t.tags && t.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {t.tags.slice(0, 3).map((tag) => (
            <span key={tag} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 500 }}>
              {tag}
            </span>
          ))}
          {t.tags.length > 3 && <span style={{ fontSize: 10, color: 'var(--muted-2)' }}>+{t.tags.length - 3}</span>}
        </div>
      )}
      {t.checklist && t.checklist.length > 0 && (() => {
        const done  = t.checklist.filter(i => i.done).length;
        const total = t.checklist.length;
        const pct   = Math.round(done / total * 100);
        const all   = done === total;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 3, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: all ? '#4A7A5A' : 'var(--primary)', borderRadius: 99, width: `${pct}%`, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 10, color: all ? '#4A7A5A' : 'var(--muted-2)', fontWeight: all ? 700 : 400, whiteSpace: 'nowrap' }}>
              {done}/{total}
            </span>
          </div>
        );
      })()}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-softer)', paddingTop: 8 }}>
        <AvatarStack users={t.asignadas} />
        <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          {t.etapa !== 'CERRADO' && (
            <button onClick={onMover} title={`Mover a ${ETAPA_LABEL[NEXT[t.etapa]]}`} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 4, border: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>→ {ETAPA_LABEL[NEXT[t.etapa]]}</button>
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

function TablaView({ tasks, onMover, onEliminar, onClickTask, bulkSel, onToggleBulk, onSelectAll }: {
  tasks: Task[];
  onMover: (id: string, etapa: Etapa) => void;
  onEliminar: (id: string) => void;
  onClickTask: (id: string) => void;
  bulkSel: Set<string>;
  onToggleBulk: (id: string) => void;
  onSelectAll: () => void;
}) {
  const [sortField, setSortField] = useState<'fecha' | 'prioridad' | 'creacion'>('creacion');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (sortField === 'fecha') {
        const da = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
        const db = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
        return sortDir === 'asc' ? da - db : db - da;
      }
      if (sortField === 'prioridad') {
        const order: Record<string, number> = { URGENTE: 0, NORMAL: 1, BAJA: 2 };
        const pa = order[a.prioridad] ?? 1;
        const pb = order[b.prioridad] ?? 1;
        return sortDir === 'asc' ? pa - pb : pb - pa;
      }
      return sortDir === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, sortField, sortDir]);

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
        <Icon name="tasks" size={36} style={{ opacity: 0.3 }} />
        <p style={{ marginTop: 12, fontSize: 14 }}>No hay tareas</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Ordenar por:</span>
        {(['creacion', 'fecha', 'prioridad'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('asc'); } }}
            style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${sortField === f ? 'var(--primary)' : 'var(--border)'}`, background: sortField === f ? 'var(--primary-soft)' : 'transparent', color: sortField === f ? 'var(--primary)' : 'var(--muted)', fontSize: 11.5, fontWeight: 500, cursor: 'pointer' }}
          >
            {f === 'creacion' ? 'Fecha creación' : f === 'fecha' ? 'Fecha límite' : 'Prioridad'}
            {sortField === f ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'var(--border-softer)' }}>
          <tr>
            <th style={{ ...TH, width: 36, paddingRight: 0 }}>
              <input type="checkbox" checked={bulkSel.size === tasks.length && tasks.length > 0} onChange={onSelectAll} style={{ width: 13, height: 13, accentColor: 'var(--primary)', cursor: 'pointer' }} />
            </th>
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
          {sorted.map((t, i) => {
            const prio      = PRIO_STYLE[t.prioridad];
            const estilo    = ETAPA_STYLE[t.etapa];
            const creadoPor = t.creadoPor?.nombre ?? '—';
            const rowOverdue = !!t.dueAt && new Date(t.dueAt) < new Date() && t.etapa !== 'CERRADO';
            return (
              <tr
                key={t.id}
                onClick={() => onClickTask(t.id)}
                style={{ borderBottom: '1px solid var(--border-soft)', background: bulkSel.has(t.id) ? 'var(--primary-soft)' : rowOverdue ? 'var(--danger-soft)' : (i % 2 === 0 ? 'var(--surface-soft)' : 'var(--bg)'), cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-soft)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = bulkSel.has(t.id) ? 'var(--primary-soft)' : rowOverdue ? 'var(--danger-soft)' : (i % 2 === 0 ? 'var(--surface-soft)' : 'var(--bg)'); }}
              >
                <td style={{ padding: '10px 8px 10px 14px', width: 36 }} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={bulkSel.has(t.id)} onChange={() => onToggleBulk(t.id)} style={{ width: 13, height: 13, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'var(--primary-soft)', color: 'var(--primary)' }}>{t.tipo}</span>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text)', maxWidth: 240 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descripcion}</div>
                  {t.tags && t.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>
                      {t.tags.slice(0, 2).map((tag) => (
                        <span key={tag} style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 500 }}>
                          {tag}
                        </span>
                      ))}
                      {t.tags.length > 2 && <span style={{ fontSize: 9.5, color: 'var(--muted-2)' }}>+{t.tags.length - 2}</span>}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {t.paciente ?? <span style={{ color: 'var(--muted-4)' }}>—</span>}
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: 12, color: t.dueAt ? '#3B78AF' : 'var(--muted-4)' }}>
                  {t.dueAt
                    ? new Date(t.dueAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
                    : '—'}
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                  <select
                    value={t.etapa}
                    onChange={(e) => onMover(t.id, e.target.value as Etapa)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 24px 3px 8px', borderRadius: 4,
                      background: estilo.bg, color: estilo.color,
                      border: `1px solid ${estilo.color}55`,
                      cursor: 'pointer', appearance: 'none' as const,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23777' stroke-width='1.5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '8px',
                    }}
                  >
                    {ETAPAS.map(ep => <option key={ep} value={ep}>{ETAPA_LABEL[ep]}</option>)}
                  </select>
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
                      <button onClick={() => onMover(t.id, NEXT[t.etapa])} title={`Avanzar a ${ETAPA_LABEL[NEXT[t.etapa]]}`} style={{ fontSize: 11, padding: '3px 9px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 4, border: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>→ {ETAPA_LABEL[NEXT[t.etapa]]}</button>
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
    </>
  );
}
