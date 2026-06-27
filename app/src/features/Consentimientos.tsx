import { useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import { Icon } from '../lib/icons';
import type { Consent } from '../lib/types';

// ── Datos del paciente que se llenan antes de imprimir ──

interface FillData {
  nombre: string;
  rut: string;
  profesional: string;
  procedimiento: string;
  fecha: string;
  fotoAuth: 'si' | 'no' | '';
}

const EMPTY: FillData = { nombre: '', rut: '', profesional: '', procedimiento: '', fecha: todayStr(), fotoAuth: '' };

function todayStr() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

// ── Generación del documento imprimible ──

function buildPrintHtml(c: Consent, f: FillData): string {
  const cb = (checked: boolean) =>
    `<span style="display:inline-block;width:14px;height:14px;border:2px solid #1A1918;border-radius:3px;margin-right:6px;vertical-align:middle;background:${checked ? '#1A1918' : 'transparent'};"></span>`;

  const section = (label: string, items?: string[]) =>
    items?.length
      ? `<div class="section"><h3>${label}</h3><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`
      : '';

  const hasContent =
    c.beneficios?.length || c.efectosSecundarios?.length || c.contraindicaciones?.length || c.cuidados?.length;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Consentimiento — ${f.nombre}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Georgia',serif;color:#1A1918;max-width:780px;margin:24px auto;padding:0 28px;line-height:1.65;font-size:13px;}
    .header{text-align:center;padding-bottom:12px;margin-bottom:16px;border-bottom:2.5px solid #7C6247;}
    .header h1{font-size:14px;letter-spacing:2px;color:#7C6247;font-family:Arial,sans-serif;text-transform:uppercase;}
    .header h2{font-size:18px;color:#1A1918;margin-top:4px;font-weight:700;letter-spacing:.5px;}
    .header sub{font-size:11px;color:#888;letter-spacing:.5px;}
    .datos{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;margin:14px 0;padding:12px 16px;background:#FAF8F5;border:1px solid #E8E2D9;border-radius:8px;}
    .dato label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:2px;}
    .dato span{font-size:13.5px;font-weight:600;color:#1A1918;display:block;border-bottom:1px solid #BBA97A;padding-bottom:2px;}
    .dato.full{grid-column:1/-1;}
    .declaration{font-size:13px;line-height:1.7;text-align:justify;margin:12px 0;color:#1A1918;}
    h3{font-size:11.5px;color:#7C6247;text-transform:uppercase;letter-spacing:.8px;margin-top:14px;margin-bottom:6px;border-bottom:1px solid #E8E2D9;padding-bottom:3px;}
    .section{margin-top:10px;}
    ul{margin-left:18px;font-size:12.5px;color:#333;}
    li{margin-bottom:4px;}
    .foto{margin:12px 0;padding:10px 14px;background:#FAF8F5;border:1px solid #E8E2D9;border-radius:8px;}
    .foto h3{margin-top:0;margin-bottom:6px;}
    .foto p{font-size:12.5px;margin-bottom:8px;color:#444;}
    .foto-opts{display:flex;gap:32px;}
    .foto-opts label{font-size:13.5px;display:flex;align-items:center;gap:4px;}
    .sign-section{margin-top:28px;}
    .sign-grid{display:flex;gap:60px;justify-content:space-between;}
    .sign-box{flex:1;text-align:center;}
    .sign-line{border-top:1.5px solid #1A1918;margin-top:44px;padding-top:6px;}
    .sign-name{font-size:12.5px;font-weight:700;color:#1A1918;}
    .sign-role{font-size:11px;color:#888;margin-top:2px;}
    .sign-rut{font-size:11px;color:#555;margin-top:2px;}
    .legal{margin-top:20px;padding-top:10px;border-top:1px solid #ddd;font-size:10px;color:#999;text-align:center;}
    @media print{body{margin:0;padding:0 4mm;} @page{margin:14mm 16mm;size:letter;}}
  </style></head><body>

  <div class="header">
    <h1>Clínica Cialo</h1>
    <h2>${c.title}</h2>
    <sub>${f.fecha}</sub>
  </div>

  <div class="datos">
    <div class="dato"><label>Paciente</label><span>${f.nombre || '___________________________'}</span></div>
    <div class="dato"><label>RUT</label><span>${f.rut || '___________________________'}</span></div>
    <div class="dato"><label>Profesional tratante</label><span>${f.profesional || '___________________________'}</span></div>
    <div class="dato"><label>Fecha</label><span>${f.fecha}</span></div>
    ${f.procedimiento ? `<div class="dato full"><label>Procedimiento</label><span>${f.procedimiento}</span></div>` : ''}
  </div>

  <div class="declaration">
    Yo, <strong>${f.nombre || '___________________________'}</strong>, mayor de edad, titular del RUT <strong>${f.rut || '___________________________'}</strong>,
    declaro que toda la información suministrada es veraz y fidedigna.
    Por medio del presente, autorizo a <strong>Clínica Cialo</strong> y al/la profesional <strong>${f.profesional || '___________________________'}</strong>
    a realizarme el procedimiento indicado, el cual me ha sido explicado de forma clara y comprensible.
  </div>

  <div class="declaration">
    Declaro que comprendo la naturaleza del procedimiento, los resultados esperados, así como las posibles complicaciones y riesgos,
    y que he tenido la oportunidad de realizar todas las preguntas necesarias, recibiendo respuestas satisfactorias.
    ${c.introduction && c.introduction !== consentIntroGenerico(c) ? `<br><br>${c.introduction}` : ''}
  </div>

  ${hasContent ? `
    ${section('Beneficios esperados', c.beneficios)}
    ${section('Posibles efectos secundarios y riesgos', c.efectosSecundarios)}
    ${section('Contraindicaciones informadas', c.contraindicaciones)}
    ${section('Cuidados post-procedimiento', c.cuidados)}
  ` : ''}

  <div class="foto">
    <h3>Registro Fotográfico</h3>
    <p>Autorizo el registro fotográfico de los procedimientos realizados, así como su uso con fines médicos, académicos y/o publicitarios, sin revelar mi identidad:</p>
    <div class="foto-opts">
      <label>${cb(f.fotoAuth === 'si')} <strong>SÍ autorizo</strong></label>
      <label>${cb(f.fotoAuth === 'no')} <strong>NO autorizo</strong></label>
    </div>
  </div>

  <div class="declaration">
    Entiendo que mi decisión respecto al registro fotográfico no afecta la realización del procedimiento.
    Habiendo leído y comprendido la totalidad del presente documento, firmo en señal de conformidad.
  </div>

  <div class="sign-section">
    <div class="sign-grid">
      <div class="sign-box">
        <div class="sign-line">
          <div class="sign-name">${f.nombre || ''}</div>
          <div class="sign-rut">${f.rut ? `RUT ${f.rut}` : ''}</div>
          <div class="sign-role">Firma del/la paciente</div>
        </div>
      </div>
      <div class="sign-box">
        <div class="sign-line">
          <div class="sign-name">${f.profesional || ''}</div>
          <div class="sign-role">Firma del/la profesional</div>
        </div>
      </div>
    </div>
  </div>

  <div class="legal">
    Este documento se emite en conformidad con la Ley N° 20.584 sobre derechos y deberes en salud.
    Clínica Cialo — ${f.fecha}
  </div>

  <script>window.onload = function(){ window.print(); }<\/script>
  </body></html>`;
}

function consentIntroGenerico(c: Consent) {
  return c.id === 'general-esteticos' ? c.introduction : '';
}

function printWithData(c: Consent, f: FillData) {
  const win = window.open('', '_blank', 'width=860,height=960');
  if (!win) return;
  win.document.write(buildPrintHtml(c, f));
  win.document.close();
  win.focus();
}

// ── Modal de llenado ──

function FillModal({ consent, onClose }: { consent: Consent; onClose: () => void }) {
  const [data, setData] = useState<FillData>({
    ...EMPTY,
    procedimiento: consent.treatment,
  });

  const set = (k: keyof FillData, v: string) => setData((d) => ({ ...d, [k]: v }));

  const valid = data.nombre.trim() && data.rut.trim() && data.profesional.trim() && data.fotoAuth !== '';

  const inp: React.CSSProperties = {
    width: '100%', padding: '8px 10px', fontSize: 13.5, border: '1px solid var(--border)',
    borderRadius: 7, outline: 'none', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text)',
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Completar consentimiento</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{consent.treatment}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 4 }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Nombre completo del paciente *</label>
              <input value={data.nombre} onChange={(e) => set('nombre', e.target.value)} style={inp} placeholder="María González Pérez" />
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>RUT *</label>
              <input value={data.rut} onChange={(e) => set('rut', e.target.value)} style={inp} placeholder="12.345.678-9" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Profesional tratante *</label>
              <input value={data.profesional} onChange={(e) => set('profesional', e.target.value)} style={inp} placeholder="Nombre del profesional" />
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Fecha</label>
              <input value={data.fecha} onChange={(e) => set('fecha', e.target.value)} style={inp} placeholder="DD/MM/AAAA" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Procedimiento</label>
            <input value={data.procedimiento} onChange={(e) => set('procedimiento', e.target.value)} style={inp} />
          </div>

          <div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 8 }}>Registro fotográfico *</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {(['si', 'no'] as const).map((val) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                  <div
                    onClick={() => set('fotoAuth', val)}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', border: `2px solid ${data.fotoAuth === val ? 'var(--primary)' : 'var(--border)'}`,
                      background: data.fotoAuth === val ? 'var(--primary)' : 'transparent',
                      cursor: 'pointer', flexShrink: 0, transition: 'all .15s',
                    }}
                  />
                  {val === 'si' ? 'SÍ autorizo registro fotográfico' : 'NO autorizo registro fotográfico'}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14 }}
          >
            Cancelar
          </button>
          <button
            disabled={!valid}
            onClick={() => { printWithData(consent, data); onClose(); }}
            style={{
              flex: 2, padding: '10px', borderRadius: 8, border: 'none',
              background: valid ? 'var(--primary)' : 'var(--border)',
              color: '#fff', cursor: valid ? 'pointer' : 'default', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Icon name="print" size={16} />
            Imprimir consentimiento
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vista previa de secciones ──

const SECTIONS: { key: keyof Consent; label: string; color: string }[] = [
  { key: 'beneficios',         label: 'Beneficios',          color: 'var(--green)'   },
  { key: 'efectosSecundarios', label: 'Riesgos',             color: 'var(--orange)'  },
  { key: 'contraindicaciones', label: 'Contraindicaciones',  color: 'var(--red)'     },
  { key: 'cuidados',           label: 'Cuidados',            color: 'var(--primary)' },
];

// ── Componente principal ──

export function Consentimientos() {
  const [filling, setFilling]  = useState<Consent | null>(null);
  const [preview, setPreview]  = useState<Consent | null>(null);

  const { data, loading, error, reload } = useResource<{ consents: Consent[] }>('/data/consents');
  const consents = data?.consents ?? [];

  return (
    <AsyncState loading={loading} error={error} onRetry={reload}>
      <div className="fade-up">
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))' }}>
          {consents.map((c) => {
            const totalRiesgos = (c.efectosSecundarios?.length ?? 0) + (c.contraindicaciones?.length ?? 0);
            return (
              <div key={c.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, background: 'var(--cream)', border: '1px solid var(--cream-border)',
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)',
                  }}>
                    <Icon name="doc" size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 2 }}>{c.treatment}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: .5 }}>Consentimiento informado</div>
                  </div>
                </div>

                {/* Resumen de secciones */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {SECTIONS.map((s) => {
                    const items = c[s.key] as string[] | undefined;
                    if (!items?.length) return null;
                    return (
                      <span key={s.key} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--surface-soft)', color: s.color, border: '1px solid var(--border-soft)',
                      }}>
                        {items.length} {s.label}
                      </span>
                    );
                  })}
                  {totalRiesgos === 0 && (
                    <span style={{ fontSize: 11, color: 'var(--muted-2)', fontStyle: 'italic' }}>Formulario general</span>
                  )}
                </div>

                {/* Intro recortada */}
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.introduction}
                </p>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => setFilling(c)}
                  >
                    <Icon name="print" size={14} />
                    Completar e imprimir
                  </button>
                  <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => setPreview(c)}>
                    Ver
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de llenado */}
        {filling && <FillModal consent={filling} onClose={() => setFilling(null)} />}

        {/* Modal vista previa */}
        {preview && (
          <div
            onClick={() => setPreview(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 620, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{preview.treatment}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{preview.title}</div>
                </div>
                <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 4, flexShrink: 0 }}>
                  <Icon name="close" size={18} />
                </button>
              </div>

              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 20 }}>{preview.introduction}</p>

              {SECTIONS.map((s) => {
                const items = preview[s.key] as string[] | undefined;
                if (!items?.length) return null;
                return (
                  <div key={s.key} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 8 }}>{s.label}</div>
                    {items.map((it, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 }}>
                        <span style={{ color: s.color, flexShrink: 0, marginTop: 1 }}>•</span>{it}
                      </div>
                    ))}
                  </div>
                );
              })}

              <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => { setPreview(null); setFilling(preview); }}>
                  <Icon name="print" size={14} />
                  Completar e imprimir
                </button>
                <button className="btn btn-soft" onClick={() => setPreview(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AsyncState>
  );
}
