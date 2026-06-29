import { useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import { Icon } from '../lib/icons';
import { initials, avatarColor } from '../lib/format';
import type { Professional } from '../lib/types';

function diasLabel(p: Professional): string {
  return p.disponibilidad?.dias?.join(', ') || 'Por confirmar';
}

export function Profesionales() {
  const [selected, setSelected] = useState<Professional | null>(null);
  const [search, setSearch] = useState('');
  const [esp, setEsp] = useState('Todas');
  const { data, loading, error, reload } = useResource<{ professionals: Professional[] }>('/data/professionals');
  const professionals = data?.professionals ?? [];

  const especialidades = useMemo(
    () => ['Todas', ...Array.from(new Set(professionals.map((p) => p.especialidad))).sort()],
    [professionals],
  );

  const filtered = professionals.filter((p) => {
    if (esp !== 'Todas' && p.especialidad !== esp) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.nombreCompleto.toLowerCase().includes(q) || p.especialidad.toLowerCase().includes(q);
  });

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', display: 'flex' }}>
              <Icon name="search" size={15} />
            </span>
            <input className="input" style={{ paddingLeft: 34 }} placeholder="Buscar profesional..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto', minWidth: 180 }} value={esp} onChange={(e) => setEsp(e.target.value)}>
            {especialidades.map((e) => <option key={e} value={e}>{e === 'Todas' ? 'Todas las especialidades' : e}</option>)}
          </select>
        </div>

        <div className="grid-cards">
          {filtered.map((p, i) => (
            <div key={p.id} onClick={() => setSelected(p)} className="card card-hover" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0, background: avatarColor(i) }}>
                  {initials(p.nombreCompleto)}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{p.nombreCompleto}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.especialidad}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <InfoRow icon="calendar" text={diasLabel(p)} />
                <InfoRow icon="clock" text={p.disponibilidad?.horario || 'Horario por confirmar'} />
              </div>
            </div>
          ))}
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} eyebrow={selected?.especialidad} title={selected?.nombreCompleto ?? ''}>
          {selected && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <DetailRow label="Disponibilidad" value={diasLabel(selected)} />
                <DetailRow label="Horario" value={selected.disponibilidad?.horario || '—'} />
                {selected.disponibilidad?.frecuencia && <DetailRow label="Frecuencia" value={selected.disponibilidad.frecuencia} />}
                {selected.telefono && (
                  <DetailRow label="Teléfono" value={<a href={`tel:${selected.telefono}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{selected.telefono}</a>} />
                )}
                {selected.email && (
                  <DetailRow label="Email" value={<a href={`mailto:${selected.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{selected.email}</a>} />
                )}
                {selected.rut && <DetailRow label="RUT" value={selected.rut} />}
              </div>
              {selected.prestaciones?.servicios?.length ? (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Prestaciones</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.prestaciones.servicios.map((s, i) => (
                      <span key={i} className="badge" style={{ fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Modal>
      </div>
    </AsyncState>
  );
}

function InfoRow({ icon, text }: { icon: 'calendar' | 'clock'; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
      <span style={{ color: 'var(--muted-2)', display: 'flex', flexShrink: 0 }}><Icon name={icon} size={12} /></span>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{text}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12.5, color: 'var(--muted-2)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12.5, color: 'var(--text-2)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
