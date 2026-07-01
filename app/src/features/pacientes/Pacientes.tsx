import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { Icon } from '../../lib/icons';
import { useCopy } from '../../store/app-context';
import type { PacienteResumen, PacienteDetalle, SignedConsent } from '../../lib/types';

// ── Helpers ──

const ESTADO_INFO: Record<string, { label: string; color: string; bg: string }> = {
  PENDIENTE: { label: 'Pendiente de firma', color: 'var(--orange)',  bg: 'var(--danger-soft)' },
  FIRMADO:   { label: 'Firmado',            color: 'var(--green)',   bg: 'var(--surface-soft)' },
  ANULADO:   { label: 'Anulado',            color: 'var(--muted-2)', bg: 'var(--surface-soft)' },
};

function fmtFecha(iso?: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

function iniciales(nombre: string) {
  const parts = nombre.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '·';
}

function normalizarTel(t?: string | null) {
  if (!t) return '';
  let d = t.replace(/\D/g, '');
  if (d.startsWith('56')) return d;
  if (d.length === 9 && d.startsWith('9')) return '56' + d;
  if (d.length === 8) return '569' + d;
  return d;
}

// ── Detalle del paciente (modal con historial) ──

function DetalleModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [data, setData] = useState<PacienteDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'consentimientos' | 'citas' | 'atenciones'>('consentimientos');
  const copy = useCopy();

  useEffect(() => {
    api.get<PacienteDetalle>(`/pacientes/${encodeURIComponent(id)}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'));
  }, [id]);

  const consentimientos = data?.consentimientos ?? [];
  const firmados = consentimientos.filter((c) => c.estado === 'FIRMADO').length;

  const tabBtn = (t: typeof tab, disabled = false): React.CSSProperties => ({
    padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
    border: 'none', background: 'none', color: disabled ? 'var(--muted-2)' : tab === t ? 'var(--text)' : 'var(--muted)',
    borderBottom: `2px solid ${tab === t && !disabled ? 'var(--primary)' : 'transparent'}`, opacity: disabled ? 0.55 : 1,
    display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 14, padding: 0, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>

        {/* Cabecera */}
        <div style={{ padding: '22px 26px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--cream)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                {data ? iniciales(data.paciente.nombre) : '·'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 1 }}>Ficha del paciente</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{data?.paciente.nombre ?? 'Cargando…'}</div>
                {data && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>RUT {data.paciente.rut}</div>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 4 }}><Icon name="close" size={18} /></button>
          </div>

          {/* Contacto rápido */}
          {data && (data.paciente.telefono || data.paciente.email) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {data.paciente.telefono && (
                <a href={`https://wa.me/${normalizarTel(data.paciente.telefono)}`} target="_blank" rel="noreferrer" className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, textDecoration: 'none' }}>
                  <Icon name="phone" size={14} /> {data.paciente.telefono}
                </a>
              )}
              {data.paciente.email && (
                <a href={`mailto:${data.paciente.email}`} className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, textDecoration: 'none' }}>
                  <Icon name="mail" size={14} /> {data.paciente.email}
                </a>
              )}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
            <button style={tabBtn('consentimientos')} onClick={() => setTab('consentimientos')}>
              <Icon name="pen" size={14} /> Consentimientos {consentimientos.length > 0 && <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>({consentimientos.length})</span>}
            </button>
            <button style={tabBtn('citas', true)} disabled title="Próximamente"><Icon name="calendar" size={14} /> Citas</button>
            <button style={tabBtn('atenciones', true)} disabled title="Próximamente"><Icon name="clip" size={14} /> Atenciones</button>
          </div>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '18px 26px 24px', overflowY: 'auto', flex: 1 }}>
          {error && <div style={{ color: 'var(--orange)', fontSize: 13, padding: 12 }}>{error}</div>}
          {!data && !error && <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>}

          {data && tab === 'consentimientos' && (
            <>
              <div style={{ display: 'flex', gap: 14, marginBottom: 16, fontSize: 12.5, color: 'var(--muted)' }}>
                <span><strong style={{ color: 'var(--text)' }}>{consentimientos.length}</strong> en total</span>
                <span><strong style={{ color: 'var(--green)' }}>{firmados}</strong> firmados</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {consentimientos.map((c) => (
                  <ConsentRow key={c.id} c={c} copy={copy} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsentRow({ c, copy }: { c: SignedConsent; copy: (text: string, msg?: string) => void }) {
  const est = ESTADO_INFO[c.estado];
  const enlace = `${window.location.origin}/firma/${c.token}`;
  return (
    <div className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{c.tratamiento}</span>
          <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, color: est.color, background: est.bg, fontWeight: 600 }}>
            {c.firmaManual ? 'Firmado (papel)' : est.label}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          {c.profesional} · {c.estado === 'FIRMADO' && c.firmadoAt ? `firmado ${fmtFecha(c.firmadoAt)}` : `enviado ${fmtFecha(c.createdAt)}`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {c.estado === 'FIRMADO' ? (
          <button onClick={() => window.open(`/imprimir/${c.token}`, '_blank')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Icon name="eye" size={14} /> Ver documento
          </button>
        ) : c.estado === 'PENDIENTE' ? (
          <>
            <a href={enlace} target="_blank" rel="noreferrer" className="btn btn-soft" title="Abrir enlace de firma" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, textDecoration: 'none' }}>
              <Icon name="pen" size={14} /> Firmar
            </a>
            <button onClick={() => copy(enlace, 'Enlace copiado')} className="btn btn-soft" title="Copiar enlace" style={{ padding: '7px 10px' }}><Icon name="copy" size={14} /></button>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ── Vista principal ──

export function Pacientes() {
  const [items, setItems] = useState<PacienteResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const cargar = () => {
    setError(null);
    api.get<{ pacientes: PacienteResumen[] }>('/pacientes')
      .then((r) => setItems(r.pacientes))
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'));
  };

  useEffect(cargar, []);

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    const qRut = q.replace(/[.\-\s]/g, '');
    return items.filter((p) =>
      p.nombre.toLowerCase().includes(q) || p.rut.toLowerCase().replace(/[.\-\s]/g, '').includes(qRut),
    );
  }, [items, busqueda]);

  return (
    <div className="fade-up">
      <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5, maxWidth: 640 }}>
        Pacientes registrados a partir de los consentimientos. Consulta el historial de cada uno.
        Próximamente se sumarán citas e historial de atenciones.
      </p>

      {/* Búsqueda */}
      <div style={{ position: 'relative', maxWidth: 380, marginBottom: 18 }}>
        <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', pointerEvents: 'none' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o RUT…"
          style={{ width: '100%', padding: '9px 12px 9px 34px', fontSize: 13.5, border: '1px solid var(--border)', borderRadius: 9, background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {error && <div style={{ padding: 32, textAlign: 'center', color: 'var(--orange)', fontSize: 14 }}>{error}</div>}
      {!items && !error && <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>}

      {items && items.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted-2)' }}>
          <Icon name="user" size={28} />
          <p style={{ marginTop: 10, fontSize: 14 }}>Aún no hay pacientes registrados.</p>
          <p style={{ fontSize: 12.5 }}>Los pacientes aparecen al enviar consentimientos a firma.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          {filtrados.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-2)', fontSize: 14 }}>
              Sin resultados para «{busqueda}».
            </div>
          )}
          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
            {filtrados.map((p) => (
              <button
                key={p.id}
                onClick={() => setDetalleId(p.id)}
                className="card"
                style={{ padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--cream)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                  {iniciales(p.nombre)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>RUT {p.rut}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.total} consentimiento{p.total !== 1 ? 's' : ''}</span>
                    {p.firmados > 0 && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{p.firmados} firmado{p.firmados !== 1 ? 's' : ''}</span>}
                    {p.pendientes > 0 && <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>{p.pendientes} pendiente{p.pendientes !== 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <Icon name="colR" size={16} style={{ color: 'var(--muted-2)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </>
      )}

      {detalleId && <DetalleModal id={detalleId} onClose={() => setDetalleId(null)} />}
    </div>
  );
}
