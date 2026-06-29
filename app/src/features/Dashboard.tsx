import { useApp } from '../store/app-context';
import { useAuth } from '../store/auth-context';
import type { ViewId } from '../lib/nav';
import { Icon } from '../lib/icons';
import type { IconName } from '../lib/icons';
import { useResource } from '../lib/useResource';
import { AsyncState } from '../components/AsyncState';
import { colorFromString } from '../lib/format';
import { useTareas, ETAPAS, ETAPA_LABEL } from './tareas/useTareas';
import type { CirugiaListItem } from '../lib/types';

interface Stats {
  treatments: number; professionals: number; products: number;
  consents: number; consultations: number; scripts: number; protocols: number;
}

function CommCard({ label, value, sub, to, accent }: { label: string; value: number; sub?: string; to: ViewId; accent: string }) {
  const { go } = useApp();
  return (
    <div onClick={() => go(to)} className="card card-hover" style={{ padding: 16, cursor: 'pointer' }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#C07B3A', fontWeight: 500, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Dashboard() {
  const { go } = useApp();
  const { user } = useAuth();
  const { data, loading, error, reload } = useResource<{ stats: Stats }>('/data/stats');
  const { tasks, users } = useTareas();
  const cirugias   = useResource<{ cirugias: CirugiaListItem[] }>('/cirugias');
  const reembolsos = useResource<{ reembolsos: { estado: string; urgente: boolean }[] }>('/reembolsos');
  const giftcards  = useResource<{ giftCards: { estado: string }[] }>('/gift-cards');
  const s = data?.stats;

  const todoCirugia = cirugias.data?.cirugias ?? [];
  const cirugiasActivas = todoCirugia.filter(c => c.etapa !== 'CERRADO').length;
  const reembolsosPend  = (reembolsos.data?.reembolsos ?? []).filter(r => r.estado === 'PENDIENTE').length;
  const reembolsosUrg   = (reembolsos.data?.reembolsos ?? []).filter(r => r.estado === 'PENDIENTE' && r.urgente).length;
  const gcActivas       = (giftcards.data?.giftCards ?? []).filter(g => g.estado === 'ACTIVA').length;

  const ahora = new Date();
  const en7dias = new Date(ahora); en7dias.setDate(ahora.getDate() + 7);
  const proximas = todoCirugia
    .filter(c => c.fechaCirugia && c.etapa !== 'CERRADO')
    .filter(c => { const d = new Date(c.fechaCirugia!); return d >= ahora && d <= en7dias; })
    .sort((a, b) => new Date(a.fechaCirugia!).getTime() - new Date(b.fechaCirugia!).getTime());

  const stats: { n: number; label: string; to: ViewId }[] = s
    ? [
        { n: s.treatments, label: 'Tratamientos', to: 'tratamientos' },
        { n: s.professionals, label: 'Profesionales', to: 'profesionales' },
        { n: s.scripts, label: 'Guiones Técnicos', to: 'guiones' },
        { n: s.protocols, label: 'Protocolos Base', to: 'protocolos' },
        { n: s.products, label: 'Productos', to: 'productos' },
        { n: s.consents, label: 'Consentimientos', to: 'consentimientos' },
      ]
    : [];

  const quick: { label: string; sub: string; icon: IconName; iconBg: string; iconColor: string; to: ViewId }[] = [
    { label: 'Guiones de Atención', sub: `${s?.scripts ?? 0} guiones por categoría`, icon: 'msg', iconBg: '#F5F0E8', iconColor: '#7C6247', to: 'guiones' },
    { label: 'Catálogo Tratamientos', sub: `${s?.treatments ?? 0} prestaciones`, icon: 'act', iconBg: '#EDF5EF', iconColor: '#4A7A5A', to: 'tratamientos' },
    { label: 'Directorio Profesionales', sub: `${s?.professionals ?? 0} fichas`, icon: 'users', iconBg: '#EEF2F7', iconColor: '#4A6A8C', to: 'profesionales' },
    { label: 'Generar Presupuesto', sub: 'Con descuentos y paciente', icon: 'file', iconBg: '#F9F4EE', iconColor: '#8C6A4A', to: 'presupuestos' },
    { label: 'Consentimientos', sub: `${s?.consents ?? 0} formularios imprimibles`, icon: 'pen', iconBg: '#F4EEF9', iconColor: '#6A4A8C', to: 'consentimientos' },
    { label: 'Consultas & Evaluaciones', sub: `${s?.consultations ?? 0} tipos de consulta`, icon: 'clip', iconBg: '#EFF9F4', iconColor: '#4A8C6A', to: 'consultas' },
  ];

  const abiertas = tasks.filter((t) => t.etapa !== 'CERRADO');
  const etapaStats = ETAPAS.filter((e) => e !== 'CERRADO').map((e) => ({ etapa: e, count: abiertas.filter((t) => t.etapa === e).length }));
  const recepStats = users
    .map((u) => ({
      nombre: u.nombre,
      count: abiertas.filter((t) => t.asignadas.some((a) => a.id === u.id)).length,
      urgente: abiertas.filter((t) => t.asignadas.some((a) => a.id === u.id) && t.prioridad === 'URGENTE').length,
    }))
    .filter((r) => r.count > 0);

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 21, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Bienvenida{user ? `, ${user.nombre}` : ''} 👋
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Sistema interno de protocolos y herramientas de Clínica Cialo.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 28 }}>
          {stats.map((st) => (
            <div key={st.label} onClick={() => go(st.to)} className="card card-hover" style={{ padding: 16, cursor: 'pointer' }}>
              <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--primary)', lineHeight: 1 }}>{st.n}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontWeight: 500 }}>{st.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow" style={{ letterSpacing: '0.8px', marginBottom: 10 }}>Estado operativo</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
            <CommCard label="Cirugías activas" value={cirugiasActivas} to="cirugias" accent="var(--primary)" />
            <CommCard label="Reembolsos pendientes" value={reembolsosPend} sub={reembolsosUrg > 0 ? `${reembolsosUrg} urgentes` : undefined} to="reembolso" accent="#C07B3A" />
            <CommCard label="Gift Cards activas" value={gcActivas} to="giftcards" accent="#4A7A5A" />
          </div>
        </div>

        <div className="eyebrow" style={{ letterSpacing: '0.8px', marginBottom: 12 }}>Accesos rápidos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 10 }}>
          {quick.map((q) => (
            <button key={q.label} onClick={() => go(q.to)} className="card card-hover" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', textAlign: 'left' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: q.iconBg, color: q.iconColor }}>
                <Icon name={q.icon} size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{q.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>{q.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {proximas.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="eyebrow" style={{ letterSpacing: '0.8px' }}>Cirugías esta semana</div>
              <button onClick={() => go('cirugias')} style={{ fontSize: 12, color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 500, cursor: 'pointer' }}>Ver todas →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proximas.map((c) => {
                const esHoy = new Date(c.fechaCirugia!).toDateString() === ahora.toDateString();
                return (
                  <div key={c.id} onClick={() => go('cirugias')} className="card card-hover" style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${esHoy ? 'var(--primary)' : 'var(--border-soft)'}` }}>
                    <div style={{ textAlign: 'center', minWidth: 44 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: esHoy ? 'var(--primary)' : 'var(--text)', lineHeight: 1 }}>{new Date(c.fechaCirugia!).getDate()}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase' }}>{new Date(c.fechaCirugia!).toLocaleDateString('es-CL', { month: 'short' })}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.paciente}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{c.tipo}{c.professional ? ` · ${c.professional.nombreCompleto}` : ''}</div>
                    </div>
                    {esHoy && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: 99 }}>HOY</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="eyebrow" style={{ letterSpacing: '0.8px' }}>Tareas activas</div>
            <button onClick={() => go('tareas')} style={{ fontSize: 12, color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 500 }}>Ver todas →</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {etapaStats.map((ds) => (
              <div key={ds.etapa} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', minWidth: 90 }}>
                <div style={{ fontSize: 19, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{ds.count}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{ETAPA_LABEL[ds.etapa]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 8 }}>
            {recepStats.map((dr) => (
              <div key={dr.nombre} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: colorFromString(dr.nombre), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{dr.nombre.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{dr.nombre}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{dr.count} tarea{dr.count === 1 ? '' : 's'}</div>
                  {dr.urgente > 0 && <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 500 }}>{dr.urgente} urgente{dr.urgente === 1 ? '' : 's'}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AsyncState>
  );
}
