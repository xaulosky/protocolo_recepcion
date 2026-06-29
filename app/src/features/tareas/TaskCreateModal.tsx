import { useState, useEffect } from 'react';
import type { Prioridad } from '../../lib/types';
import type { NewTarea, AssignableUser } from './useTareas';
import { Modal } from '../../components/Modal';
import { UserMultiSelect } from '../../components/UserMultiSelect';
import { TagInput } from '../../components/TagInput';

const TIPOS = [
  'Confirmación de cita', 'Mensaje sin responder', 'Reagendamiento',
  'Solicitud de reembolso', 'Suspensión', 'Seguimiento post-tratamiento', 'Pago / cobro pendiente',
];

interface Props {
  open: boolean;
  initialDueAt?: string;
  users: AssignableUser[];
  onClose: () => void;
  onGuardar: (data: NewTarea & { dueAt?: string }) => Promise<void>;
}

const EMPTY = { tipo: '', descripcion: '', prioridad: 'NORMAL' as Prioridad, paciente: '', dueAt: '' };

export function TaskCreateModal({ open, initialDueAt, users, onClose, onGuardar }: Props) {
  const [draft, setDraft] = useState({ ...EMPTY });
  const [asignadasIds, setAsignadasIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDraft({ ...EMPTY, dueAt: initialDueAt ?? '' });
      setAsignadasIds([]);
      setTags([]);
      setError('');
    }
  }, [open, initialDueAt]);

  const set = (k: keyof typeof EMPTY, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const guardar = async () => {
    if (!draft.tipo || !draft.descripcion) {
      setError('Completa tipo y descripción');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onGuardar({
        tipo: draft.tipo,
        descripcion: draft.descripcion,
        asignadasIds,
        tags,
        prioridad: draft.prioridad,
        paciente: draft.paciente || undefined,
        dueAt: draft.dueAt ? new Date(draft.dueAt).toISOString() : undefined,
      });
      onClose();
    } catch {
      setError('No se pudo crear la tarea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva tarea" maxWidth={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div>
          <label className="label">Tipo *</label>
          <select className="select" value={draft.tipo} onChange={(e) => set('tipo', e.target.value)}>
            <option value="">Seleccionar...</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Descripción *</label>
          <textarea
            className="input"
            rows={3}
            value={draft.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            placeholder="Describe la tarea..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Paciente</label>
            <input className="input" value={draft.paciente} onChange={(e) => set('paciente', e.target.value)} placeholder="Nombre del paciente" />
          </div>
          <div>
            <label className="label">Prioridad</label>
            <select className="select" value={draft.prioridad} onChange={(e) => set('prioridad', e.target.value as Prioridad)}>
              <option value="BAJA">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Asignar a</label>
          <UserMultiSelect users={users} selected={asignadasIds} onChange={setAsignadasIds} />
        </div>

        <div>
          <label className="label">Etiquetas</label>
          <TagInput tags={tags} onChange={setTags} placeholder="Ej: urgente, paciente-vip" />
        </div>

        <div>
          <label className="label">Fecha y hora</label>
          <input
            type="datetime-local"
            className="input"
            value={draft.dueAt}
            onChange={(e) => set('dueAt', e.target.value)}
          />
        </div>

        {error && <p style={{ fontSize: 12, color: 'var(--orange)', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button className="btn btn-primary" onClick={guardar} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear tarea'}
          </button>
          <button className="btn btn-soft" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </Modal>
  );
}
