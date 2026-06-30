import { useMemo, useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { AsyncState } from '../components/AsyncState';
import { Pagination } from '../components/Pagination';
import { useResource } from '../lib/useResource';
import { Icon } from '../lib/icons';
import { priceRange } from '../lib/format';
import type { Treatment } from '../lib/types';

type SortBy = 'nombre' | 'precio-asc' | 'precio-desc';
type View = 'cards' | 'table';
const PAGE_SIZE = 20;

export function Tratamientos() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [sortBy, setSortBy] = useState<SortBy>('nombre');
  const [view, setView] = useState<View>('cards');
  const [selected, setSelected] = useState<Treatment | null>(null);
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<{ treatments: Treatment[] }>('/data/treatments');
  const treatments = useMemo(() => data?.treatments ?? [], [data]);

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(treatments.map((t) => t.categoria))).sort((a, b) => a.localeCompare(b, 'es'))],
    [treatments],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = treatments.filter((t) => {
      if (cat !== 'Todas' && t.categoria !== cat) return false;
      if (!q) return true;
      return (
        t.nombre.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q) ||
        (t.subcategoria ?? '').toLowerCase().includes(q)
      );
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'precio-asc') return (a.valorDesde ?? 0) - (b.valorDesde ?? 0);
      if (sortBy === 'precio-desc') return (b.valorDesde ?? 0) - (a.valorDesde ?? 0);
      return a.nombre.localeCompare(b.nombre, 'es');
    });
  }, [search, cat, sortBy, treatments]);

  useEffect(() => { setPage(1); }, [search, cat, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', display: 'flex' }}>
              <Icon name="search" size={15} />
            </span>
            <input className="input" style={{ paddingLeft: 34 }} placeholder="Buscar tratamiento..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto', minWidth: 180 }} value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c === 'Todas' ? 'Todas las categorías' : c}</option>)}
          </select>
          <select className="select" style={{ width: 'auto', minWidth: 150 }} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
            <option value="nombre">Nombre A-Z</option>
            <option value="precio-asc">Precio menor primero</option>
            <option value="precio-desc">Precio mayor primero</option>
          </select>
          {/* View toggle */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg-alt)', borderRadius: 8, padding: 3, flexShrink: 0 }}>
            <ViewBtn active={view === 'cards'} onClick={() => setView('cards')} icon="layout-grid" title="Vista cards" />
            <ViewBtn active={view === 'table'} onClick={() => setView('table')} icon="list" title="Vista tabla" />
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted-2)', marginBottom: 12 }}>
          {filtered.length} de {treatments.length} tratamientos
        </div>

        {/* Cards view */}
        {view === 'cards' && (
          <div className="grid-cards">
            {paged.map((t) => (
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
        )}

        {/* Table view */}
        {view === 'table' && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                  <Th>Tratamiento</Th>
                  <Th>Categoría</Th>
                  <Th>Precio</Th>
                  <Th>Duración</Th>
                  <Th>Sesiones</Th>
                  <Th>Profesional</Th>
                  <Th>Eval.</Th>
                </tr>
              </thead>
              <tbody>
                {paged.map((t, i) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(t)}
                    style={{
                      borderBottom: i < paged.length - 1 ? '1px solid var(--border-soft)' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-soft)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '10px 14px', maxWidth: 260 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{t.nombre}</div>
                      {t.subcategoria && <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>{t.subcategoria}</div>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="badge" style={{ fontSize: 11 }}>{t.categoria}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      {priceRange(t.valorDesde, t.valorHasta)}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                      {t.duracion ?? '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>
                      {t.sesiones ?? '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)' }}>
                      {t.profesional ?? '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {t.requiereEvaluacion
                        ? <span style={{ color: 'var(--primary)', display: 'flex', justifyContent: 'center' }}><Icon name="check" size={14} /></span>
                        : <span style={{ color: 'var(--muted-4)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        {/* Detail modal (shared between views) */}
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
              {selected.indicaciones?.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Indicaciones</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {selected.indicaciones.map((ind, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-2)' }}>{ind}</li>)}
                  </ul>
                </div>
              )}
              {selected.contraindicaciones?.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Contraindicaciones</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {selected.contraindicaciones.map((c, i) => <li key={i} style={{ fontSize: 13, color: 'var(--orange)' }}>{c}</li>)}
                  </ul>
                </div>
              )}
              {selected.preTratamiento?.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Pre-tratamiento</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {selected.preTratamiento.map((p, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-2)' }}>{p}</li>)}
                  </ul>
                </div>
              )}
              {selected.postTratamiento?.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Post-tratamiento</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {selected.postTratamiento.map((p, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-2)' }}>{p}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </Modal>
      </div>
    </AsyncState>
  );
}

function ViewBtn({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: string; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer',
        background: active ? 'var(--bg)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--muted-2)',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.12s',
      }}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {children}
    </th>
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
