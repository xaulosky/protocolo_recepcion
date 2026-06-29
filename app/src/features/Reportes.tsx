import { useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';
import { useResource } from '../lib/useResource';
import { money } from '../lib/format';
import { AsyncState } from '../components/AsyncState';
import { ETAPA_LABEL, ETAPA_STYLE, ETAPAS_ORDEN } from './cirugias/cirugiasStyles';
import type { CirugiaListItem, GiftCard, SolicitudReembolso, EtapaCirugia } from '../lib/types';

interface Stats {
  treatments: number;
  professionals: number;
  products: number;
  consents: number;
  consultations: number;
  scripts: number;
  protocols: number;
}

interface Task { id: string; etapa?: string; estado?: string; createdAt: string; [key: string]: unknown }

function cutoff(periodo: '7d' | '30d' | '90d' | 'total'): Date | null {
  if (periodo === 'total') return null;
  const days = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>{sub}</span>}
    </div>
  );
}

function EtapaBar({ etapa, count, total }: { etapa: EtapaCirugia; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const style = ETAPA_STYLE[etapa];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'var(--text)', width: 140, flexShrink: 0 }}>{ETAPA_LABEL[etapa]}</span>
      <div style={{ flex: 1, background: 'var(--border-softer)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: style.color, width: `${pct}%`, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', width: 24, textAlign: 'right' }}>{count}</span>
      <span style={{ fontSize: 11, color: 'var(--muted-2)', width: 30 }}>{pct}%</span>
    </div>
  );
}

function PresupuestoCard({ label, count, total, bg, color }: { label: string; count: number; total?: number; bg: string; color: string }) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${color}30`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4, background: bg }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color, opacity: 0.8 }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{count}</span>
      {total !== undefined && <span style={{ fontSize: 12, fontWeight: 500, color, opacity: 0.75 }}>{money(total)}</span>}
    </div>
  );
}

function ReembolsoPill({ label, count, bg, color }: { label: string; count: number; bg: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 500, background: bg, color }}>
      <span>{label}</span>
      <span style={{ fontWeight: 700 }}>{count}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '18px 20px' }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  );
}

export function Reportes() {
  const cirugias = useResource<{ cirugias: CirugiaListItem[] }>('/cirugias');
  const giftCards = useResource<{ giftCards: GiftCard[] }>('/gift-cards');
  const reembolsos = useResource<{ reembolsos: SolicitudReembolso[] }>('/reembolsos');
  const tasks = useResource<{ tasks: Task[] }>('/tasks');

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | 'total'>('30d');

  useEffect(() => {
    setStatsLoading(true);
    api.get<{ stats: Stats }>('/data/stats')
      .then((res) => { setStats(res.stats); setStatsError(null); })
      .catch((err) => setStatsError(err?.message ?? 'Error cargando estadísticas'))
      .finally(() => setStatsLoading(false));
  }, []);

  const cirugiasData = cirugias.data?.cirugias ?? [];
  const giftCardsData = giftCards.data?.giftCards ?? [];
  const reembolsosData = reembolsos.data?.reembolsos ?? [];
  const tasksData = tasks.data?.tasks ?? [];

  const isLoading = cirugias.loading || giftCards.loading || reembolsos.loading || tasks.loading;

  const cut = useMemo(() => cutoff(periodo), [periodo]);

  const cirugiasFiltered = useMemo(() => cut ? cirugiasData.filter((c) => new Date(c.createdAt) >= cut) : cirugiasData, [cirugiasData, cut]);
  const reembolsosFiltered = useMemo(() => cut ? reembolsosData.filter((r) => new Date(r.createdAt) >= cut) : reembolsosData, [reembolsosData, cut]);
  const tasksFiltered = useMemo(() => cut ? tasksData.filter((t) => new Date(t.createdAt) >= cut) : tasksData, [tasksData, cut]);
  const gcFiltered = useMemo(() => cut ? giftCardsData.filter((g) => new Date(g.createdAt) >= cut) : giftCardsData, [giftCardsData, cut]);

  const totalActivasCirugias = useMemo(() => cirugiasFiltered.filter((c) => c.etapa !== 'CERRADO').length, [cirugiasFiltered]);
  const giftCardsActivas = useMemo(() => gcFiltered.filter((g) => g.estado === 'ACTIVA').length, [gcFiltered]);
  const reembolsosPendientes = useMemo(() => reembolsosFiltered.filter((r) => r.estado === 'PENDIENTE').length, [reembolsosFiltered]);
  const tareasAbiertas = useMemo(() => tasksFiltered.filter((t) => t.estado !== 'COMPLETADA' && t.estado !== 'CERRADO').length, [tasksFiltered]);

  const revenueAprobado = useMemo(() => {
    return cirugiasFiltered.reduce((sum, c) => {
      const p = c.presupuesto;
      if (p && (p.estado as string).toUpperCase() === 'APROBADO') {
        const subtotal = p.monto ?? 0;
        return sum + Math.round(subtotal * (1 - (p.descuento ?? 0) / 100));
      }
      return sum;
    }, 0);
  }, [cirugiasFiltered]);

  const etapaCounts = useMemo(() => {
    const counts = {} as Record<EtapaCirugia, number>;
    ETAPAS_ORDEN.forEach((e) => { counts[e] = 0; });
    cirugiasFiltered.forEach((c) => { if (c.etapa in counts) counts[c.etapa]++; });
    return counts;
  }, [cirugiasFiltered]);

  const presupuestosStats = useMemo(() => {
    const r = { PENDIENTE: { count: 0, total: 0 }, APROBADO: { count: 0, total: 0 }, RECHAZADO: { count: 0, total: 0 } };
    cirugiasFiltered.forEach((c) => {
      const p = c.presupuesto;
      if (!p) return;
      const k = (p.estado as string).toUpperCase() as keyof typeof r;
      if (k in r) { r[k].count++; r[k].total += p.monto ?? 0; }
    });
    return r;
  }, [cirugiasFiltered]);

  const reembolsoEstados = useMemo(() => {
    const c = { PENDIENTE: 0, EN_REVISION: 0, APROBADO: 0, RECHAZADO: 0 };
    reembolsosFiltered.forEach((r) => { const k = r.estado as keyof typeof c; if (k in c) c[k]++; });
    return c;
  }, [reembolsosFiltered]);

  const periodoLabel = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Reportes & Análisis</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-2)' }}>Resumen operativo de la clínica</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--border-softer)', borderRadius: 8, padding: 3 }}>
          {(['7d', '30d', '90d', 'total'] as const).map((p) => (
            <button key={p} onClick={() => setPeriodo(p)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: periodo === p ? '#fff' : 'transparent', color: periodo === p ? 'var(--text)' : 'var(--muted)', boxShadow: periodo === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all .15s' }}>
              {p === 'total' ? 'Todo' : p === '7d' ? '7 días' : p === '30d' ? '30 días' : '90 días'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        <StatCard label="Cirugías activas" value={isLoading ? '…' : totalActivasCirugias} sub="Sin etapa CERRADO" />
        <StatCard label="Gift Cards activas" value={isLoading ? '…' : giftCardsActivas} sub="Estado ACTIVA" />
        <StatCard label="Reembolsos pendientes" value={isLoading ? '…' : reembolsosPendientes} sub="Estado PENDIENTE" />
        <StatCard label="Tareas abiertas" value={isLoading ? '…' : tareasAbiertas} sub="Sin estado cerrado" />
        <StatCard label="Revenue aprobado" value={isLoading ? '…' : money(revenueAprobado)} sub="Presupuestos aprobados" />
      </div>

      <Section title={`Cirugías por etapa${cut ? ` · últimos ${periodoLabel} días` : ''}`}>
        <AsyncState loading={cirugias.loading} error={cirugias.error}>
          {cirugiasFiltered.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted-2)', textAlign: 'center', padding: '16px 0' }}>Sin cirugías registradas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ETAPAS_ORDEN.map((etapa) => (
                <EtapaBar key={etapa} etapa={etapa} count={etapaCounts[etapa]} total={cirugiasFiltered.length} />
              ))}
            </div>
          )}
        </AsyncState>
      </Section>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Presupuestos de cirugías</h2>
        <AsyncState loading={cirugias.loading} error={cirugias.error}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <PresupuestoCard label="Pendiente" count={presupuestosStats.PENDIENTE.count} total={presupuestosStats.PENDIENTE.total} bg="#FBF5EB" color="#C07B3A" />
            <PresupuestoCard label="Aprobado" count={presupuestosStats.APROBADO.count} total={presupuestosStats.APROBADO.total} bg="#EDF5EF" color="#3A6A4A" />
            <PresupuestoCard label="Rechazado" count={presupuestosStats.RECHAZADO.count} bg="#FBF0F0" color="#9A3A3A" />
          </div>
        </AsyncState>
      </div>

      <Section title="Reembolsos por estado">
        <AsyncState loading={reembolsos.loading} error={reembolsos.error}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <ReembolsoPill label="Pendiente" count={reembolsoEstados.PENDIENTE} bg="#FBF5EB" color="#C07B3A" />
            <ReembolsoPill label="En revisión" count={reembolsoEstados.EN_REVISION} bg="#EBF3FB" color="#2F6B9A" />
            <ReembolsoPill label="Aprobado" count={reembolsoEstados.APROBADO} bg="#EDF5EF" color="#3A6A4A" />
            <ReembolsoPill label="Rechazado" count={reembolsoEstados.RECHAZADO} bg="#FBF0F0" color="#9A3A3A" />
          </div>
        </AsyncState>
      </Section>

      <Section title="Data clínica">
        {statsLoading && <p style={{ fontSize: 13, color: 'var(--muted-2)' }}>Cargando estadísticas…</p>}
        {statsError && <p style={{ fontSize: 13, color: 'var(--orange)' }}>{statsError}</p>}
        {stats && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {([
              ['Tratamientos', stats.treatments],
              ['Profesionales', stats.professionals],
              ['Productos', stats.products],
              ['Consentimientos', stats.consents],
              ['Consultas', stats.consultations],
              ['Scripts', stats.scripts],
              ['Protocolos', stats.protocols],
            ] as [string, number][]).map(([label, val]) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text)' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{val}</span>
                {label}
              </span>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
