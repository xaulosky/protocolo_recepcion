import { useState } from 'react';
import type { CirugiaListItem, EtapaCirugia } from '../../lib/types';
import { Icon } from '../../lib/icons';
import { ETAPA_STYLE } from './cirugiasStyles';
import { buildMonthGrid, sameDay, MESES, DIAS_SEMANA } from '../../lib/calendarGrid';

interface Props {
  cirugias: CirugiaListItem[];
  onClickCirugia: (id: string) => void;
}

export function CirugiasCalendario({ cirugias, onClickCirugia }: Props) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const grid = buildMonthGrid(year, month);

  // Cirugías con fechaCirugia como Date
  const conFecha = cirugias
    .filter((c) => c.fechaCirugia)
    .map((c) => ({ ...c, fecha: new Date(c.fechaCirugia!) }));

  // Cirugías sin fecha programada (se muestran abajo)
  const sinFecha = cirugias.filter((c) => !c.fechaCirugia);

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--border-softer)' }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {grid.map(({ date, current }, idx) => {
            const isToday   = sameDay(date, now);
            const dayItems  = conFecha.filter((c) => sameDay(c.fecha, date));
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return (
              <DayCell
                key={idx}
                date={date}
                current={current}
                isToday={isToday}
                isWeekend={isWeekend}
                dayItems={dayItems}
                idx={idx}
                onClickCirugia={onClickCirugia}
              />
            );
          })}
        </div>
      </div>

      {/* ── Sin fecha programada ── */}
      {sinFecha.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
            Sin fecha programada ({sinFecha.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sinFecha.map((c) => (
              <button
                key={c.id}
                onClick={() => onClickCirugia(c.id)}
                style={{
                  fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--text-2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: ETAPA_STYLE[c.etapa].bg, color: ETAPA_STYLE[c.etapa].color }}>
                  {c.tipo}
                </span>
                {c.paciente}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Celda de día ── */
interface DayCellProps {
  date: Date; current: boolean; isToday: boolean; isWeekend: boolean;
  dayItems: (CirugiaListItem & { fecha: Date })[];
  idx: number;
  onClickCirugia: (id: string) => void;
}

function DayCell({ date, current, isToday, isWeekend, dayItems, idx, onClickCirugia }: DayCellProps) {
  return (
    <div
      style={{
        minHeight: 88, padding: '6px 6px 4px', position: 'relative',
        borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-soft)' : 'none',
        borderBottom: idx < 35 ? '1px solid var(--border-soft)' : 'none',
        background: !current ? 'var(--bg)' : isWeekend ? 'var(--border-softer)' : 'var(--surface)',
      }}
    >
      <div style={{
        fontSize: 12, fontWeight: isToday ? 700 : 400,
        color: isToday ? '#fff' : current ? 'var(--text)' : 'var(--muted-4)',
        width: 22, height: 22, borderRadius: 11,
        background: isToday ? 'var(--primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 4,
      }}>
        {date.getDate()}
      </div>

      {dayItems.slice(0, 3).map((c) => {
        const s = ETAPA_STYLE[c.etapa as EtapaCirugia];
        return (
          <button
            key={c.id}
            onClick={() => onClickCirugia(c.id)}
            title={`${c.paciente} — ${c.tipo}`}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              fontSize: 10, fontWeight: 500, padding: '2px 5px', borderRadius: 4, border: 'none',
              background: s.bg, color: s.color, cursor: 'pointer', marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {c.paciente}
          </button>
        );
      })}
      {dayItems.length > 3 && (
        <div style={{ fontSize: 10, color: 'var(--muted)', paddingLeft: 5 }}>+{dayItems.length - 3} más</div>
      )}
    </div>
  );
}
