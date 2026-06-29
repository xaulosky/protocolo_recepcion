import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useApp, useCopy } from '../store/app-context';
import { clp, fmtDateTime } from '../lib/format';
import { Icon } from '../lib/icons';
import type { GiftCard } from '../lib/types';

function waGiftCard(gc: GiftCard) {
  const msg = `🎁 *Gift Card Clínica Cialo*\n\nPara: *${gc.para}*\nMonto: *$${clp(gc.monto)}*\nCódigo: \`${gc.codigo}\`${gc.mensaje ? `\n\n"${gc.mensaje}"` : ''}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

type EstadoFilter = 'ACTIVA' | 'CANJEADA' | 'ANULADA';

export function GiftCards() {
  const { toast } = useApp();
  const copy = useCopy();

  // Form state
  const [para, setPara] = useState('');
  const [de, setDe] = useState('');
  const [monto, setMonto] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // History state
  const [filtro, setFiltro] = useState<EstadoFilter>('ACTIVA');
  const [busqueda, setBusqueda] = useState('');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Canjear modal state
  const [canjearModal, setCanjearModal] = useState<{ id: string } | null>(null);
  const [notaCanje, setNotaCanje] = useState('');

  const rawMonto = parseFloat((monto || '').replace(/\./g, '')) || 50000;

  async function fetchGiftCards(estado: EstadoFilter, q?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ estado });
      if (q?.trim()) params.set('q', q.trim());
      const data = await api.get<{ giftCards: GiftCard[] }>(`/gift-cards?${params.toString()}`);
      setGiftCards(data.giftCards ?? []);
    } catch {
      toast('Error al cargar gift cards');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGiftCards(filtro, busqueda);
  }, [filtro]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGiftCards(filtro, busqueda);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGuardar() {
    if (!para.trim()) { toast('Ingresa el nombre del destinatario'); return; }
    if (!monto.trim()) { toast('Ingresa el monto'); return; }
    setSaving(true);
    try {
      await api.post('/gift-cards', {
        para: para.trim(),
        de: de.trim() || undefined,
        monto: rawMonto,
        mensaje: msg.trim() || undefined,
      });
      toast('Gift Card guardada correctamente');
      setPara('');
      setDe('');
      setMonto('');
      setMsg('');
      if (filtro === 'ACTIVA') fetchGiftCards('ACTIVA', busqueda);
      else setFiltro('ACTIVA');
    } catch {
      toast('Error al guardar la Gift Card');
    } finally {
      setSaving(false);
    }
  }

  const confirmarCanje = async () => {
    if (!canjearModal) return;
    setActionId(canjearModal.id);
    try {
      await api.patch(`/gift-cards/${canjearModal.id}/canjear`);
      toast('Gift Card canjeada');
      fetchGiftCards(filtro, busqueda);
    } catch {
      toast('Error al canjear');
    } finally {
      setActionId(null);
      setCanjearModal(null);
    }
  };

  async function handleAnular(id: string) {
    if (!confirm('¿Anular esta Gift Card? Esta acción no se puede deshacer.')) return;
    setActionId(id);
    try {
      await api.patch(`/gift-cards/${id}/anular`);
      toast('Gift Card anulada');
      fetchGiftCards(filtro, busqueda);
    } catch {
      toast('Error al anular');
    } finally {
      setActionId(null);
    }
  }

  const estadoColors: Record<EstadoFilter, string> = {
    ACTIVA: 'var(--green)',
    CANJEADA: 'var(--blue)',
    ANULADA: 'var(--red)',
  };

  const estadoLabels: Record<EstadoFilter, string> = {
    ACTIVA: 'Activa',
    CANJEADA: 'Canjeada',
    ANULADA: 'Anulada',
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
      {/* LEFT: Form + Preview */}
      <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Datos de la Gift Card</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Para (destinatario)" value={para} onChange={setPara} placeholder="Nombre del destinatario" />
            <Field label="De (remitente)" value={de} onChange={setDe} placeholder="Con cariño de..." />
            <Field label="Monto (CLP)" value={monto} onChange={setMonto} placeholder="50000" />
            <div>
              <label className="label">Mensaje</label>
              <textarea className="textarea" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Mensaje personalizado..." />
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: 10, opacity: saving ? 0.7 : 1 }}
              onClick={handleGuardar}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Generar y Guardar'}
            </button>
          </div>
        </div>

        {/* Visual card preview */}
        <div style={{ background: 'linear-gradient(135deg,#7C6247 0%,#A88560 55%,#7C6247 100%)', borderRadius: 14, padding: 30, color: '#fff', minHeight: 190, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 130, height: 130, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 110, height: 110, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', opacity: 0.65, marginBottom: 18 }}>Clínica Cialo · Gift Card</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Para</div>
          <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 12 }}>{para || 'Destinatario'}</div>
          <div style={{ fontSize: 25, fontWeight: 700 }}>${clp(rawMonto)}</div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>{msg || 'Disfruta este regalo especial'}</div>
          <div style={{ position: 'absolute', bottom: 18, right: 20, fontSize: 10, opacity: 0.45, letterSpacing: '1px' }}>GC-XXXXX</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 4 }}>Con cariño de:</div>
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 8 }}>{de || 'Remitente'}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>Vigencia: 6 meses desde la emisión · No canjeable por dinero en efectivo</div>
        </div>
      </div>

      {/* RIGHT: History */}
      <div style={{ flex: '1 1 340px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Historial de Gift Cards</div>

          {/* Search */}
          <input
            className="input"
            style={{ marginBottom: 10, fontSize: 12.5 }}
            placeholder="Buscar por destinatario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {(['ACTIVA', 'CANJEADA', 'ANULADA'] as EstadoFilter[]).map((e) => (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1.5px solid ${filtro === e ? estadoColors[e] : 'var(--border)'}`,
                  background: filtro === e ? estadoColors[e] + '18' : 'transparent',
                  color: filtro === e ? estadoColors[e] : 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {estadoLabels[e]}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--muted)', fontSize: 13 }}>Cargando...</div>
          ) : giftCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--muted)', fontSize: 13 }}>
              No hay gift cards {estadoLabels[filtro].toLowerCase()}s
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {giftCards.map((gc) => (
                <GiftCardRow
                  key={gc.id}
                  gc={gc}
                  estadoColor={estadoColors[gc.estado as EstadoFilter]}
                  estadoLabel={estadoLabels[gc.estado as EstadoFilter]}
                  actionId={actionId}
                  onCanjear={() => { setCanjearModal({ id: gc.id }); setNotaCanje(''); }}
                  onAnular={() => handleAnular(gc.id)}
                  onCopyCodigo={() => copy(gc.codigo, 'Código copiado')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Canjear confirmation modal */}
      {canjearModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Confirmar canje</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>¿Confirmas que se canjeó esta Gift Card?</p>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Nota (opcional)</label>
              <input className="input" value={notaCanje} onChange={(e) => setNotaCanje(e.target.value)} placeholder="Ej: Canjeada por Botox labial" />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-soft" onClick={() => setCanjearModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarCanje} disabled={!!actionId}>Confirmar canje</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GiftCardRow({
  gc,
  estadoColor,
  estadoLabel,
  actionId,
  onCanjear,
  onAnular,
  onCopyCodigo,
}: {
  gc: GiftCard;
  estadoColor: string;
  estadoLabel: string;
  actionId: string | null;
  onCanjear: () => void;
  onAnular: () => void;
  onCopyCodigo: () => void;
}) {
  const busy = actionId === gc.id;
  const venceEn = Math.floor((new Date(gc.createdAt).getTime() + 180 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
  const porVencer = gc.estado === 'ACTIVA' && venceEn <= 30 && venceEn >= 0;
  const vencida = gc.estado === 'ACTIVA' && venceEn < 0;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'var(--bg-card, var(--bg))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1px',
              background: 'var(--bg-muted)',
              padding: '2px 9px',
              borderRadius: 6,
              color: 'var(--muted)',
              fontFamily: 'monospace',
            }}
          >
            {gc.codigo}
          </span>
          <button onClick={onCopyCodigo} title="Copiar código" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: 'var(--muted-3)', display: 'flex', alignItems: 'center' }}>
            <Icon name="clip" size={12} />
          </button>
          {gc.estado === 'ACTIVA' && (
            <a href={waGiftCard(gc)} target="_blank" rel="noreferrer" title="Compartir por WhatsApp" style={{ color: '#25D366', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Icon name="msg" size={13} />
            </a>
          )}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: estadoColor,
            background: estadoColor + '18',
            padding: '2px 9px',
            borderRadius: 999,
          }}
        >
          {estadoLabel}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{gc.para}</span>
          {gc.de && (
            <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 6 }}>de {gc.de}</span>
          )}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
          ${clp(gc.monto)}
        </span>
      </div>

      {gc.mensaje && (
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontStyle: 'italic' }}>"{gc.mensaje}"</div>
      )}

      <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>
        Emitida {fmtDateTime(gc.createdAt)}
        {gc.canjeoAt && <> · Canjeada {fmtDateTime(gc.canjeoAt)}</>}
        {gc.creadoPor && <> · por {gc.creadoPor.nombre}</>}
      </div>
      {porVencer && <div style={{ fontSize: 10.5, color: '#C07B3A', fontWeight: 600, marginTop: 2 }}>⚠ Vence en {venceEn} días</div>}
      {vencida && <div style={{ fontSize: 10.5, color: '#C04040', fontWeight: 600, marginTop: 2 }}>⚠ Vencida</div>}

      {gc.estado === 'ACTIVA' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '5px 14px', opacity: busy ? 0.6 : 1 }}
            disabled={busy}
            onClick={onCanjear}
          >
            <Icon name="check-circle" size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Canjear
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '5px 14px', color: 'var(--red)', opacity: busy ? 0.6 : 1 }}
            disabled={busy}
            onClick={onAnular}
          >
            <Icon name="x-circle" size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Anular
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" style={{ padding: '9px 12px' }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
