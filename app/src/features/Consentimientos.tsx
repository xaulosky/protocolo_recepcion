import { useState } from 'react';
import { Modal } from '../components/Modal';
import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import { Icon } from '../lib/icons';
import type { Consent } from '../lib/types';

const SECTIONS: { key: keyof Consent; label: string }[] = [
  { key: 'beneficios', label: 'Beneficios' },
  { key: 'efectosSecundarios', label: 'Efectos secundarios / Riesgos' },
  { key: 'contraindicaciones', label: 'Contraindicaciones' },
  { key: 'cuidados', label: 'Cuidados' },
];

function printConsent(c: Consent) {
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  const section = (label: string, items?: string[]) =>
    items?.length ? `<h3>${label}</h3><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '';
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${c.title}</title>
    <style>
      body{font-family:'DM Sans',Arial,sans-serif;color:#1A1918;max-width:720px;margin:40px auto;padding:0 24px;line-height:1.6;}
      h1{font-size:20px;border-bottom:2px solid #7C6247;padding-bottom:10px;color:#7C6247;}
      h3{font-size:14px;margin-top:22px;color:#7C6247;text-transform:uppercase;letter-spacing:.5px;}
      p{font-size:13.5px;} ul{font-size:13px;margin-left:18px;}
      .sign{margin-top:60px;display:flex;justify-content:space-between;gap:40px;}
      .sign div{flex:1;border-top:1px solid #1A1918;padding-top:6px;font-size:12px;text-align:center;}
    </style></head><body>
    <h1>${c.title}</h1>
    <p>${c.introduction}</p>
    ${SECTIONS.map((s) => section(s.label, c[s.key] as string[] | undefined)).join('')}
    <div class="sign"><div>Firma del paciente</div><div>Firma del profesional</div></div>
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

export function Consentimientos() {
  const [selected, setSelected] = useState<Consent | null>(null);
  const { data, loading, error, reload } = useResource<{ consents: Consent[] }>('/data/consents');
  const consents = data?.consents ?? [];

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(265px,1fr))' }}>
          {consents.map((c) => (
            <div key={c.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                  <Icon name="doc" size={16} />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.35 }}>{c.treatment}</div>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.introduction}</p>
              <div style={{ marginBottom: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Riesgos informados</div>
                {c.efectosSecundarios.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 3 }}>
                    <span style={{ color: 'var(--orange)', flexShrink: 0 }}>•</span>{r}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => printConsent(c)}>Imprimir</button>
                <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => setSelected(c)}>Vista previa</button>
              </div>
            </div>
          ))}
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} eyebrow={selected?.treatment} title={selected?.title ?? ''}>
          {selected && (
            <>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{selected.introduction}</p>
              {SECTIONS.map((s) => {
                const items = selected[s.key] as string[] | undefined;
                if (!items?.length) return null;
                return (
                  <div key={s.key}>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>{s.label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {items.map((it, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--orange)', flexShrink: 0 }}>•</span>{it}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button className="btn btn-primary" onClick={() => printConsent(selected)}>Imprimir consentimiento</button>
            </>
          )}
        </Modal>
      </div>
    </AsyncState>
  );
}
