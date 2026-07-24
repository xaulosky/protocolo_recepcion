import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Icon } from '../../lib/icons';
import type { EventoCategoria, EventoInterno } from '../../lib/types';

const CATEGORIAS: { value: EventoCategoria; label: string }[] = [
  { value: 'REUNION', label: 'Reunión / Capacitación' },
  { value: 'FERIADO', label: 'Feriado / Cierre de clínica' },
  { value: 'OTRO', label: 'Otro' },
];

export interface EventoDraft {
  titulo: string;
  descripcion: string;
  categoria: EventoCategoria;
  fecha: string;    // yyyy-mm-dd
  fechaFin: string; // yyyy-mm-dd, opcional
}

interface Props {
  open: boolean;
  fechaInicial: string; // yyyy-mm-dd para prellenar al crear
  evento: EventoInterno | null; // null = crear
  /** Usuarios sin permiso de gestión: solo pueden ver el evento, no editarlo. */
  readOnly?: boolean;
  onClose: () => void;
  onGuardar: (data: EventoDraft) => Promise<void>;
  onEliminar?: (id: string) => Promise<void>;
}

function isoToYmd(iso: string): string {
  return iso.slice(0, 10);
}

export function EventoModal({ open, fechaInicial, evento, readOnly, onClose, onGuardar, onEliminar }: Props) {
  const [draft, setDraft] = useState<EventoDraft>({ titulo: '', descripcion: '', categoria: 'OTRO', fecha: fechaInicial, fechaFin: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (evento) {
      setDraft({
        titulo: evento.titulo,
        descripcion: evento.descripcion ?? '',
        categoria: evento.categoria,
        fecha: isoToYmd(evento.fecha),
        fechaFin: evento.fechaFin ? isoToYmd(evento.fechaFin) : '',
      });
    } else {
      setDraft({ titulo: '', descripcion: '', categoria: 'OTRO', fecha: fechaInicial, fechaFin: '' });
    }
  }, [open, evento, fechaInicial]);

  const set = <K extends keyof EventoDraft>(k: K, v: EventoDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const guardar = async () => {
    if (!draft.titulo.trim() || !draft.fecha) { setError('Completa título y fecha'); return; }
    setSaving(true);
    setError('');
    try {
      await onGuardar(draft);
      onClose();
    } catch {
      setError('No se pudo guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async () => {
    if (!evento || !onEliminar) return;
    if (!window.confirm(`¿Eliminar el evento "${evento.titulo}"?`)) return;
    setSaving(true);
    try {
      await onEliminar(evento.id);
      onClose();
    } catch {
      setError('No se pudo eliminar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={evento ? 'Editar evento' : 'Nuevo evento'} maxWidth={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="label">Título *</label>
          <input className="input" value={draft.titulo} disabled={readOnly} onChange={(e) => set('titulo', e.target.value)} placeholder="Ej: Reunión de equipo" />
        </div>

        <div>
          <label className="label">Categoría</label>
          <select className="select" value={draft.categoria} disabled={readOnly} onChange={(e) => set('categoria', e.target.value as EventoCategoria)}>
            {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Fecha *</label>
            <input type="date" className="input" value={draft.fecha} disabled={readOnly} onChange={(e) => set('fecha', e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta (opcional)</label>
            <input type="date" className="input" value={draft.fechaFin} disabled={readOnly} onChange={(e) => set('fechaFin', e.target.value)} min={draft.fecha} />
          </div>
        </div>

        <div>
          <label className="label">Descripción (opcional)</label>
          <textarea
            className="input"
            rows={3}
            value={draft.descripcion}
            disabled={readOnly}
            onChange={(e) => set('descripcion', e.target.value)}
            placeholder="Detalles del evento..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {evento && (
          <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>
            Creado por {evento.creadoPor?.nombre ?? '—'}
          </div>
        )}

        {error && <p style={{ fontSize: 12, color: 'var(--orange)', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          {readOnly ? (
            <button className="btn btn-soft" onClick={onClose}>Cerrar</button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={guardar} disabled={saving}>
                {saving ? 'Guardando…' : evento ? 'Guardar cambios' : 'Crear evento'}
              </button>
              <button className="btn btn-soft" onClick={onClose}>Cancelar</button>
              {evento && onEliminar && (
                <button
                  onClick={eliminar}
                  disabled={saving}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: 4 }}
                  title="Eliminar evento"
                >
                  <Icon name="trash" size={15} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
