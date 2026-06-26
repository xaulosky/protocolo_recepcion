import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import type { Consultation } from '../lib/types';

function isGratis(valor: string): boolean {
  return /gratis|gratu|^\$?\s*0$/i.test(valor.trim());
}

export function Consultas() {
  const { data, loading, error, reload } = useResource<{ consultations: Consultation[] }>('/data/consultations');
  const consultations = data?.consultations ?? [];

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div className="grid-cards">
          {consultations.map((c) => {
            const profs = c.profesionales ?? [];
            const profLabel = profs.length ? profs.map((p) => p.nombre).join(', ') : '—';
            const gratis = isGratis(c.valor);
            return (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
                    {c.emoji ? `${c.emoji} ` : ''}{c.nombre}
                  </h3>
                  {gratis && <span className="badge badge-green" style={{ flexShrink: 0 }}>Gratuita</span>}
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14 }}>{c.descripcion}</p>
                <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Row label="Valor" value={gratis ? 'Gratuita' : c.valor} strong />
                  {c.duracion && <Row label="Duración" value={c.duracion} />}
                  <Row label="Profesional" value={profLabel} align="right" />
                  {c.reembolsable && <Row label="Reembolsable" value="Sí" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AsyncState>
  );
}

function Row({ label, value, strong, align }: { label: string; value: string; strong?: boolean; align?: 'right' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--muted-2)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: strong ? 13 : 12.5, fontWeight: strong ? 600 : 400, color: strong ? 'var(--text)' : 'var(--text-2)', textAlign: align }}>{value}</span>
    </div>
  );
}
