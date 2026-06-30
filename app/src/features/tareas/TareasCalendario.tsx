import { useState } from 'react';
import type { Task, Etapa } from '../../lib/types';
import { Icon } from '../../lib/icons';
import { ETAPA_STYLE } from './tareasStyles';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS  = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const days: { date: Date; current: boolean }[] = [];

  const firstDow = (first.getDay() + 6) % 7; // lunes = 0
  for (let i = firstDow - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), current: false });
  for (let i = 1; i <= last.getDate(); i++) days.push({ date: new Date(year, month, i), current: true });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), current: false });
  return days;
}

function toDateTimeLocal(date: Date, hour = 9): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(hour)}:00`;
}

interface Props {
  tasks: Task[];
  onClickTask: (id: string) => void;
  onClickDay: (dateTimeLocal: string) => void;
}

export function TareasCalendario({ tasks, onClickTask, onClickDay }: Props) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const grid = buildGrid(year, month);

  // Tareas con dueAt como Date
  const withDue = tasks
    .filter((t) => t.dueAt)
    .map((t) => ({ ...t, dueDate: new Date(t.dueAt!) }));

  // Tareas sin fecha (se muestran abajo)
  const sinFecha = tasks.filter((t) => !t.dueAt);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Cabecera del mes ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-btn" onClick={prevMonth}><Icon name="colL" size={15} /></button>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', minWidth: 180, textAlign: 'center' }}>
          {MESES[month]} {year}
        </span>
        <button className="icon-btn" onClick={nextMonth}><Icon name="colR" size={15} /></button>
        <button
          onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}
          className="btn btn-soft"
          style={{ marginLeft: 4, fontSize: 12, padding: '4px 10px' }}
        >
          Hoy
        </button>
      </div>

      {/* ── Grid del calendario ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Cabecera días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {DIAS.map((d) => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--border-softer)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Semanas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {grid.map(({ date, current }, idx) => {
            const isToday    = sameDay(date, now);
            const dayTasks   = withDue.filter((t) => sameDay(t.dueDate, date));
            const isWeekend  = date.getDay() === 0 || date.getDay() === 6;
            return (
              <DayCell
                key={idx}
                date={date}
                current={current}
                isToday={isToday}
                isWeekend={isWeekend}
                dayTasks={dayTasks}
                idx={idx}
                onClickTask={onClickTask}
                onClickDay={() => onClickDay(toDateTimeLocal(date))}
              />
            );
          })}
        </div>
      </div>

      {/* ── Tareas sin fecha ── */}

      {sinFecha.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
            Sin fecha programada ({sinFecha.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sinFecha.map((t) => (
              <button
                key={t.id}
                onClick={() => onClickTask(t.id)}
                style={{
                  fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--text-2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                  {t.tipo}
                </span>
                {t.descripcion.length > 40 ? `${t.descripcion.slice(0, 40)}…` : t.descripcion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Celda de día: clickeable para crear tarea ── */
interface DayCellProps {
  date: Date; current: boolean; isToday: boolean; isWeekend: boolean;
  dayTasks: (Task & { dueDate: Date })[];
  idx: number;
  onClickTask: (id: string) => void;
  onClickDay: () => void;
}

function DayCell({ date, current, isToday, isWeekend, dayTasks, idx, onClickTask, onClickDay }: DayCellProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClickDay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Crear tarea para el ${date.getDate()}/${date.getMonth() + 1}`}
      style={{
        minHeight: 88, padding: '6px 6px 4px', position: 'relative', cursor: 'pointer',
        borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-soft)' : 'none',
        borderBottom: idx < 35 ? '1px solid var(--border-soft)' : 'none',
        background: hovered
          ? 'var(--primary-soft)'
          : !current ? 'var(--bg)' : isWeekend ? 'var(--border-softer)' : 'var(--surface)',
        transition: 'background .12s',
      }}
    >
      {/* Número del día + icono "+" en hover */}
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
        {hovered && (
          <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 300, lineHeight: 1, opacity: 0.7 }}>+</span>
        )}
      </div>

      {/* Chips de tareas */}
      {dayTasks.slice(0, 3).map((t) => {
        const s = ETAPA_STYLE[t.etapa as Etapa];
        return (
          <button
            key={t.id}
            onClick={(e) => { e.stopPropagation(); onClickTask(t.id); }}
            title={`${t.tipo}: ${t.descripcion}`}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              fontSize: 10, fontWeight: 500, padding: '2px 5px', borderRadius: 4, border: 'none',
              background: s.bg, color: s.color, cursor: 'pointer', marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {t.tipo}
          </button>
        );
      })}
      {dayTasks.length > 3 && (
        <div style={{ fontSize: 10, color: 'var(--muted)', paddingLeft: 5 }}>+{dayTasks.length - 3} más</div>
      )}
    </div>
  );
}
