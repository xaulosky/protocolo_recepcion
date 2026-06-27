import { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { useResource } from '../../lib/useResource';
import type { Professional } from '../../lib/types';
import type { NuevaCirugia } from './useCirugias';

interface Props {
  open: boolean;
  onClose: () => void;
  onGuardar: (data: NuevaCirugia) => Promise<void>;
}

const EMPTY: NuevaCirugia = {
  paciente: '',
  tipo: '',
  telefono: '',
  email: '',
  notas: '',
  fechaCirugia: null,
  professionalId: null,
};

export function CirugiaCreateModal({ open, onClose, onGuardar }: Props) {
  const [draft, setDraft] = useState<NuevaCirugia>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const { data: profData } = useResource<{ professionals: Professional[] }>('/data/professionals');
  const profesionales = profData?.professionals ?? [];

  useEffect(() => {
    if (open) { setDraft({ ...EMPTY }); setError(''); }
  }, [open]);

  const set = <K extends keyof NuevaCirugia>(k: K, v: NuevaCirugia[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const guardar = async () => {
    if (!draft.paciente || !draft.tipo) {
      setError('El nombre del paciente y el tipo de cirugía son obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onGuardar({
        ...draft,
        telefono:      draft.telefono      || null,
        email:         draft.email         || null,
        notas:         draft.notas         || null,
        professionalId: draft.professionalId || null,
      });
      onClose();
    } catch {
      setError('No se pudo crear la cirugía');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva cirugía" maxWidth={540}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Paciente *</label>
            <input className="input" value={draft.paciente} onChange={(e) => set('paciente', e.target.value)} placeholder="Nombre completo" />
          </div>
          <div>
            <label className="label">Tipo de cirugía *</label>
            <input className="input" value={draft.tipo} onChange={(e) => set('tipo', e.target.value)} placeholder="Ej: Rinoplastia" list="tipos-list" />
            <datalist id="tipos-list">
              {['Rinoplastia', 'Blefaroplastia', 'Otoplastia', 'Mentoplastia', 'Liposucción', 'Abdominoplastia', 'Mamoplastia', 'Lifting facial', 'Bichectomía'].map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" value={draft.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} placeholder="+56 9 0000 0000" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={draft.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="paciente@email.com" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Profesional</label>
            <select className="select" value={draft.professionalId ?? ''} onChange={(e) => set('professionalId', e.target.value || null)}>
              <option value="">Sin asignar</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>{p.nombreCompleto}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha de cirugía</label>
            <input
              type="datetime-local"
              className="input"
              value={draft.fechaCirugia ? draft.fechaCirugia.slice(0, 16) : ''}
              onChange={(e) => set('fechaCirugia', e.target.value ? new Date(e.target.value).toISOString() : null)}
            />
          </div>
        </div>

        <div>
          <label className="label">Notas iniciales</label>
          <textarea
            className="input"
            rows={2}
            value={draft.notas ?? ''}
            onChange={(e) => set('notas', e.target.value)}
            placeholder="Observaciones, antecedentes..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {error && <p style={{ fontSize: 12, color: 'var(--orange)', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button className="btn btn-primary" onClick={guardar} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear cirugía'}
          </button>
          <button className="btn btn-soft" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </Modal>
  );
}
