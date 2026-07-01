import { useEffect, useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { useResource } from '../lib/useResource';
import { api } from '../lib/api';
import { useCopy } from '../store/app-context';
import { Icon } from '../lib/icons';
import type { Consent, SignedConsent, SignedConsentDetail } from '../lib/types';
import { cuidadosPostData } from '../data/cuidadosData';
import type { CuidadoPost } from '../data/cuidadosData';
import { CONTRATO_TITULO, CONTRATO_INTRO, CONTRATO_CLAUSULAS, contratoServiciosHtml } from '../data/contratoServicios';

// ── Datos del paciente que se llenan antes de imprimir/enviar ──

interface FillData {
  nombre: string;
  rut: string;
  profesional: string;
  procedimiento: string;
  fecha: string;
  telefono: string;
  email: string;
}

const EMPTY: FillData = { nombre: '', rut: '', profesional: '', procedimiento: '', fecha: todayStr(), telefono: '', email: '' };

function todayStr() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

/** El consentimiento genérico ya incluye su declaración en `introduction`; evita duplicarla. */
function esIntroGenerica(intro: string) {
  return intro.trim().startsWith('Yo, la persona indicada');
}

// ── Generación del documento imprimible ──

interface FirmaPrint {
  imagen: string;
  firmante: string;
  firmadoAt: string;
  fotoAuth: boolean;
}

function buildPrintHtml(c: Consent, f: FillData, origin: string, firma?: FirmaPrint): string {
  const cb = (checked: boolean) =>
    `<span style="display:inline-block;width:14px;height:14px;border:2px solid #1A1918;border-radius:3px;margin-right:6px;vertical-align:middle;background:${checked ? '#1A1918' : 'transparent'};"></span>`;

  const section = (label: string, items?: string[]) =>
    items?.length
      ? `<div class="section"><h3>${label}</h3><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`
      : '';

  const hasContent =
    c.beneficios?.length || c.efectosSecundarios?.length || c.contraindicaciones?.length || c.cuidados?.length;

  const fa = firma ? firma.fotoAuth : null;

  const firmaPaciente = firma
    ? `<div class="sign-box">
         <div class="firma-img"><img src="${firma.imagen}" alt="Firma" /></div>
         <div class="sign-line nomargin">
           <div class="sign-name">${f.nombre || ''}</div>
           <div class="sign-rut">${f.rut ? `RUT ${f.rut}` : ''}</div>
           <div class="sign-role">Firma paciente · firmado digitalmente</div>
         </div>
       </div>`
    : `<div class="sign-box">
         <div class="sign-line">
           <div class="sign-name">${f.nombre || ''}</div>
           <div class="sign-rut">${f.rut ? `RUT ${f.rut}` : ''}</div>
           <div class="sign-role">Firma paciente</div>
         </div>
       </div>`;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Consentimiento — ${f.nombre}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Georgia',serif;color:#111;max-width:720px;margin:0 auto;padding:0;line-height:1.6;font-size:12.5px;}
    .header{text-align:center;padding:22px 0 16px;margin-bottom:18px;border-bottom:1px solid #111;}
    .header img{height:46px;width:auto;display:block;margin:0 auto 14px;}
    .header h2{font-size:13px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;}
    .header sub{display:block;margin-top:5px;font-size:10.5px;color:#777;letter-spacing:.5px;}
    .datos{display:grid;grid-template-columns:1fr 1fr;gap:14px 36px;margin:18px 0;}
    .dato label{font-size:8.5px;color:#999;text-transform:uppercase;letter-spacing:1.2px;display:block;margin-bottom:4px;font-family:Arial,sans-serif;}
    .dato span{font-size:13px;color:#111;display:block;border-bottom:1px solid #111;padding-bottom:3px;}
    .dato.full{grid-column:1/-1;}
    hr{border:none;border-top:1px solid #ddd;margin:16px 0;}
    .declaration{font-size:12.5px;line-height:1.65;text-align:justify;margin:10px 0;}
    h3{font-size:8.5px;font-family:Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:#111;margin:14px 0 6px;padding-bottom:4px;border-bottom:1px solid #e0e0e0;}
    ul{margin-left:16px;}
    li{margin-bottom:3px;font-size:12px;}
    .foto{margin:14px 0;padding-top:14px;border-top:1px solid #ddd;}
    .foto-label{font-size:8.5px;font-family:Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:#111;margin-bottom:6px;}
    .foto p{font-size:12px;margin-bottom:10px;color:#444;}
    .foto-opts{display:flex;gap:36px;}
    .foto-opts label{font-size:12.5px;display:flex;align-items:center;gap:6px;}
    .sign-section{margin-top:30px;}
    .sign-grid{display:flex;gap:48px;}
    .sign-box{flex:1;}
    .firma-img{height:50px;display:flex;align-items:flex-end;justify-content:center;}
    .firma-img img{max-height:50px;max-width:92%;}
    .sign-line{border-top:1px solid #111;margin-top:40px;padding-top:5px;}
    .sign-line.nomargin{margin-top:2px;}
    .sign-name{font-size:12px;font-weight:700;}
    .sign-role{font-size:10px;color:#999;margin-top:2px;font-family:Arial,sans-serif;}
    .sign-rut{font-size:10px;color:#666;margin-top:1px;}
    .audit{margin-top:16px;font-size:9.5px;color:#888;text-align:center;font-family:Arial,sans-serif;}
    .legal{margin-top:14px;font-size:9px;color:#bbb;text-align:center;}
    @media print{@page{margin:0;size:letter;}body{padding:15mm 18mm;}}
  </style></head><body>

  <div class="header">
    <img src="${origin}/logo-cialo.png" alt="Clínica Cialo" />
    <h2>${c.title}</h2>
    <sub>${f.fecha}</sub>
  </div>

  <div class="datos">
    <div class="dato"><label>Paciente</label><span>${f.nombre || ''}</span></div>
    <div class="dato"><label>RUT</label><span>${f.rut || ''}</span></div>
    <div class="dato"><label>Profesional tratante</label><span>${f.profesional || ''}</span></div>
    <div class="dato"><label>Fecha</label><span>${f.fecha}</span></div>
    ${f.procedimiento ? `<div class="dato full"><label>Procedimiento</label><span>${f.procedimiento}</span></div>` : ''}
  </div>

  <hr/>

  <div class="declaration">
    Yo, <strong>${f.nombre || '___________________________'}</strong>, mayor de edad, titular del RUT <strong>${f.rut || '___________________________'}</strong>,
    declaro que toda la información suministrada es veraz y fidedigna. Por medio del presente, autorizo a <strong>Clínica Cialo</strong>
    y al/la profesional <strong>${f.profesional || '___________________________'}</strong> a realizarme el procedimiento indicado,
    el cual me ha sido explicado de forma clara y comprensible. Declaro que comprendo la naturaleza del procedimiento, los resultados
    esperados, así como las posibles complicaciones y riesgos, y que he tenido la oportunidad de realizar todas las preguntas necesarias,
    recibiendo respuestas satisfactorias.
    ${c.introduction && !esIntroGenerica(c.introduction) ? `<br><br>${c.introduction}` : ''}
  </div>

  ${hasContent ? `
    ${section('Beneficios esperados', c.beneficios)}
    ${section('Posibles efectos secundarios y riesgos', c.efectosSecundarios)}
    ${section('Contraindicaciones informadas', c.contraindicaciones)}
    ${section('Cuidados post-procedimiento', c.cuidados)}
  ` : ''}

  ${contratoServiciosHtml()}

  <div class="foto">
    <div class="foto-label">Registro Fotográfico</div>
    <p>Autorizo el registro fotográfico de los procedimientos realizados y su uso con fines médicos, académicos y/o publicitarios, sin revelar mi identidad:</p>
    <div class="foto-opts">
      <label>${cb(fa === true)} Sí autorizo</label>
      <label>${cb(fa === false)} No autorizo</label>
    </div>
  </div>

  <div class="declaration" style="margin-top:14px;">
    Habiendo leído y comprendido la totalidad del presente documento, firmo en señal de conformidad.
  </div>

  <div class="sign-section">
    <div class="sign-grid">
      ${firmaPaciente}
      <div class="sign-box">
        <div class="sign-line">
          <div class="sign-name">${f.profesional || ''}</div>
          <div class="sign-role">Firma profesional</div>
        </div>
      </div>
    </div>
  </div>

  ${firma ? `<div class="audit">Firmado electrónicamente por ${firma.firmante} el ${firma.firmadoAt}. Firma electrónica simple — Ley N° 19.799.</div>` : ''}

  <div class="legal">Ley N° 20.584 sobre derechos y deberes en salud · Clínica Cialo · ${f.fecha}</div>

  <script>window.onload = function(){ window.print(); }<\/script>
  </body></html>`;
}

/** Abre el HTML en una nueva pestaña usando Blob URL (evita document.write obsoleto). */
function abrirImpresion(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function printWithData(c: Consent, f: FillData) {
  abrirImpresion(buildPrintHtml(c, f, window.location.origin));
}

/** Abre la página de impresión React para un consentimiento firmado. */
function printSigned(d: SignedConsentDetail) {
  window.open(`/imprimir/${d.token}`, '_blank');
}

// ── Utilidades ──

function fmtFecha(iso?: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function normalizarTel(t?: string | null) {
  if (!t) return '';
  let d = t.replace(/\D/g, '');
  if (d.startsWith('56')) return d;
  if (d.length === 9 && d.startsWith('9')) return '56' + d;
  if (d.length === 8) return '569' + d;
  return d;
}

function waLink(tel: string, mensaje: string) {
  const t = normalizarTel(tel);
  return `https://wa.me/${t}?text=${encodeURIComponent(mensaje)}`;
}

function mensajeWa(paciente: string, tratamiento: string, enlace: string) {
  return `Hola ${paciente}, aquí tienes tu consentimiento informado para ${tratamiento}. Por favor revísalo y fírmalo desde tu teléfono en este enlace:\n${enlace}`;
}

// ── Modal: completar datos → imprimir o generar enlace de firma ──

function FillModal({ consent, onClose, onCreated }: { consent: Consent; onClose: () => void; onCreated: () => void }) {
  const [data, setData] = useState<FillData>({ ...EMPTY, procedimiento: consent.treatment });
  const [creando, setCreando] = useState(false);
  const [enlace, setEnlace] = useState<string | null>(null);
  const [firmaId, setFirmaId] = useState<string | null>(null);
  const [emailEstado, setEmailEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle');
  const copy = useCopy();

  const set = (k: keyof FillData, v: string) => setData((d) => ({ ...d, [k]: v }));
  const valid = data.nombre.trim() && data.rut.trim() && data.profesional.trim();

  const inp: React.CSSProperties = {
    width: '100%', padding: '8px 10px', fontSize: 13.5, border: '1px solid var(--border)',
    borderRadius: 7, outline: 'none', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text)',
  };
  const lbl: React.CSSProperties = { fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 };

  const generar = async () => {
    if (!valid) return;
    setCreando(true);
    try {
      const res = await api.post<{ firma: SignedConsent; enlace: string }>('/consentimientos', {
        consentId: consent.id,
        paciente: data.nombre.trim(),
        rut: data.rut.trim(),
        profesional: data.profesional.trim(),
        procedimiento: data.procedimiento.trim() || consent.treatment,
        fecha: data.fecha,
        telefono: data.telefono.trim() || null,
        email: data.email.trim() || null,
      });
      setEnlace(res.enlace);
      setFirmaId(res.firma.id);
      onCreated();
    } catch {
      setCreando(false);
    }
  };

  const enviarEmail = async () => {
    if (!firmaId || !data.email.trim()) return;
    setEmailEstado('enviando');
    try {
      const { sent } = await api.post<{ sent: boolean }>(`/consentimientos/${firmaId}/email`, { email: data.email.trim() });
      setEmailEstado(sent ? 'ok' : 'error');
    } catch {
      setEmailEstado('error');
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
              {enlace ? 'Enlace de firma generado' : 'Completar consentimiento'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{consent.treatment}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 4 }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {!enlace ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Nombre completo del paciente *</label><input value={data.nombre} onChange={(e) => set('nombre', e.target.value)} style={inp} placeholder="María González Pérez" /></div>
                <div><label style={lbl}>RUT *</label><input value={data.rut} onChange={(e) => set('rut', e.target.value)} style={inp} placeholder="12.345.678-9" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Profesional tratante *</label><input value={data.profesional} onChange={(e) => set('profesional', e.target.value)} style={inp} placeholder="Nombre del profesional" /></div>
                <div><label style={lbl}>Fecha</label><input value={data.fecha} onChange={(e) => set('fecha', e.target.value)} style={inp} placeholder="DD/MM/AAAA" /></div>
              </div>
              <div><label style={lbl}>Procedimiento</label><input value={data.procedimiento} onChange={(e) => set('procedimiento', e.target.value)} style={inp} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Teléfono (para WhatsApp)</label><input value={data.telefono} onChange={(e) => set('telefono', e.target.value)} style={inp} placeholder="+56 9 1234 5678" /></div>
                <div><label style={lbl}>Email (opcional)</label><input value={data.email} onChange={(e) => set('email', e.target.value)} style={inp} placeholder="paciente@correo.cl" /></div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button onClick={() => printWithData(consent, data)} disabled={!valid} className="btn btn-soft" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: valid ? 1 : 0.5 }}>
                <Icon name="print" size={15} /> Imprimir
              </button>
              <button onClick={generar} disabled={!valid || creando} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: !valid || creando ? 0.5 : 1 }}>
                <Icon name="pen" size={15} /> {creando ? 'Generando…' : 'Generar enlace de firma'}
              </button>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 12, lineHeight: 1.5 }}>
              «Imprimir» genera el documento para firma presencial. «Generar enlace» crea un link para que el paciente firme desde su teléfono.
            </p>
          </>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: 14, fontWeight: 600, marginBottom: 18 }}>
              <Icon name="check" size={18} /> Enlace listo para {data.nombre}
            </div>

            <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Firma presencial en clínica
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(enlace)}`}
                  alt="QR de firma"
                  width={100} height={100}
                  style={{ borderRadius: 8, flexShrink: 0, background: 'var(--surface)', padding: 4 }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href={enlace} target="_blank" rel="noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none', fontSize: 13.5 }}>
                    <Icon name="pen" size={15} /> Abrir en este dispositivo
                  </a>
                  <p style={{ fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.5, margin: 0 }}>
                    O escanea el QR con el teléfono del paciente.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Enviar al paciente
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input readOnly value={enlace} style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 7, color: 'var(--muted)', background: 'var(--surface)', fontFamily: 'inherit' }} onFocus={(e) => e.target.select()} />
              <button onClick={() => copy(enlace, 'Enlace copiado')} className="btn btn-soft" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="clip" size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              <a href={waLink(data.telefono, mensajeWa(data.nombre, consent.treatment, enlace))} target="_blank" rel="noreferrer"
                className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', color: '#128C7E', fontWeight: 600 }}>
                <Icon name="msg" size={16} /> WhatsApp{data.telefono ? '' : ' (sin número — elegir contacto)'}
              </a>
              <button onClick={enviarEmail} disabled={!data.email.trim() || emailEstado === 'enviando' || emailEstado === 'ok'}
                className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: data.email.trim() ? 1 : 0.5 }}>
                <Icon name="mail" size={16} />
                {emailEstado === 'enviando' ? 'Enviando…' : emailEstado === 'ok' ? 'Correo enviado ✓' : emailEstado === 'error' ? 'No se pudo enviar (reintentar)' : data.email.trim() ? `Email a ${data.email.trim()}` : 'Sin email'}
              </button>
            </div>

            <button onClick={onClose} className="btn btn-soft" style={{ width: '100%' }}>Listo</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Contrato de prestación de servicios (aparece en todos los consentimientos) ──

function ContratoServiciosBox() {
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
        {CONTRATO_TITULO}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>
        {CONTRATO_INTRO}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {CONTRATO_CLAUSULAS.map((c) => (
          <div key={c.id} style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>{c.id}</strong> {c.texto}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Vista previa de secciones (solo lectura) ──

const SECTIONS: { key: keyof Consent; label: string }[] = [
  { key: 'beneficios',         label: 'Beneficios'         },
  { key: 'efectosSecundarios', label: 'Riesgos'            },
  { key: 'contraindicaciones', label: 'Contraindicaciones' },
  { key: 'cuidados',           label: 'Cuidados'           },
];

// ── Helpers de estado ──

const ESTADO_INFO: Record<string, { label: string; color: string; bg: string }> = {
  PENDIENTE: { label: 'Pendiente de firma', color: 'var(--orange)',  bg: 'var(--danger-soft)' },
  FIRMADO:   { label: 'Firmado',            color: 'var(--green)',   bg: 'var(--surface-soft)' },
  ANULADO:   { label: 'Anulado',            color: 'var(--muted-2)', bg: 'var(--surface-soft)' },
};

// ── Modales auxiliares ──

function QrModal({ url, onClose }: { url: string; onClose: () => void }) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(url)}`;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 28, textAlign: 'center', maxWidth: 300, width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>QR de firma</div>
        <img src={qrSrc} alt="QR Code" width={220} height={220} style={{ display: 'block', margin: '0 auto', borderRadius: 8 }} />
        <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 12, wordBreak: 'break-all' }}>{url}</div>
        <button onClick={onClose} className="btn btn-soft" style={{ marginTop: 16, width: '100%' }}>Cerrar</button>
      </div>
    </div>
  );
}

function DetalleConsentModal({ item, onClose }: { item: SignedConsent; onClose: () => void }) {
  const est = ESTADO_INFO[item.estado];
  const row = (label: string, value?: string | null) => value ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 10.5, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text)' }}>{value}</div>
    </div>
  ) : null;

  const expirado = item.expiresAt && new Date(item.expiresAt) < new Date() && item.estado === 'PENDIENTE';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Detalle del consentimiento</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{item.paciente}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, color: est.color, background: est.bg, fontWeight: 600 }}>
              {item.firmaManual ? 'Firmado (papel)' : est.label}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 2 }}><Icon name="close" size={17} /></button>
          </div>
        </div>

        {expirado && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid var(--orange)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--orange)' }}>
            El enlace de firma venció el {fmtFecha(item.expiresAt)}. El paciente no puede firmar digitalmente. Puedes anularlo o marcarlo como firmado en papel.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {row('RUT', item.rut)}
          {row('Fecha', item.fecha)}
          {row('Tratamiento', item.titulo)}
          {item.procedimiento !== item.tratamiento && row('Procedimiento', item.procedimiento)}
          {row('Profesional', item.profesional)}
          {row('Email', item.email)}
          {row('Teléfono', item.telefono)}
          {item.emailEnviadoAt && row('Email enviado', fmtFecha(item.emailEnviadoAt))}
          {row('Creado por', item.creadoPor?.nombre)}
          {row('Creado el', fmtFecha(item.createdAt))}
          {item.expiresAt && row('Enlace vence', fmtFecha(item.expiresAt))}
          {item.firmadoAt && row(item.firmaManual ? 'Firmado en papel' : 'Firmado digitalmente', fmtFecha(item.firmadoAt))}
        </div>

        <button onClick={onClose} className="btn btn-soft" style={{ width: '100%' }}>Cerrar</button>
      </div>
    </div>
  );
}

function EditarConsentModal({ item, onClose, onSaved }: { item: SignedConsent; onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState(item.email ?? '');
  const [telefono, setTelefono] = useState(item.telefono ?? '');
  const [fecha, setFecha] = useState(item.fecha);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', fontSize: 13.5, border: '1px solid var(--border)', borderRadius: 7, outline: 'none', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text)' };
  const lbl: React.CSSProperties = { fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 5 };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await api.patch<{ firma: SignedConsent }>(`/consentimientos/${item.id}`, {
        email: email.trim() || null,
        telefono: telefono.trim() || null,
        fecha: fecha.trim() || item.fecha,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
      setGuardando(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Editar datos del envío</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{item.paciente}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 2 }}><Icon name="close" size={17} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={lbl}>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="paciente@correo.cl" type="email" /></div>
          <div><label style={lbl}>Teléfono</label><input value={telefono} onChange={(e) => setTelefono(e.target.value)} style={inp} placeholder="+56 9 1234 5678" /></div>
          <div><label style={lbl}>Fecha del procedimiento</label><input value={fecha} onChange={(e) => setFecha(e.target.value)} style={inp} placeholder="DD/MM/AAAA" /></div>
        </div>

        {error && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--orange)', background: 'var(--danger-soft)', borderRadius: 7, padding: '8px 12px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn btn-soft" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={guardar} disabled={guardando} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: guardando ? 0.6 : 1 }}>
            <Icon name="save" size={14} /> {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VistaFirmadoModal({ id, onClose, onPrint }: { id: string; onClose: () => void; onPrint: (d: SignedConsentDetail) => void }) {
  const [detalle, setDetalle] = useState<SignedConsentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ firma: SignedConsentDetail }>(`/consentimientos/${id}`)
      .then((r) => setDetalle(r.firma))
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, [id]);

  const s = detalle?.snapshot;
  const secciones = s ? [
    { label: 'Beneficios', items: s.beneficios },
    { label: 'Riesgos', items: s.efectosSecundarios },
    { label: 'Contraindicaciones', items: s.contraindicaciones },
    { label: 'Cuidados', items: s.cuidados },
  ].filter((x) => x.items?.length) : [];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 580, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Consentimiento firmado</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{detalle?.titulo ?? '…'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 2 }}><Icon name="close" size={17} /></button>
        </div>

        {!detalle && !error && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>}
        {error && <div style={{ color: 'var(--orange)', fontSize: 13 }}>{error}</div>}

        {detalle && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-soft)', borderRadius: 10, padding: 16, marginBottom: 18 }}>
              {[['Paciente', detalle.paciente], ['RUT', detalle.rut], ['Profesional', detalle.profesional], ['Fecha', detalle.fecha]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>

            {s?.introduction && (
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{s.introduction}</p>
            )}

            {secciones.map((sec) => (
              <div key={sec.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{sec.label}</div>
                {sec.items.map((it, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', gap: 8, marginBottom: 4, lineHeight: 1.55 }}>
                    <span style={{ color: 'var(--border-strong)', flexShrink: 0 }}>—</span>{it}
                  </div>
                ))}
              </div>
            ))}

            <ContratoServiciosBox />

            {detalle.firmaImagen && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Firma del paciente</div>
                <img src={detalle.firmaImagen} alt="Firma" style={{ maxHeight: 80, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', padding: 4 }} />
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  {detalle.firmanteNombre} · {fmtFecha(detalle.firmadoAt)}
                  {detalle.fotoAuth !== null && detalle.fotoAuth !== undefined && (
                    <span style={{ marginLeft: 10 }}>{detalle.fotoAuth ? '✓ Autoriza fotos' : '✗ No autoriza fotos'}</span>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={onClose} className="btn btn-soft" style={{ flex: 1 }}>Cerrar</button>
              <button onClick={() => { onPrint(detalle); onClose(); }} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="print" size={14} /> Imprimir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Lista de envíos (pestaña "Enviados") ──

function Enviados({ refreshKey, onQr, onDetalle, onEditar, onVerFirmado }: {
  refreshKey: number;
  onQr: (url: string) => void;
  onDetalle: (item: SignedConsent) => void;
  onEditar: (item: SignedConsent) => void;
  onVerFirmado: (id: string) => void;
}) {
  const [items, setItems] = useState<SignedConsent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'PENDIENTE' | 'FIRMADO' | 'ANULADO'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [emailEstados, setEmailEstados] = useState<Map<string, 'sending' | 'ok' | 'error'>>(new Map());
  const copy = useCopy();

  const cargar = () => {
    setError(null);
    api.get<{ firmas: SignedConsent[] }>('/consentimientos')
      .then((r) => setItems(r.firmas))
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'));
  };

  useEffect(cargar, [refreshKey]);

  // Auto-refetch al volver al tab
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') cargar(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const anular = async (id: string) => {
    await api.del(`/consentimientos/${id}`).catch(() => {});
    cargar();
  };

  const firmarManual = async (id: string) => {
    await api.post(`/consentimientos/${id}/firmar-manual`, {}).catch(() => {});
    cargar();
  };

  const reenviarEmail = async (id: string, email: string) => {
    setEmailEstados((m) => new Map(m).set(id, 'sending'));
    try {
      await api.post(`/consentimientos/${id}/email`, { email });
      setEmailEstados((m) => new Map(m).set(id, 'ok'));
      cargar();
    } catch {
      setEmailEstados((m) => new Map(m).set(id, 'error'));
    }
  };

  if (error) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--orange)', fontSize: 14 }}>{error}</div>;
  if (!items) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>;

  const q = busqueda.toLowerCase();
  const porEstado = filtroEstado === 'TODOS' ? items : items.filter(i => i.estado === filtroEstado);
  const filtrados = q ? porEstado.filter(i =>
    i.paciente.toLowerCase().includes(q) || i.rut.toLowerCase().includes(q) || i.tratamiento.toLowerCase().includes(q)
  ) : porEstado;

  const conteos = {
    PENDIENTE: items.filter(i => i.estado === 'PENDIENTE').length,
    FIRMADO:   items.filter(i => i.estado === 'FIRMADO').length,
    ANULADO:   items.filter(i => i.estado === 'ANULADO').length,
  };

  if (items.length === 0) return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted-2)' }}>
      <Icon name="pen" size={28} />
      <p style={{ marginTop: 10, fontSize: 14 }}>Aún no has enviado consentimientos a firmar.</p>
      <p style={{ fontSize: 12.5 }}>Genera un enlace desde la pestaña «Consentimientos».</p>
    </div>
  );

  return (
    <>
      {/* Filtros y búsqueda */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', pointerEvents: 'none' }} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, RUT o tratamiento…"
            style={{ width: '100%', padding: '7px 10px 7px 32px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['TODOS', 'PENDIENTE', 'FIRMADO', 'ANULADO'] as const).map((e) => (
            <button key={e} className={`chip${filtroEstado === e ? ' active' : ''}`} onClick={() => setFiltroEstado(e)}>
              {e === 'TODOS' ? `Todos (${items.length})` : e === 'PENDIENTE' ? `Pendientes (${conteos.PENDIENTE})` : e === 'FIRMADO' ? `Firmados (${conteos.FIRMADO})` : `Anulados (${conteos.ANULADO})`}
            </button>
          ))}
        </div>
        <button onClick={cargar} className="btn btn-soft" title="Actualizar lista" style={{ padding: '6px 10px', flexShrink: 0 }}>
          <Icon name="ref" size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtrados.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-2)', fontSize: 14 }}>
            {busqueda ? `Sin resultados para "${busqueda}"` : 'Sin resultados para este filtro.'}
          </div>
        )}
        {filtrados.map((it) => {
          const est = ESTADO_INFO[it.estado];
          const enlace = `${window.location.origin}/firma/${it.token}`;
          const dias = diasDesde(it.createdAt);
          const esViejo = it.estado === 'PENDIENTE' && dias >= 3;
          const expirado = it.expiresAt && new Date(it.expiresAt) < new Date() && it.estado === 'PENDIENTE';
          const emailEst = emailEstados.get(it.id);
          const tieneEmail = !!it.email;

          return (
            <div key={it.id} className="card" style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', borderLeft: expirado ? '3px solid var(--orange)' : esViejo ? '3px solid var(--orange)' : '3px solid transparent' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{it.paciente}</span>
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, color: est.color, background: est.bg, fontWeight: 600 }}>
                    {it.firmaManual ? 'Firmado (papel)' : est.label}
                  </span>
                  {expirado && (
                    <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, color: 'var(--orange)', background: 'var(--danger-soft)', fontWeight: 600 }}>Enlace vencido</span>
                  )}
                  {esViejo && !expirado && (
                    <span style={{ fontSize: 10.5, color: 'var(--orange)' }}>hace {dias} días</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {it.tratamiento} · {it.rut}
                  {it.estado === 'FIRMADO' && it.firmadoAt
                    ? ` · firmado ${fmtFecha(it.firmadoAt)}`
                    : ` · enviado ${fmtFecha(it.createdAt)}`}
                  {it.emailEnviadoAt && it.estado === 'PENDIENTE' && (
                    <span style={{ color: 'var(--green)' }}> · email {fmtFecha(it.emailEnviadoAt)}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={() => onDetalle(it)} className="btn btn-soft" title="Ver detalles" style={{ padding: '7px 10px' }}>
                  <Icon name="eye" size={15} />
                </button>

                {it.estado === 'PENDIENTE' && !expirado && (
                  <>
                    <a href={enlace} target="_blank" rel="noreferrer" className="btn btn-primary" title="Abrir para firmar en este dispositivo" style={{ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, textDecoration: 'none' }}>
                      <Icon name="pen" size={14} /> Firmar aquí
                    </a>
                    <button onClick={() => onQr(enlace)} className="btn btn-soft" title="Mostrar QR" style={{ padding: '7px 10px' }}><Icon name="grid" size={15} /></button>
                    <button onClick={() => copy(enlace, 'Enlace copiado')} className="btn btn-soft" title="Copiar enlace" style={{ padding: '7px 10px' }}><Icon name="clip" size={15} /></button>
                    <a href={waLink(it.telefono || '', mensajeWa(it.paciente, it.tratamiento, enlace))} target="_blank" rel="noreferrer" className="btn btn-soft" title="Enviar por WhatsApp" style={{ padding: '7px 10px', display: 'flex', alignItems: 'center' }}><Icon name="msg" size={15} /></a>
                    <button
                      onClick={() => tieneEmail && emailEst !== 'sending' && emailEst !== 'ok' && reenviarEmail(it.id, it.email!)}
                      className="btn btn-soft"
                      title={tieneEmail ? `Reenviar email a ${it.email}` : 'Sin email registrado'}
                      disabled={!tieneEmail || emailEst === 'sending' || emailEst === 'ok'}
                      style={{ padding: '7px 10px', color: emailEst === 'ok' ? 'var(--green)' : emailEst === 'error' ? 'var(--orange)' : tieneEmail ? 'inherit' : 'var(--muted-2)', opacity: tieneEmail ? 1 : 0.4 }}
                    >
                      <Icon name={emailEst === 'ok' ? 'check' : 'mail'} size={15} />
                    </button>
                    <button onClick={() => onEditar(it)} className="btn btn-soft" title="Editar email, teléfono o fecha" style={{ padding: '7px 10px' }}><Icon name="edit" size={15} /></button>
                  </>
                )}

                {it.estado === 'PENDIENTE' && (
                  <>
                    <button
                      onClick={() => { if (confirm(`¿Marcar como firmado en papel para ${it.paciente}?`)) firmarManual(it.id); }}
                      className="btn btn-soft"
                      title="Marcar como firmado en papel"
                      style={{ padding: '7px 10px', color: 'var(--green)' }}
                    >
                      <Icon name="file" size={15} />
                    </button>
                    <button onClick={() => { if (confirm(`¿Anular el consentimiento de ${it.paciente}?`)) anular(it.id); }} className="btn btn-soft" title="Anular" style={{ padding: '7px 10px', color: 'var(--orange)' }}>
                      <Icon name="trash" size={15} />
                    </button>
                  </>
                )}

                {it.estado === 'FIRMADO' && (
                  <button onClick={() => onVerFirmado(it.id)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Icon name="eye" size={14} /> Ver firmado
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </>
  );
}

// ── Cuidados post-tratamiento ──

function buildCuidadoPrintHtml(c: CuidadoPost, paciente: string, fecha: string): string {
  const sectionsHtml = c.secciones.map((s) => {
    const esAlerta = s.titulo.includes('ALERTA');
    return `<div class="section${esAlerta ? ' alert-section' : ''}">
      <h3>${s.titulo}</h3>
      <ul>${s.items.map((i) => `<li>${i}</li>`).join('')}</ul>
    </div>`;
  }).join('');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${c.titulo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Georgia',serif;color:#111;max-width:720px;margin:0 auto;padding:20px;line-height:1.6;font-size:12.5px;}
    .header{text-align:center;padding:22px 0 16px;margin-bottom:18px;border-bottom:1px solid #111;}
    .header img{height:46px;width:auto;display:block;margin:0 auto 14px;}
    .header h2{font-size:13px;font-family:Arial,sans-serif;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;}
    .patient-info{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;padding:14px;border:1px solid #ddd;border-radius:6px;font-size:12px;}
    .patient-info label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px;display:block;}
    .patient-info .val{border-bottom:1px solid #ccc;padding-bottom:2px;margin-top:2px;min-height:18px;}
    .intro{font-size:12.5px;color:#333;line-height:1.7;margin-bottom:20px;padding:12px 14px;background:#f9f9f9;border-left:3px solid #7C6247;border-radius:4px;}
    .section{margin-bottom:16px;}
    .section h3{font-size:11px;font-family:Arial,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#1A1918;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee;}
    .section ul{padding-left:18px;}
    .section ul li{margin-bottom:4px;font-size:12px;line-height:1.6;color:#333;}
    .alert-section h3{color:#c0392b;}
    .alert-section ul li{color:#c0392b;}
    .sign-section{margin-top:28px;padding-top:16px;border-top:1px solid #111;display:flex;gap:40px;}
    .sign-line{flex:1;}
    .sign-line .line{border-bottom:1px solid #555;height:36px;margin-bottom:5px;}
    .sign-line .lbl{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px;}
    @media print{@page{margin:0;size:A4;}body{padding:15mm 12mm;}}
  </style>
  </head><body>
  <div class="header">
    <img src="/logo-cialo.png" alt="Clínica Cialo" onerror="this.style.display='none'" />
    <h2>${c.titulo}</h2>
  </div>
  <div class="patient-info">
    <div><label>Nombre del paciente</label><div class="val">${paciente || ''}</div></div>
    <div><label>Fecha de la sesión</label><div class="val">${fecha || ''}</div></div>
  </div>
  <div class="intro">${c.intro}</div>
  ${sectionsHtml}
  <div class="sign-section">
    <div class="sign-line"><div class="line"></div><div class="lbl">Firma paciente · recibí las indicaciones</div></div>
    <div class="sign-line"><div class="line"></div><div class="lbl">Profesional tratante</div></div>
  </div>
  <script>window.onload=function(){window.print();window.close();}</script>
  </body></html>`;
}

function CuidadoPrintModal({ cuidado, onClose }: { cuidado: CuidadoPost; onClose: () => void }) {
  const [paciente, setPaciente] = useState('');
  const [fecha, setFecha] = useState(todayStr());

  const imprimir = () => {
    abrirImpresion(buildCuidadoPrintHtml(cuidado, paciente, fecha));
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 12, padding: '28px 32px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,.14)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Imprimir hoja de cuidados</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 2 }}><Icon name="close" size={16} /></button>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>{cuidado.tratamiento}</div>
        <div style={{ marginBottom: 12 }}>
          <label className="label">Nombre del paciente</label>
          <input className="input" value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre completo" />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label className="label">Fecha de la sesión</label>
          <input className="input" value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="DD/MM/AAAA" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-soft" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={imprimir}>
            <Icon name="print" size={14} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

function CuidadosTab({ onPrint }: { onPrint: (c: CuidadoPost) => void }) {
  return (
    <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
      {cuidadosPostData.map((c) => (
        <div key={c.id} className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>Cuidados post-tratamiento</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 12 }}>{c.tratamiento}</div>
          <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 16, flex: 1 }}>
            {c.secciones.length} secciones · {c.secciones.reduce((n, s) => n + s.items.length, 0)} indicaciones
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }} onClick={() => onPrint(c)}>
            <Icon name="print" size={13} /> Imprimir
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ──

export function Consentimientos() {
  const [tab, setTab] = useState<'plantillas' | 'cuidados' | 'enviados'>('plantillas');
  const [filling, setFilling] = useState<Consent | null>(null);
  const [preview, setPreview] = useState<Consent | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [printingCuidado, setPrintingCuidado] = useState<CuidadoPost | null>(null);
  // Modales de Enviados — aquí para renderizarlos fuera de .fade-up
  const [detalleItem, setDetalleItem] = useState<SignedConsent | null>(null);
  const [editandoItem, setEditandoItem] = useState<SignedConsent | null>(null);
  const [vistaFirmadoId, setVistaFirmadoId] = useState<string | null>(null);

  const { data, loading, error, reload } = useResource<{ consents: Consent[] }>('/data/consents');
  const consents = data?.consents ?? [];

  const tabBtn = (id: 'plantillas' | 'cuidados' | 'enviados'): React.CSSProperties => ({
    padding: '8px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none',
    color: tab === id ? 'var(--text)' : 'var(--muted-2)',
    borderBottom: `2px solid ${tab === id ? 'var(--primary)' : 'transparent'}`,
  });

  return (
    <>
      <div className="fade-up">
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          <button style={tabBtn('plantillas')} onClick={() => setTab('plantillas')}>Consentimientos</button>
          <button style={tabBtn('cuidados')} onClick={() => setTab('cuidados')}>Post-Tratamiento</button>
          <button style={tabBtn('enviados')} onClick={() => setTab('enviados')}>Enviados a firma</button>
        </div>

        {tab === 'enviados' ? (
          <Enviados
            refreshKey={refreshKey}
            onQr={setQrUrl}
            onDetalle={setDetalleItem}
            onEditar={setEditandoItem}
            onVerFirmado={setVistaFirmadoId}
          />
        ) : tab === 'cuidados' ? (
          <CuidadosTab onPrint={setPrintingCuidado} />
        ) : (
          <AsyncState loading={loading} error={error} onRetry={reload}>
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
              {consents.map((c) => {
                const counts = SECTIONS
                  .map((s) => ({ label: s.label, n: (c[s.key] as string[] | undefined)?.length ?? 0 }))
                  .filter((x) => x.n > 0);
                return (
                  <div key={c.id} className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>Consentimiento informado</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 12 }}>{c.treatment}</div>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 16, flex: 1 }}>
                      {counts.length > 0 ? counts.map((x) => `${x.n} ${x.label}`).join(' · ') : <span style={{ fontStyle: 'italic' }}>Formulario general</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }} onClick={() => setFilling(c)}>
                        <Icon name="pen" size={13} /> Enviar a firmar
                      </button>
                      <button className="btn btn-soft" style={{ flex: 1, fontSize: 13 }} onClick={() => setPreview(c)}>Ver</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </AsyncState>
        )}
      </div>

      {/* Modales fuera del fade-up para evitar que el transform de la animación
          rompa position:fixed */}
      {filling && <FillModal consent={filling} onClose={() => setFilling(null)} onCreated={() => setRefreshKey((k) => k + 1)} />}

      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 12, padding: '28px 32px', width: '100%', maxWidth: 580, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.14)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1.2 }}>Consentimiento informado</div>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 2, flexShrink: 0, lineHeight: 1 }}><Icon name="close" size={16} /></button>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>{preview.treatment}</div>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>{preview.introduction}</p>
            {SECTIONS.map((s) => {
              const sectionItems = preview[s.key] as string[] | undefined;
              if (!sectionItems?.length) return null;
              return (
                <div key={s.key} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>{s.label}</div>
                  {sectionItems.map((it, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', gap: 10, marginBottom: 5 }}>
                      <span style={{ color: 'var(--border-strong)', flexShrink: 0, marginTop: 1 }}>—</span>{it}
                    </div>
                  ))}
                </div>
              );
            })}
            <ContratoServiciosBox />
            <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 18px' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }} onClick={() => { setPreview(null); setFilling(preview); }}>
                <Icon name="pen" size={13} /> Enviar a firmar
              </button>
              <button className="btn btn-soft" style={{ fontSize: 13 }} onClick={() => setPreview(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}
      {printingCuidado && <CuidadoPrintModal cuidado={printingCuidado} onClose={() => setPrintingCuidado(null)} />}
      {detalleItem && <DetalleConsentModal item={detalleItem} onClose={() => setDetalleItem(null)} />}
      {editandoItem && (
        <EditarConsentModal
          item={editandoItem}
          onClose={() => setEditandoItem(null)}
          onSaved={() => { setEditandoItem(null); setRefreshKey((k) => k + 1); }}
        />
      )}
      {vistaFirmadoId && (
        <VistaFirmadoModal
          id={vistaFirmadoId}
          onClose={() => setVistaFirmadoId(null)}
          onPrint={(d) => { printSigned(d); }}
        />
      )}
    </>
  );
}
