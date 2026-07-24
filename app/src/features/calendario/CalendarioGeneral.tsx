import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { useAuth } from '../../store/auth-context';
import { useTareas } from '../tareas/useTareas';
import { TaskDetailModal } from '../tareas/TaskDetailModal';
import { ETAPA_STYLE } from '../tareas/tareasStyles';
import { EventoModal } from './EventoModal';
import type { EventoDraft } from './EventoModal';
import { Icon } from '../../lib/icons';
import { buildMonthGrid, sameDay, MESES, DIAS_SEMANA, GRID_COLS_7 } from '../../lib/calendarGrid';
import type { CumpleanosData, Etapa, EventoCategoria, EventoInterno, Task } from '../../lib/types';

const CATEGORIA_STYLE: Record<EventoCategoria, { bg: string; color: string }> = {
  REUNION: { bg: '#EBF3FB', color: '#2F6B9A' },
  FERIADO: { bg: '#FBF0EB', color: '#C07B3A' },
  OTRO:    { bg: '#F0F0F0', color: '#707070' },
};

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mesDia(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function eventoIncluyeDia(e: EventoInterno, date: Date): boolean {
  const start = new Date(e.fecha); start.setHours(0, 0, 0, 0);
  const end = e.fechaFin ? new Date(e.fechaFin) : start;
  end.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return d >= start && d <= end;
}

export function CalendarioGeneral() {
  const { toast } = useApp();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const canWrite = hasRole('ADMIN', 'RECEPCION');

  const { tasks, users, getTask, actualizar, eliminar: eliminarTarea } = useTareas();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filtroUsuario, setFiltroUsuario] = useState('mias');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [eventos, setEventos] = useState<EventoInterno[]>([]);
  const [cumple, setCumple] = useState<CumpleanosData | null>(null);
  const [eventoModal, setEventoModal] = useState<{ evento: EventoInterno | null; fecha: string } | null>(null);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const rangoDesde = grid[0].date.getTime();
  const rangoHasta = grid[grid.length - 1].date.getTime();

  const cargarEventos = useCallback(async () => {
    try {
      const desde = new Date(rangoDesde); desde.setHours(0, 0, 0, 0);
      const hasta = new Date(rangoHasta); hasta.setHours(23, 59, 59, 999);
      const d = await api.get<{ eventos: EventoInterno[] }>(`/eventos?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`);
      setEventos(d.eventos);
    } catch {
      toast('Error al cargar eventos');
    }
  }, [rangoDesde, rangoHasta, toast]);

  useEffect(() => { void cargarEventos(); }, [cargarEventos]);

  useEffect(() => {
    api.get<CumpleanosData>('/users/cumpleanos').then(setCumple).catch(() => {});
  }, []);

  // Tareas a mostrar: no-admin ya vienen filtradas por el backend (solo
  // asignadas/creadas por ellos); admin elige "mis tareas" / persona / todas.
  const tasksFiltradas = useMemo(() => {
    if (!isAdmin) return tasks;
    if (filtroUsuario === 'todas') return tasks;
    const uid = filtroUsuario === 'mias' ? user?.id : filtroUsuario;
    return tasks.filter((t) => t.asignadas.some((a) => a.id === uid) || t.creadoPor?.id === uid);
  }, [tasks, isAdmin, filtroUsuario, user?.id]);

  const withDue = useMemo(
    () => tasksFiltradas.filter((t) => t.dueAt).map((t) => ({ ...t, dueDate: new Date(t.dueAt!) })),
    [tasksFiltradas],
  );

  const handleEliminarTarea = async (id: string) => {
    try {
      await eliminarTarea(id);
      toast('Tarea eliminada');
    } catch {
      toast('No se pudo eliminar');
    } finally {
      setSelectedTaskId(null);
    }
  };

  const abrirNuevoEvento = (fecha: Date) => {
    if (!canWrite) return;
    setEventoModal({ evento: null, fecha: ymd(fecha) });
  };

  const abrirEvento = (e: EventoInterno) => {
    setEventoModal({ evento: e, fecha: ymd(new Date(e.fecha)) });
  };

  const guardarEvento = async (data: EventoDraft) => {
    const body = {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim() || null,
      categoria: data.categoria,
      fecha: new Date(`${data.fecha}T09:00:00`).toISOString(),
      fechaFin: data.fechaFin ? new Date(`${data.fechaFin}T09:00:00`).toISOString() : null,
      todoElDia: true,
    };
    if (eventoModal?.evento) {
      await api.patch(`/eventos/${eventoModal.evento.id}`, body);
      toast('Evento actualizado');
    } else {
      await api.post('/eventos', body);
      toast('Evento creado');
    }
    void cargarEventos();
  };

  const eliminarEvento = async (id: string) => {
    await api.del(`/eventos/${id}`);
    toast('Evento eliminado');
    void cargarEventos();
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Calendario</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0' }}>Tareas, eventos internos y cumpleaños del equipo</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={() => abrirNuevoEvento(now)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} />Nuevo evento
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={prevMonth}><Icon name="colL" size={15} /></button>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', minWidth: 180, textAlign: 'center' }}>
            {MESES[month]} {year}
          </span>
          <button className="icon-btn" onClick={nextMonth}><Icon name="colR" size={15} /></button>
          <button
            onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}
            className="btn btn-soft"
            style={{ fontSize: 12, padding: '4px 10px' }}
          >
            Hoy
          </button>
        </div>

        {isAdmin && (
          <select className="select" style={{ width: 'auto', minWidth: 160, fontSize: 12.5 }} value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)}>
            <option value="mias">Mis tareas</option>
            <option value="todas">Todas las tareas</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
        )}

        {/* Leyenda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--muted)', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <LegendDot color={CATEGORIA_STYLE.REUNION.color} label="Reunión" />
          <LegendDot color={CATEGORIA_STYLE.FERIADO.color} label="Feriado" />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>🎂 Cumpleaños</span>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS_7, borderBottom: '1px solid var(--border)' }}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--border-softer)' }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS_7 }}>
          {grid.map(({ date, current }, idx) => {
            const isToday = sameDay(date, now);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const dayTasks = withDue.filter((t) => sameDay(t.dueDate, date));
            const dayEventos = eventos.filter((e) => eventoIncluyeDia(e, date));
            const md = mesDia(date);
            const cumpleDia = cumple?.todos.filter((u) => u.mesDia === md) ?? [];

            return (
              <DayCell
                key={idx}
                date={date}
                current={current}
                isToday={isToday}
                isWeekend={isWeekend}
                idx={idx}
                dayTasks={dayTasks}
                dayEventos={dayEventos}
                cumpleDia={cumpleDia}
                canWrite={canWrite}
                onClickTask={setSelectedTaskId}
                onClickEvento={abrirEvento}
                onClickDay={() => abrirNuevoEvento(date)}
              />
            );
          })}
        </div>
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        users={users}
        onClose={() => setSelectedTaskId(null)}
        onGetTask={getTask}
        onActualizar={actualizar}
        onEliminar={handleEliminarTarea}
      />

      {eventoModal && (
        <EventoModal
          open
          fechaInicial={eventoModal.fecha}
          evento={eventoModal.evento}
          readOnly={!canWrite}
          onClose={() => setEventoModal(null)}
          onGuardar={guardarEvento}
          onEliminar={eliminarEvento}
        />
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

interface DayCellProps {
  date: Date; current: boolean; isToday: boolean; isWeekend: boolean; idx: number;
  dayTasks: (Task & { dueDate: Date })[];
  dayEventos: EventoInterno[];
  cumpleDia: { id: string; nombre: string; mesDia: string }[];
  canWrite: boolean;
  onClickTask: (id: string) => void;
  onClickEvento: (e: EventoInterno) => void;
  onClickDay: () => void;
}

function DayCell({ date, current, isToday, isWeekend, idx, dayTasks, dayEventos, cumpleDia, canWrite, onClickTask, onClickEvento, onClickDay }: DayCellProps) {
  const [hovered, setHovered] = useState(false);
  // Los cumpleaños van primero: son pocos y no deben caer bajo el "+N más".
  const items = [
    ...cumpleDia.map((c) => ({ kind: 'cumple' as const, c })),
    ...dayEventos.map((e) => ({ kind: 'evento' as const, e })),
    ...dayTasks.map((t) => ({ kind: 'tarea' as const, t })),
  ];

  return (
    <div
      onClick={canWrite ? onClickDay : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={canWrite ? `Crear evento para el ${date.getDate()}/${date.getMonth() + 1}` : undefined}
      style={{
        minHeight: 92, minWidth: 0, padding: '6px 6px 4px', position: 'relative', cursor: canWrite ? 'pointer' : 'default',
        borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-soft)' : 'none',
        borderBottom: idx < 35 ? '1px solid var(--border-soft)' : 'none',
        background: hovered && canWrite
          ? 'var(--primary-soft)'
          : !current ? 'var(--bg)' : isWeekend ? 'var(--border-softer)' : 'var(--surface)',
        transition: 'background .12s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{
          fontSize: 12, fontWeight: isToday ? 700 : 400,
          color: isToday ? '#fff' : current ? 'var(--text)' : 'var(--muted-4)',
          width: 22, height: 22, borderRadius: 11,
          background: isToday ? 'var(--primary)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {date.getDate()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {hovered && canWrite && (
            <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 300, lineHeight: 1, opacity: 0.7 }}>+</span>
          )}
        </div>
      </div>

      {items.slice(0, 3).map((item, i) => {
        if (item.kind === 'cumple') {
          return (
            <div
              key={`c-${item.c.id}`}
              title={`Cumpleaños de ${item.c.nombre}`}
              style={{
                fontSize: 10, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                background: '#FBF0F3', color: '#A05070', marginBottom: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              🎂 {item.c.nombre}
            </div>
          );
        }
        if (item.kind === 'evento') {
          const s = CATEGORIA_STYLE[item.e.categoria];
          return (
            <button
              key={`e-${item.e.id}`}
              onClick={(ev) => { ev.stopPropagation(); onClickEvento(item.e); }}
              title={item.e.titulo}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                fontSize: 10, fontWeight: 600, padding: '2px 5px', borderRadius: 4, border: 'none',
                background: s.bg, color: s.color, cursor: 'pointer', marginBottom: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {item.e.titulo}
            </button>
          );
        }
        const s = ETAPA_STYLE[item.t.etapa as Etapa];
        return (
          <button
            key={`t-${item.t.id}-${i}`}
            onClick={(ev) => { ev.stopPropagation(); onClickTask(item.t.id); }}
            title={`${item.t.tipo}: ${item.t.descripcion}`}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              fontSize: 10, fontWeight: 500, padding: '2px 5px', borderRadius: 4, border: 'none',
              background: s.bg, color: s.color, cursor: 'pointer', marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {item.t.tipo}
          </button>
        );
      })}
      {items.length > 3 && (
        <div style={{ fontSize: 10, color: 'var(--muted)', paddingLeft: 5 }}>+{items.length - 3} más</div>
      )}
    </div>
  );
}
