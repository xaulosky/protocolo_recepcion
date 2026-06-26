import { useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import { Icon } from '../lib/icons';
import { priceRange } from '../lib/format';
import type { Treatment } from '../lib/types';

export function Tratamientos() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [selected, setSelected] = useState<Treatment | null>(null);
  const { data, loading, error, reload } = useResource<{ treatments: Treatment[] }>('/data/treatments');
  const treatments = useMemo(() => data?.treatments ?? [], [data]);

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(treatments.map((t) => t.categoria))).sort((a, b) => a.localeCompare(b, 'es'))],
    [treatments],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return treatments.filter((t) => {
      if (cat !== 'Todas' && t.categoria !== cat) return false;
      if (!q) return true;
      return (
        t.nombre.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q) ||
        (t.subcategoria ?? '').toLowerCase().includes(q)
      );
    });
  }, [search, cat, treatments]);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', display: 'flex' }}>
              <Icon name="help" size={15} />
            </span>
            <input className="input" style={{ paddingLeft: 34 }} placeholder="Buscar tratamiento..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto', minWidth: 180 }} value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c === 'Todas' ? 'Todas las categorías' : c}</option>)}
          </select>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted-2)', marginBottom: 12 }}>
          {filtered.length} de {treatments.length} tratamientos
        </div>

        <div className="grid-cards">
          {filtered.map((t) => (
            <div key={t.id} onClick={() => setSelected(t)} className="card card-hover" style={{ padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <span className="badge" style={{ marginBottom: 6, fontSize: 10.5 }}>{t.categoria}</span>
                  <h3 style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{t.nombre}</h3>
                </div>
                {t.requiereEvaluacion && (
                  <span className="badge badge-green" style={{ flexShrink: 0, fontSize: 10, whiteSpace: 'nowrap' }}>Req. Eval.</span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.descripcion}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{priceRange(t.valorDesde, t.valorHasta)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>{t.duracion} · {t.sesiones}</div>
                </div>
                {t.profesional && (
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', background: 'var(--primary-soft)', padding: '3px 9px', borderRadius: 20, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.profesional}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} eyebrow={selected?.subcategoria || selected?.categoria} title={selected?.nombre ?? ''}>
          {selected && (
            <>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{selected.descripcion}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <Stat label="Precio" value={priceRange(selected.valorDesde, selected.valorHasta)} />
                <Stat label="Duración" value={selected.duracion ?? '—'} />
                <Stat label="Sesiones" value={selected.sesiones ?? '—'} />
              </div>
              <div style={{ background: 'var(--primary-soft)', borderRadius: 8, padding: 14 }}>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 5 }}>Profesional</div>
                <div style={{ fontSize: 13.5, color: 'var(--text)' }}>{selected.profesional ?? 'Por confirmar'}</div>
              </div>
              {selected.requiereEvaluacion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: 8, padding: '12px 14px' }}>
                  <span style={{ color: 'var(--primary)', display: 'flex', flexShrink: 0 }}><Icon name="info" size={14} /></span>
                  <span style={{ fontSize: 13, color: '#5A4535' }}>Requiere evaluación previa.</span>
                </div>
              )}
            </>
          )}
        </Modal>
      </div>
    </AsyncState>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12 }}>
      <div className="eyebrow" style={{ color: 'var(--muted-2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}
