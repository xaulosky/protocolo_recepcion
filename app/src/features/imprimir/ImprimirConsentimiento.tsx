import { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

interface ConsentSnapshot {
  introduction: string;
  beneficios: string[];
  efectosSecundarios: string[];
  contraindicaciones: string[];
  cuidados: string[];
}

interface PrintData {
  titulo: string;
  tratamiento: string;
  snapshot: ConsentSnapshot;
  paciente: string;
  rut: string;
  profesional: string;
  procedimiento: string;
  fecha: string;
  estado: string;
  firmadoAt: string | null;
  firmanteNombre: string | null;
  firmaImagen: string | null;
  fotoAuth: boolean | null;
  firmaManual: boolean;
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: 13, height: 13,
      border: '1.5px solid #1A1918', borderRadius: 2,
      marginRight: 6, verticalAlign: 'middle',
      background: checked ? '#1A1918' : 'transparent',
    }} />
  );
}

function SeccionLista({ titulo, items }: { titulo: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{
        fontSize: 8, fontFamily: 'Arial, sans-serif', letterSpacing: 1.5,
        textTransform: 'uppercase', color: '#1A1918', margin: '14px 0 6px',
        paddingBottom: 4, borderBottom: '1px solid #e0e0e0',
      }}>{titulo}</h3>
      <ul style={{ marginLeft: 16, padding: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 3, fontSize: 12 }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function fmtFechaLarga(iso: string | null) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function esIntroGenerica(intro: string) {
  return intro.trim().startsWith('Yo, la persona indicada');
}

function DocumentoConsentimiento({ d }: { d: PrintData }) {
  const s = d.snapshot;
  const firmado = d.estado === 'FIRMADO';
  const hayContenido = s.beneficios.length || s.efectosSecundarios.length ||
    s.contraindicaciones.length || s.cuidados.length;

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#111', maxWidth: 720, margin: '0 auto', padding: '0 0 40px', lineHeight: 1.6, fontSize: 12.5 }}>

      {/* Encabezado */}
      <div style={{ textAlign: 'center', padding: '22px 0 16px', marginBottom: 18, borderBottom: '1px solid #111' }}>
        <img src="/logo-cialo.png" alt="Clínica Cialo" style={{ height: 46, display: 'block', margin: '0 auto 14px' }} />
        <h2 style={{ fontSize: 13, fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', margin: 0 }}>
          {d.titulo}
        </h2>
        <div style={{ marginTop: 5, fontSize: 10.5, color: '#777', letterSpacing: .5 }}>{d.fecha}</div>
      </div>

      {/* Datos del paciente */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 36px', margin: '18px 0' }}>
        {[
          ['Paciente', d.paciente],
          ['RUT', d.rut],
          ['Profesional tratante', d.profesional],
          ['Fecha', d.fecha],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 8.5, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, fontFamily: 'Arial, sans-serif' }}>{label}</div>
            <div style={{ fontSize: 13, color: '#111', borderBottom: '1px solid #111', paddingBottom: 3 }}>{value}</div>
          </div>
        ))}
        {d.procedimiento && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 8.5, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, fontFamily: 'Arial, sans-serif' }}>Procedimiento</div>
            <div style={{ fontSize: 13, color: '#111', borderBottom: '1px solid #111', paddingBottom: 3 }}>{d.procedimiento}</div>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '16px 0' }} />

      {/* Declaración */}
      <p style={{ fontSize: 12.5, lineHeight: 1.65, textAlign: 'justify', margin: '10px 0' }}>
        Yo, <strong>{d.paciente}</strong>, mayor de edad, titular del RUT <strong>{d.rut}</strong>,
        declaro que toda la información suministrada es veraz y fidedigna. Por medio del presente, autorizo a <strong>Clínica Cialo</strong>{' '}
        y al/la profesional <strong>{d.profesional}</strong> a realizarme el procedimiento indicado,
        el cual me ha sido explicado de forma clara y comprensible. Declaro que comprendo la naturaleza del procedimiento, los resultados
        esperados, así como las posibles complicaciones y riesgos, y que he tenido la oportunidad de realizar todas las preguntas necesarias,
        recibiendo respuestas satisfactorias.
        {s.introduction && !esIntroGenerica(s.introduction) && (
          <><br /><br />{s.introduction}</>
        )}
      </p>

      {/* Secciones */}
      {!!hayContenido && (
        <>
          <SeccionLista titulo="Beneficios esperados" items={s.beneficios} />
          <SeccionLista titulo="Posibles efectos secundarios y riesgos" items={s.efectosSecundarios} />
          <SeccionLista titulo="Contraindicaciones informadas" items={s.contraindicaciones} />
          <SeccionLista titulo="Cuidados post-procedimiento" items={s.cuidados} />
        </>
      )}

      {/* Registro fotográfico */}
      <div style={{ margin: '14px 0', paddingTop: 14, borderTop: '1px solid #ddd' }}>
        <div style={{ fontSize: 8.5, fontFamily: 'Arial, sans-serif', letterSpacing: 1.5, textTransform: 'uppercase', color: '#111', marginBottom: 6 }}>
          Registro Fotográfico
        </div>
        <p style={{ fontSize: 12, marginBottom: 10, color: '#444' }}>
          Autorizo el registro fotográfico de los procedimientos realizados y su uso con fines médicos, académicos y/o publicitarios, sin revelar mi identidad:
        </p>
        <div style={{ display: 'flex', gap: 36 }}>
          <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Checkbox checked={d.fotoAuth === true} /> Sí autorizo
          </label>
          <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Checkbox checked={d.fotoAuth === false} /> No autorizo
          </label>
        </div>
      </div>

      <p style={{ fontSize: 12.5, lineHeight: 1.65, textAlign: 'justify', marginTop: 14 }}>
        Habiendo leído y comprendido la totalidad del presente documento, firmo en señal de conformidad.
      </p>

      {/* Firmas */}
      <div style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', gap: 48 }}>
          {/* Firma paciente */}
          <div style={{ flex: 1 }}>
            {firmado && d.firmaImagen ? (
              <>
                <div style={{ height: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 2 }}>
                  <img src={d.firmaImagen} alt="Firma" style={{ maxHeight: 50, maxWidth: '92%' }} />
                </div>
                <div style={{ borderTop: '1px solid #111', paddingTop: 5 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{d.firmanteNombre || d.paciente}</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>RUT {d.rut}</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>
                    {d.firmaManual ? 'Firmado en papel · presencial' : 'Firma paciente · firmado digitalmente'}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ borderTop: '1px solid #111', marginTop: 40, paddingTop: 5 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{d.paciente}</div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>RUT {d.rut}</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>Firma paciente</div>
              </div>
            )}
          </div>

          {/* Firma profesional */}
          <div style={{ flex: 1 }}>
            <div style={{ borderTop: '1px solid #111', marginTop: 40, paddingTop: 5 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{d.profesional}</div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>Firma profesional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auditoría (solo firma digital) */}
      {firmado && !d.firmaManual && d.firmadoAt && (
        <div style={{ marginTop: 16, fontSize: 9.5, color: '#888', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          Firmado electrónicamente por {d.firmanteNombre || d.paciente} el {fmtFechaLarga(d.firmadoAt)}. Firma electrónica simple — Ley N° 19.799.
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 9, color: '#bbb', textAlign: 'center' }}>
        Ley N° 20.584 sobre derechos y deberes en salud · Clínica Cialo · {d.fecha}
      </div>
    </div>
  );
}

export function ImprimirConsentimiento() {
  const token = window.location.pathname.replace(/^\/imprimir\/?/, '').split(/[/?#]/)[0];
  const [data, setData] = useState<PrintData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError('Token no especificado'); return; }
    fetch(`${API}/firma/${token}/imprimir`)
      .then((r) => r.json())
      .then((body) => {
        if (body.error) throw new Error(body.error);
        setData(body.firma);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  // Auto-imprimir cuando los datos estén listos
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [data]);

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#c0392b' }}>
      <p style={{ fontSize: 16 }}>No se pudo cargar el consentimiento</p>
      <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>{error}</p>
    </div>
  );

  if (!data) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#888' }}>
      Cargando…
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        @media screen {
          body { padding: 24px; background: #f5f5f5; }
          .print-doc { background: #fff; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,.12); border-radius: 4px; }
          .no-print { display: block; }
        }
        @media print {
          body { padding: 0; background: #fff; }
          .print-doc { padding: 0; box-shadow: none; }
          .no-print { display: none !important; }
          @page { margin: 15mm 18mm; size: letter; }
        }
      `}</style>

      {/* Barra de control (solo en pantalla) */}
      <div className="no-print" style={{ maxWidth: 720, margin: '0 auto 16px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button
          onClick={() => window.print()}
          style={{ padding: '8px 18px', background: '#7C6247', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 600 }}
        >
          Imprimir
        </button>
        <button
          onClick={() => window.close()}
          style={{ padding: '8px 14px', background: '#eee', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 14 }}
        >
          Cerrar
        </button>
      </div>

      <div className="print-doc">
        <DocumentoConsentimiento d={data} />
      </div>
    </>
  );
}
