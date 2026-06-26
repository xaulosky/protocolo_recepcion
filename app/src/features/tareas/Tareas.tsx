import { useState } from 'react';
import { useTareas, ETAPAS, ETAPA_LABEL, PRIORIDAD_LABEL } from './useTareas';
import type { Task } from '../../lib/types';
import type { Prioridad } from '../../lib/types';
import { Icon } from '../../lib/icons';
import { AsyncState } from '../../components/AsyncState';
import { useApp } from '../../store/app-context';
import { colorFromString } from '../../lib/format';

const PRIO_STYLE: Record<Prioridad, { bg: string; color: string }> = {
  URGENTE: { bg: '#FBF0EB', color: '#C97B4B' },
  BAJA: { bg: '#EDF5EF', color: '#4A7A5A' },
  NORMAL: { bg: '#F5F5F5', color: '#7A7066' },
};

export function Tareas() {
  const { toast } = useApp();
  const { tasks, users, loading, error, reload, crear, mover, eliminar } = useTareas();
  const [filter, setFilter] = useState('Todas');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ tipo: '', descripcion: '', asignadaId: '', prioridad: 'NORMAL' as Prioridad, paciente: '' });

  const filtered = filter === 'Todas' ? tasks : tasks.filter((t) => t.asignada?.id === filter);

  const guardar = async () => {
    if (!draft.tipo || !draft.asignadaId || !draft.descripcion) { toast('Completa tipo, descripción y asignada'); return; }
    try {
      await crear({ ...draft, paciente: draft.paciente || undefined });
      setDraft({ tipo: '', descripcion: '', asignadaId: '', prioridad: 'NORMAL', paciente: '' });
      setShowForm(false);
      toast('Tarea creada');
    } catch {
      toast('No se pudo crear la tarea');
    }
  };

  const TIPOS = ['Confirmación de cita', 'Mensaje sin responder', 'Reagendamiento', 'Solicitud de reembolso', 'Suspensión', 'Seguimiento post-tratamiento', 'Pago / cobro pendiente'];

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div className="chips-row" style={{ marginBottom: 0 }}>
            <button className={`chip${filter === 'Todas' ? ' active' : ''}`} onClick={() => setFilter('Todas')}>Todas</button>
            {users.map((u) => (
              <button key={u.id} className={`chip${filter === u.id ? ' active' : ''}`} onClick={() => setFilter(u.id)}>{u.nombre}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            <Icon name="plus" size={12} strokeWidth={2.5} /> Nueva tarea
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Nueva tarea</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label className="label">Tipo</label>
                <select className="select" value={draft.tipo} onChange={(e) => setDraft({ ...draft, tipo: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Asignada a</label>
                <select className="select" value={draft.asignadaId} onChange={(e) => setDraft({ ...draft, asignadaId: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Descripción</label>
                <input className="input" value={draft.descripcion} onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })} placeholder="Describe la tarea..." />
              </div>
              <div>
                <label className="label">Paciente (opcional)</label>
                <input className="input" value={draft.paciente} onChange={(e) => setDraft({ ...draft, paciente: e.target.value })} placeholder="Nombre del paciente" />
              </div>
              <div>
                <label className="label">Prioridad</label>
                <select className="select" value={draft.prioridad} onChange={(e) => setDraft({ ...draft, prioridad: e.target.value as Prioridad })}>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={guardar}>Guardar tarea</button>
              <button className="btn btn-soft" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
          {ETAPAS.map((etapa) => {
            const cards = filtered.filter((t) => t.etapa === etapa);
            return (
              <div key={etapa} style={{ minWidth: 225, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, padding: '0 2px' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ETAPA_LABEL[etapa]}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--border-soft)', color: 'var(--muted)', padding: '2px 7px', borderRadius: 10 }}>{cards.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 60 }}>
                  {cards.map((t) => <Card key={t.id} t={t} onMover={() => mover(t.id, t.etapa)} onEliminar={() => eliminar(t.id)} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AsyncState>
  );
}

function Card({ t, onMover, onEliminar }: { t: Task; onMover: () => void; onEliminar: () => void }) {
  const prio = PRIO_STYLE[t.prioridad];
  const nombre = t.asignada?.nombre ?? 'Sin asignar';
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 9, padding: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 7 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--primary-soft)', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{t.tipo}</span>
        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: prio.bg, color: prio.color }}>{PRIORIDAD_LABEL[t.prioridad]}</span>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.45, marginBottom: 8 }}>{t.descripcion}</p>
      {t.paciente && (
        <div style={{ fontSize: 11, color: 'var(--muted-2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="user" size={11} /> {t.paciente}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-softer)', paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: colorFromString(nombre), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{nombre.charAt(0)}</div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{nombre}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {t.etapa !== 'CERRADO' && (
            <button onClick={onMover} title="Avanzar" style={{ fontSize: 11.5, padding: '3px 8px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 4, border: 'none', fontWeight: 600 }}>→</button>
          )}
          <button onClick={onEliminar} title="Eliminar" style={{ fontSize: 11, padding: '3px 7px', background: 'var(--danger-soft)', color: 'var(--orange)', borderRadius: 4, border: 'none' }}>✕</button>
        </div>
      </div>
    </div>
  );
}
