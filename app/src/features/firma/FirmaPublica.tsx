import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../lib/icons';
import type { FirmaPublicData } from '../../lib/types';

// Cliente público: sin tokens de sesión, va directo a las rutas /firma.
const API = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

async function cargarFirma(token: string): Promise<FirmaPublicData> {
  const r = await fetch(`${API}/firma/${token}`);
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || 'No se pudo cargar el consentimiento');
  return body.firma;
}

async function enviarFirma(token: string, data: { firmaImagen: string; firmanteNombre: string; fotoAuth: boolean }) {
  const r = await fetch(`${API}/firma/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || 'No se pudo registrar la firma');
  return body;
}

// ── Pad de firma (canvas, puntero táctil/mouse, alta densidad) ──

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);
  const [vacio, setVacio] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1A1918';
  }, []);

  const posicion = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const inicio = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = posicion(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const mover = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !last.current) return;
    const p = posicion(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!dirty.current) { dirty.current = true; setVacio(false); }
  };

  const fin = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (dirty.current) onChange(canvasRef.current!.toDataURL('image/png'));
  };

  const limpiar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
    setVacio(true);
    onChange(null);
  };

  return (
    <div>
      <div style={{ position: 'relative', border: '1.5px dashed var(--border-strong)', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={inicio}
          onPointerMove={mover}
          onPointerUp={fin}
          onPointerLeave={fin}
          style={{ width: '100%', height: 180, touchAction: 'none', display: 'block', cursor: 'crosshair' }}
        />
        {vacio && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: 'var(--muted-2)', fontSize: 13.5 }}>
            Dibuja tu firma aquí
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={limpiar}
        style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
      >
        <Icon name="trash" size={14} /> Borrar y volver a firmar
      </button>
    </div>
  );
}

// ── Bloques de UI reutilizables ──

function Marco({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>{children}</div>
    </div>
  );
}

function Cargando() {
  return <Marco><div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 80, fontSize: 14 }}>Cargando consentimiento…</div></Marco>;
}

function Mensaje({ icono, color, titulo, texto }: { icono: string; color: string; titulo: string; texto: string }) {
  return (
    <Marco>
      <div className="card" style={{ padding: 32, textAlign: 'center', marginTop: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-soft)', color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon name={icono} size={28} />
        </div>
        <h1 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{titulo}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{texto}</p>
      </div>
    </Marco>
  );
}

const COLOR: Record<string, string> = { green: 'var(--green)', orange: 'var(--orange)', red: 'var(--red)', primary: 'var(--primary)' };

// ── Página principal ──

export function FirmaPublica() {
  const token = window.location.pathname.replace(/^\/firma\/?/, '').split(/[/?#]/)[0];

  const [data, setData] = useState<FirmaPublicData | null>(null);
  const [cargaError, setCargaError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  // Datos de la firma que llena el paciente.
  const [nombre, setNombre] = useState('');
  const [fotoAuth, setFotoAuth] = useState<boolean | null>(null);
  const [firma, setFirma] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errEnvio, setErrEnvio] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setCargaError('Enlace no válido'); return; }
    cargarFirma(token)
      .then((d) => { setData(d); setNombre(d.paciente); })
      .catch((e) => setCargaError(e.message));
  }, [token]);

  if (cargaError) return <Mensaje icono="xc" color="var(--orange)" titulo="Enlace no disponible" texto={cargaError} />;
  if (!data) return <Cargando />;
  if (data.estado === 'ANULADO') return <Mensaje icono="xc" color="var(--orange)" titulo="Consentimiento anulado" texto="Este consentimiento fue anulado por la clínica. Comunícate con recepción si necesitas firmar uno nuevo." />;
  if (data.estado === 'FIRMADO' || enviado) {
    return <Mensaje icono="check" color="var(--green)" titulo="¡Consentimiento firmado!" texto={`Gracias ${data.paciente}. Tu consentimiento para ${data.tratamiento} quedó registrado correctamente. Puedes cerrar esta página.`} />;
  }

  // Construye los pasos informativos según las secciones que existan.
  const s = data.snapshot;
  const infoSteps = [
    { titulo: 'Declaración', texto: s.introduction, items: null as string[] | null, color: 'primary' },
    s.beneficios.length         ? { titulo: 'Beneficios esperados',          texto: '', items: s.beneficios,         color: 'green'   } : null,
    s.efectosSecundarios.length ? { titulo: 'Posibles efectos y riesgos',    texto: '', items: s.efectosSecundarios, color: 'orange'  } : null,
    s.contraindicaciones.length ? { titulo: 'Contraindicaciones',            texto: '', items: s.contraindicaciones, color: 'red'     } : null,
    s.cuidados.length           ? { titulo: 'Cuidados post-procedimiento',   texto: '', items: s.cuidados,           color: 'primary' } : null,
  ].filter(Boolean) as { titulo: string; texto: string; items: string[] | null; color: string }[];

  const TOTAL = 1 + infoSteps.length + 2; // portada + info + foto + firma
  const esPortada = idx === 0;
  const esFoto = idx === TOTAL - 2;
  const esFirma = idx === TOTAL - 1;
  const infoIdx = idx - 1; // índice dentro de infoSteps

  const avanzar = () => setIdx((i) => Math.min(i + 1, TOTAL - 1));
  const retroceder = () => setIdx((i) => Math.max(i - 1, 0));

  const puedeFirmar = Boolean(firma && nombre.trim().length >= 2 && fotoAuth !== null);

  const firmar = async () => {
    if (!puedeFirmar || !firma) return;
    setEnviando(true);
    setErrEnvio(null);
    try {
      await enviarFirma(token, { firmaImagen: firma, firmanteNombre: nombre.trim(), fotoAuth: fotoAuth! });
      setEnviado(true);
    } catch (e) {
      setErrEnvio(e instanceof Error ? e.message : 'No se pudo registrar la firma');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Marco>
      {/* Encabezado */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <img src="/logo-cialo.png" alt="Clínica Cialo" style={{ height: 40, marginBottom: 10 }} />
        <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1 }}>Consentimiento informado</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{data.tratamiento}</div>
      </div>

      {/* Barra de progreso */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= idx ? 'var(--primary)' : 'var(--border)', transition: 'background .2s' }} />
        ))}
      </div>

      <div className="card" style={{ padding: 24, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginBottom: 10 }}>Paso {idx + 1} de {TOTAL}</div>

        {/* Portada */}
        {esPortada && (
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Hola {data.paciente} 👋</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 18 }}>
              Vas a revisar tu consentimiento informado paso a paso. Léelo con calma; al final podrás firmarlo desde tu teléfono.
            </p>
            <div style={{ background: 'var(--surface-soft)', borderRadius: 10, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['Paciente', data.paciente], ['RUT', data.rut], ['Profesional', data.profesional], ['Fecha', data.fecha]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pasos informativos */}
        {!esPortada && !esFoto && !esFirma && infoSteps[infoIdx] && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: COLOR[infoSteps[infoIdx].color], marginBottom: 14 }}>{infoSteps[infoIdx].titulo}</h2>
            {infoSteps[infoIdx].texto && (
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, textAlign: 'justify' }}>{infoSteps[infoIdx].texto}</p>
            )}
            {infoSteps[infoIdx].items && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {infoSteps[infoIdx].items!.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                    <span style={{ color: COLOR[infoSteps[infoIdx].color], flexShrink: 0, fontWeight: 700 }}>—</span>{it}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Registro fotográfico */}
        {esFoto && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Registro fotográfico</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 18 }}>
              ¿Autorizas el registro fotográfico del procedimiento y su uso con fines médicos, académicos y/o publicitarios, sin revelar tu identidad?
            </p>
            {[['si', true, 'Sí, autorizo el registro fotográfico'], ['no', false, 'No autorizo el registro fotográfico']].map(([k, val, label]) => (
              <button
                key={k as string}
                type="button"
                onClick={() => setFotoAuth(val as boolean)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 10, borderRadius: 10, cursor: 'pointer', fontSize: 14,
                  border: `1.5px solid ${fotoAuth === val ? 'var(--primary)' : 'var(--border)'}`,
                  background: fotoAuth === val ? 'var(--cream)' : 'transparent',
                  color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: fotoAuth === val ? 600 : 400,
                }}
              >
                <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${fotoAuth === val ? 'var(--primary)' : 'var(--border-strong)'}`, background: fotoAuth === val ? 'var(--primary)' : 'transparent' }} />
                {label as string}
              </button>
            ))}
          </div>
        )}

        {/* Firma */}
        {esFirma && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Tu firma</h2>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Confirma tu nombre y dibuja tu firma. Al firmar declaras que leíste y comprendiste este consentimiento.
            </p>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Nombre completo</label>
            <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo" style={{ marginBottom: 16 }} />
            <SignaturePad onChange={setFirma} />
            {errEnvio && (
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--orange)', background: 'var(--danger-soft)', border: '1px solid #F0E0D8', borderRadius: 8, padding: '9px 12px' }}>{errEnvio}</div>
            )}
          </div>
        )}

        {/* Navegación */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          {idx > 0 && (
            <button type="button" className="btn btn-soft" onClick={retroceder} disabled={enviando} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="colL" size={15} /> Atrás
            </button>
          )}
          {!esFirma ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={avanzar}
              disabled={esFoto && fotoAuth === null}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: esFoto && fotoAuth === null ? 0.5 : 1 }}
            >
              {esPortada ? 'Comenzar' : 'Continuar'} <Icon name="colR" size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={firmar}
              disabled={!puedeFirmar || enviando}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: !puedeFirmar || enviando ? 0.5 : 1 }}
            >
              <Icon name="check" size={16} /> {enviando ? 'Firmando…' : 'Firmar y aceptar'}
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: 10.5, color: 'var(--muted-2)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
        Firma electrónica simple · Ley N° 20.584 sobre derechos y deberes en salud · Clínica Cialo
      </p>
    </Marco>
  );
}
