import { useApp } from '../store/app-context';
import { useAuth } from '../store/auth-context';
import type { ViewId } from '../lib/nav';
import { Icon } from '../lib/icons';
import type { IconName } from '../lib/icons';
import { useResource } from '../lib/useResource';
import { AsyncState } from '../components/AsyncState';
import { colorFromString } from '../lib/format';
import { useTareas, ETAPAS, ETAPA_LABEL } from './tareas/useTareas';

interface Stats {
  treatments: number; professionals: number; products: number;
  consents: number; consultations: number; scripts: number; protocols: number;
}

export function Dashboard() {
  const { go } = useApp();
  const { user } = useAuth();
  const { data, loading, error, reload } = useResource<{ stats: Stats }>('/data/stats');
  const { tasks, users } = useTareas();
  const s = data?.stats;

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
