import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../components/Modal';
import { Icon } from '../../lib/icons';
import { fmtDate, fmtDateTime, money, clp } from '../../lib/format';
import { useResource } from '../../lib/useResource';
import { api } from '../../lib/api';
import type { Cirugia, Professional, Product, EtapaCirugia, InsumoTipo, CanalComunicacion, PresupuestoEstado, Task, Prioridad, CirugiaActividad } from '../../lib/types';
import type { NuevaCirugia } from './useCirugias';
import {
  ETAPA_LABEL, ETAPA_STYLE, ETAPAS_ORDEN,
  PRESUPUESTO_STYLE,
  CANAL_LABEL, CANAL_ICON,
} from './cirugiasStyles';

const ETAPA_LABEL_BAR: Record<EtapaCirugia, string> = {
  EVALUACION:          'Evaluación',
  PRESUPUESTO_ENVIADO: 'Presupuesto',
  CONFIRMADO:          'Confirmado',
  PREPARACION:         'Preparación',
  EN_EJECUCION:        'En ejecución',
  POST_OPERATORIO:     'Post-op',
  CERRADO:             'Cerrado',
};

type Tab = 'resumen' | 'presupuesto' | 'insumos' | 'tareas' | 'comunicaciones';

interface Props {
  cirugiaId: string | null;
  onClose: () => void;
  onActualizar: (id: string, data: Partial<NuevaCirugia & { etapa: EtapaCirugia }>) => Promise<unknown>;
  onEliminar: (id: string) => Promise<void>;
  upsertPresupuesto: (id: string, data: { monto: number; descuento: number; estado: PresupuestoEstado; enviadoAt?: string | null; notas?: string | null }) => Promise<unknown>;
  agregarInsumo: (id: string, data: { tipo: InsumoTipo; nombre: string; productId?: number | null; cantidad: number; unidad?: string | null }) => Promise<unknown>;
  toggleInsumo: (cirugiaId: string, insumoId: string, listo: boolean) => Promise<void>;
  eliminarInsumo: (cirugiaId: string, insumoId: string) => Promise<void>;
  agregarComunicacion: (id: string, data: { canal: CanalComunicacion; descripcion: string }) => Promise<unknown>;
  eliminarComunicacion: (cirugiaId: string, logId: string) => Promise<void>;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen',         label: 'Resumen' },
  { id: 'presupuesto',     label: 'Presupuesto' },
  { id: 'insumos',         label: 'Insumos' },
  { id: 'tareas',          label: 'Tareas' },
  { id: 'comunicaciones',  label: 'Comunicaciones' },
];

export function CirugiaDetailModal(props: Props) {
  const { cirugiaId, onClose, onActualizar, onEliminar, upsertPresupuesto, agregarInsumo, toggleInsumo, eliminarInsumo, agregarComunicacion, eliminarComunicacion } = props;

  const [cirugia, setCirugia]       = useState<Cirugia | null>(null);
  const [loadingCirugia, setLoading] = useState(false);
  const [tab, setTab]               = useState<Tab>('resumen');
  const [saving, setSaving]         = useState(false);

  const { data: profData }   = useResource<{ professionals: Professional[] }>('/data/professionals');
  const { data: prodData }   = useResource<{ products: Product[] }>('/data/products');
  const profesionales = profData?.professionals ?? [];
  const productos     = prodData?.products ?? [];

  const recargar = useCallback(async () => {
    if (!cirugiaId) return;
    setLoading(true);
    try {
      const { cirugia: data } = await api.get<{ cirugia: Cirugia }>(`/cirugias/${cirugiaId}`);
      setCirugia(data);
    } finally {
      setLoading(false);
    }
  }, [cirugiaId]);

  useEffect(() => {
    if (cirugiaId) { setTab('resumen'); recargar(); }
    else setCirugia(null);
  }, [cirugiaId, recargar]);

  if (!cirugiaId) return null;

  return (
    <Modal open={!!cirugiaId} onClose={onClose} title={cirugia ? `${cirugia.paciente} · ${cirugia.tipo}` : 'Cargando…'} maxWidth={780}>
      {loadingCirugia && !cirugia
        ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Cargando…</div>
        : cirugia
          ? <CirugiaBody
              cirugia={cirugia}
              tab={tab} setTab={setTab}
              saving={saving} setSaving={setSaving}
              profesionales={profesionales} productos={productos}
              onActualizar={async (data) => { await onActualizar(cirugia.id, data); await recargar(); }}
              onEliminar={async () => { await onEliminar(cirugia.id); onClose(); }}
              upsertPresupuesto={async (data) => { await upsertPresupuesto(cirugia.id, data); await recargar(); }}
              agregarInsumo={async (data) => { await agregarInsumo(cirugia.id, data); await recargar(); }}
              toggleInsumo={async (insumoId, listo) => { await toggleInsumo(cirugia.id, insumoId, listo); await recargar(); }}
              eliminarInsumo={async (insumoId) => { await eliminarInsumo(cirugia.id, insumoId); await recargar(); }}
              agregarComunicacion={async (data) => { await agregarComunicacion(cirugia.id, data); await recargar(); }}
              eliminarComunicacion={async (logId) => { await eliminarComunicacion(cirugia.id, logId); await recargar(); }}
            />
          : null}
    </Modal>
  );
}

// ─── Cuerpo principal ────────────────────────────────────────────────────────

interface BodyProps {
  cirugia: Cirugia;
  tab: Tab; setTab: (t: Tab) => void;
  saving: boolean; setSaving: (v: boolean) => void;
  profesionales: Professional[]; productos: Product[];
  onActualizar: (data: Partial<NuevaCirugia & { etapa: EtapaCirugia }>) => Promise<void>;
  onEliminar: () => Promise<void>;
  upsertPresupuesto: (data: { monto: number; descuento: number; estado: PresupuestoEstado; enviadoAt?: string | null; notas?: string | null }) => Promise<void>;
  agregarInsumo: (data: { tipo: InsumoTipo; nombre: string; productId?: number | null; cantidad: number; unidad?: string | null }) => Promise<void>;
  toggleInsumo: (insumoId: string, listo: boolean) => Promise<void>;
  eliminarInsumo: (insumoId: string) => Promise<void>;
  agregarComunicacion: (data: { canal: CanalComunicacion; descripcion: string }) => Promise<void>;
  eliminarComunicacion: (logId: string) => Promise<void>;
}

function CirugiaBody({ cirugia, tab, setTab, saving, setSaving, profesionales, productos, onActualizar, onEliminar, upsertPresupuesto, agregarInsumo, toggleInsumo, eliminarInsumo, agregarComunicacion, eliminarComunicacion }: BodyProps) {
  const etapaActual = ETAPAS_ORDEN.indexOf(cirugia.etapa);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const moverEtapa = async (etapa: EtapaCirugia) => {
    if (etapa === cirugia.etapa) return;
    await onActualizar({ etapa });
  };

  const tabCounts: Partial<Record<Tab, number>> = {
    insumos:        cirugia.insumos.length,
    tareas:         cirugia.tareas.length,
    comunicaciones: cirugia.comunicaciones.length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Barra de etapas — stepper con indicadores */}
      <div className="stage-bar" style={{ gap: 0, marginBottom: 10, paddingBottom: 2, background: 'var(--bg)', borderRadius: 8, padding: '6px 4px' }}>
        {ETAPAS_ORDEN.map((etapa, i) => {
          const isPast    = i < etapaActual;
          const isCurrent = i === etapaActual;
          const st        = ETAPA_STYLE[etapa];
          return (
            <button
              key={etapa}
              onClick={() => moverEtapa(etapa)}
              title={ETAPA_LABEL[etapa]}
              style={{
                flex: 1, minWidth: 68, padding: '6px 4px 5px', border: 'none', cursor: 'pointer',
                textAlign: 'center', borderRadius: 6,
                background: isCurrent ? st.bg : 'transparent',
                borderBottom: isCurrent ? `2px solid ${st.color}` : `2px solid transparent`,
                transition: 'all .15s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', margin: '0 auto 4px',
                background: isCurrent ? st.color : isPast ? `${st.color}28` : 'var(--border-soft)',
                color: isCurrent ? '#fff' : isPast ? st.color : 'var(--muted)',
                fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isPast ? '✓' : i + 1}
              </div>
              <div style={{
                fontSize: 10, fontWeight: isCurrent ? 600 : 400, whiteSpace: 'nowrap',
                color: isCurrent ? st.color : isPast ? 'var(--muted-2)' : 'var(--muted)',
              }}>
                {ETAPA_LABEL_BAR[etapa]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick info strip */}
      {(cirugia.professional || cirugia.fechaCirugia || cirugia.telefono || cirugia.email) && (
        <div style={{ display: 'flex', gap: 14, padding: '8px 2px 10px', marginBottom: 2, flexWrap: 'wrap', borderBottom: '1px solid var(--border-soft)' }}>
          {cirugia.professional && (
            <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--text-2)' }}>
              <Icon name="user" size={12} style={{ color: 'var(--muted-2)', flexShrink: 0 }} />
              {cirugia.professional.nombreCompleto}
            </span>
          )}
          {cirugia.fechaCirugia && (
            <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--text-2)' }}>
              <Icon name="calendar" size={12} style={{ color: 'var(--muted-2)', flexShrink: 0 }} />
              {fmtDate(cirugia.fechaCirugia)}
            </span>
          )}
          {cirugia.telefono && (
            <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--text-2)' }}>
              <Icon name="phone" size={12} style={{ color: 'var(--muted-2)', flexShrink: 0 }} />
              {cirugia.telefono}
            </span>
          )}
          {cirugia.email && (
            <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--text-2)' }}>
              <Icon name="mail" size={12} style={{ color: 'var(--muted-2)', flexShrink: 0 }} />
              {cirugia.email}
            </span>
          )}
        </div>
      )}

      {/* Tab bar con contadores */}
      <div className="tabs-scroll" style={{ borderBottom: '1px solid var(--border-soft)', marginBottom: 16, marginTop: 4 }}>
        {TABS.map((t) => {
          const cnt = tabCounts[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '7px 12px', border: 'none', cursor: 'pointer', fontSize: 13,
                background: 'transparent', color: tab === t.id ? 'var(--primary)' : 'var(--muted)',
                borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                fontWeight: tab === t.id ? 600 : 400, marginBottom: -1,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {t.label}
              {cnt !== undefined && cnt > 0 && (
                <span style={{
                  fontSize: 10, borderRadius: 10, padding: '1px 5px', lineHeight: 1.4,
                  background: tab === t.id ? 'var(--primary)' : 'var(--border-soft)',
                  color: tab === t.id ? '#fff' : 'var(--muted)',
                  fontWeight: 600,
                }}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido del tab */}
      {tab === 'resumen'        && <TabResumen        cirugia={cirugia} profesionales={profesionales} saving={saving} setSaving={setSaving} onActualizar={onActualizar} onEliminar={onEliminar} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} />}
      {tab === 'presupuesto'    && <TabPresupuesto    cirugia={cirugia} saving={saving} setSaving={setSaving} upsertPresupuesto={upsertPresupuesto} />}
      {tab === 'insumos'        && <TabInsumos        cirugia={cirugia} productos={productos} saving={saving} setSaving={setSaving} agregarInsumo={agregarInsumo} toggleInsumo={toggleInsumo} eliminarInsumo={eliminarInsumo} />}
      {tab === 'tareas'         && <TabTareas         cirugia={cirugia} />}
      {tab === 'comunicaciones' && <TabComunicaciones cirugia={cirugia} saving={saving} setSaving={setSaving} agregarComunicacion={agregarComunicacion} eliminarComunicacion={eliminarComunicacion} />}
    </div>
  );
}

// ─── Tab Resumen ─────────────────────────────────────────────────────────────

interface TabResumenProps {
  cirugia: Cirugia; profesionales: Professional[];
  saving: boolean; setSaving: (v: boolean) => void;
  onActualizar: (data: Partial<NuevaCirugia & { etapa: EtapaCirugia }>) => Promise<void>;
  onEliminar: () => Promise<void>;
  confirmDelete: boolean; setConfirmDelete: (v: boolean) => void;
}

function TabResumen({ cirugia, profesionales, saving, setSaving, onActualizar, onEliminar, confirmDelete, setConfirmDelete }: TabResumenProps) {
  const [draft, setDraft] = useState({
    paciente:      cirugia.paciente,
    tipo:          cirugia.tipo,
    telefono:      cirugia.telefono ?? '',
    email:         cirugia.email ?? '',
    notas:         cirugia.notas ?? '',
    fechaCirugia:  cirugia.fechaCirugia ? cirugia.fechaCirugia.slice(0, 16) : '',
    professionalId: cirugia.professional?.id ?? '',
  });

  useEffect(() => {
    setDraft({
      paciente:      cirugia.paciente,
      tipo:          cirugia.tipo,
      telefono:      cirugia.telefono ?? '',
      email:         cirugia.email ?? '',
      notas:         cirugia.notas ?? '',
      fechaCirugia:  cirugia.fechaCirugia ? cirugia.fechaCirugia.slice(0, 16) : '',
      professionalId: cirugia.professional?.id ?? '',
    });
  }, [cirugia]);

  const guardar = async () => {
    setSaving(true);
    try {
      await onActualizar({
        paciente:       draft.paciente || undefined,
        tipo:           draft.tipo || undefined,
        telefono:       draft.telefono || null,
        email:          draft.email || null,
        notas:          draft.notas || null,
        fechaCirugia:   draft.fechaCirugia ? new Date(draft.fechaCirugia).toISOString() : null,
        professionalId: draft.professionalId || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-2">
        <div>
          <label className="label">Paciente</label>
          <input className="input" value={draft.paciente} onChange={(e) => set('paciente', e.target.value)} />
        </div>
        <div>
          <label className="label">Tipo de cirugía</label>
          <input className="input" value={draft.tipo} onChange={(e) => set('tipo', e.target.value)} list="tipos-list-d" />
          <datalist id="tipos-list-d">
            {['Rinoplastia', 'Blefaroplastia', 'Otoplastia', 'Mentoplastia', 'Liposucción', 'Abdominoplastia', 'Mamoplastia', 'Lifting facial', 'Bichectomía'].map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
      </div>
      <div className="form-2">
        <div>
          <label className="label">Teléfono</label>
          <input className="input" value={draft.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="+56 9 0000 0000" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} />
        </div>
      </div>
      <div className="form-2">
        <div>
          <label className="label">Profesional</label>
          <select className="select" value={draft.professionalId} onChange={(e) => set('professionalId', e.target.value)}>
            <option value="">Sin asignar</option>
            {profesionales.map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Fecha de cirugía</label>
          <input type="datetime-local" className="input" value={draft.fechaCirugia} onChange={(e) => set('fechaCirugia', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Notas</label>
        <textarea className="input" rows={3} value={draft.notas} onChange={(e) => set('notas', e.target.value)} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
        {confirmDelete
          ? <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>¿Eliminar esta cirugía?</span>
              <button className="btn" style={{ background: '#C04040', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }} onClick={onEliminar}>Eliminar</button>
              <button className="btn btn-soft" onClick={() => setConfirmDelete(false)}>Cancelar</button>
            </div>
          : <button className="btn btn-soft" style={{ color: 'var(--orange)' }} onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Eliminar
            </button>}
      </div>

      {cirugia.creadoPor && (
        <p style={{ fontSize: 11, color: 'var(--muted-2)', margin: 0 }}>
          Creado por {cirugia.creadoPor.nombre} · {fmtDate(cirugia.createdAt)}
        </p>
      )}
    </div>
  );
}

// ─── Tab Presupuesto ─────────────────────────────────────────────────────────

interface TabPresupuestoProps {
  cirugia: Cirugia; saving: boolean; setSaving: (v: boolean) => void;
  upsertPresupuesto: (data: { monto: number; descuento: number; estado: PresupuestoEstado; enviadoAt?: string | null; notas?: string | null }) => Promise<void>;
}

function TabPresupuesto({ cirugia, saving, setSaving, upsertPresupuesto }: TabPresupuestoProps) {
  const p = cirugia.presupuesto;
  const [draft, setDraft] = useState({
    monto:     p?.monto     ?? 0,
    descuento: p?.descuento ?? 0,
    estado:    (p?.estado   ?? 'PENDIENTE') as PresupuestoEstado,
    enviadoAt: p?.enviadoAt ? p.enviadoAt.slice(0, 16) : '',
    notas:     p?.notas     ?? '',
  });

  useEffect(() => {
    const pp = cirugia.presupuesto;
    setDraft({
      monto:     pp?.monto     ?? 0,
      descuento: pp?.descuento ?? 0,
      estado:    (pp?.estado   ?? 'PENDIENTE') as PresupuestoEstado,
      enviadoAt: pp?.enviadoAt ? pp.enviadoAt.slice(0, 16) : '',
      notas:     pp?.notas     ?? '',
    });
  }, [cirugia.presupuesto]);

  const montoConDesc = Math.round(draft.monto * (1 - draft.descuento / 100));
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const guardar = async () => {
    setSaving(true);
    try {
      await upsertPresupuesto({
        monto:     draft.monto,
        descuento: draft.descuento,
        estado:    draft.estado,
        enviadoAt: draft.enviadoAt ? new Date(draft.enviadoAt).toISOString() : null,
        notas:     draft.notas || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const estSt = PRESUPUESTO_STYLE[draft.estado];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-2">
        <div>
          <label className="label">Monto (CLP)</label>
          <input className="input" type="number" min={0} value={draft.monto} onChange={(e) => set('monto', Number(e.target.value))} placeholder="0" />
        </div>
        <div>
          <label className="label">Descuento (%)</label>
          <input className="input" type="number" min={0} max={100} value={draft.descuento} onChange={(e) => set('descuento', Number(e.target.value))} placeholder="0" />
        </div>
      </div>

      {draft.monto > 0 && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Valor base</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>${clp(draft.monto)}</div>
          </div>
          {draft.descuento > 0 && (
            <>
              <div style={{ color: 'var(--border-soft)', alignSelf: 'center' }}>→</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Total con descuento</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#3A6A4A' }}>{money(montoConDesc)}</div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="form-2">
        <div>
          <label className="label">Estado</label>
          <select className="select" value={draft.estado} onChange={(e) => set('estado', e.target.value as PresupuestoEstado)}
            style={{ background: estSt.bg, color: estSt.color, fontWeight: 500 }}>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>
        <div>
          <label className="label">Fecha de envío</label>
          <input type="datetime-local" className="input" value={draft.enviadoAt} onChange={(e) => set('enviadoAt', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Notas del presupuesto</label>
        <textarea className="input" rows={2} value={draft.notas} onChange={(e) => set('notas', e.target.value)} style={{ resize: 'vertical' }} placeholder="Incluye, excluye, condiciones..." />
      </div>

      <div style={{ paddingTop: 4 }}>
        <button className="btn btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar presupuesto'}</button>
      </div>
    </div>
  );
}

// ─── Tab Insumos ─────────────────────────────────────────────────────────────

interface TabInsumosProps {
  cirugia: Cirugia; productos: Product[]; saving: boolean; setSaving: (v: boolean) => void;
  agregarInsumo: (data: { tipo: InsumoTipo; nombre: string; productId?: number | null; cantidad: number; unidad?: string | null }) => Promise<void>;
  toggleInsumo: (insumoId: string, listo: boolean) => Promise<void>;
  eliminarInsumo: (insumoId: string) => Promise<void>;
}

const EMPTY_INSUMO = { tipo: 'INSUMO' as InsumoTipo, nombre: '', productSearch: '', productId: null as number | null, cantidad: 1, unidad: '' };

function TabInsumos({ cirugia, productos, saving, setSaving, agregarInsumo, toggleInsumo, eliminarInsumo }: TabInsumosProps) {
  const [draft, setDraft] = useState({ ...EMPTY_INSUMO });
  const [addingType, setAddingType] = useState<InsumoTipo | null>(null);

  const filteredProds = productos.filter((p) =>
    draft.productSearch.length > 1 &&
    (`${p.brand} ${p.name}`.toLowerCase().includes(draft.productSearch.toLowerCase()))
  ).slice(0, 8);

  const insumos      = cirugia.insumos.filter((i) => i.tipo === 'INSUMO');
  const instrumental = cirugia.insumos.filter((i) => i.tipo === 'INSTRUMENTAL');

  const agregar = async () => {
    if (!draft.nombre) return;
    setSaving(true);
    try {
      await agregarInsumo({
        tipo:      draft.tipo,
        nombre:    draft.nombre,
        productId: draft.productId,
        cantidad:  draft.cantidad,
        unidad:    draft.unidad || null,
      });
      setDraft({ ...EMPTY_INSUMO, tipo: draft.tipo });
      setAddingType(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['INSUMO', 'INSTRUMENTAL'] as InsumoTipo[]).map((tipo) => (
        <div key={tipo}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {tipo === 'INSUMO' ? 'Insumos / Consumibles' : 'Instrumental quirúrgico'}
            </div>
            <button className="btn btn-soft" style={{ fontSize: 11, padding: '3px 10px' }}
              onClick={() => { setDraft({ ...EMPTY_INSUMO, tipo }); setAddingType(tipo); }}>
              + Agregar
            </button>
          </div>

          {addingType === tipo && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 12, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  value={draft.productSearch || draft.nombre}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDraft((d) => ({ ...d, productSearch: v, nombre: v, productId: null }));
                  }}
                  placeholder="Nombre del insumo o buscar en productos…"
                  autoFocus
                />
                {filteredProds.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 6, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,.08)', maxHeight: 200, overflowY: 'auto' }}>
                    {filteredProds.map((p) => (
                      <div key={p.id} onClick={() => setDraft((d) => ({ ...d, nombre: `${p.brand} ${p.name}`, productId: p.id, productSearch: '' }))}
                        style={{ padding: '7px 12px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid var(--border-soft)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <span style={{ fontWeight: 500 }}>{p.brand}</span> {p.name}
                        <span style={{ color: 'var(--muted)', marginLeft: 6 }}>{money(p.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8 }}>
                <div>
                  <label className="label" style={{ fontSize: 10 }}>Cantidad</label>
                  <input className="input" type="number" min={1} value={draft.cantidad} onChange={(e) => setDraft((d) => ({ ...d, cantidad: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: 10 }}>Unidad</label>
                  <input className="input" value={draft.unidad} onChange={(e) => setDraft((d) => ({ ...d, unidad: e.target.value }))} placeholder="ej: ml, unid, ampollas" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 14px' }} onClick={agregar} disabled={saving || !draft.nombre}>{saving ? '…' : 'Agregar'}</button>
                <button className="btn btn-soft" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setAddingType(null)}>Cancelar</button>
              </div>
            </div>
          )}

          <InsumoList
            items={tipo === 'INSUMO' ? insumos : instrumental}
            onToggle={toggleInsumo}
            onDelete={eliminarInsumo}
          />
        </div>
      ))}
    </div>
  );
}

function InsumoList({ items, onToggle, onDelete }: { items: Cirugia['insumos']; onToggle: (id: string, listo: boolean) => void; onDelete: (id: string) => void }) {
  if (!items.length) return <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Sin elementos.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((i) => (
        <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: i.listo ? '#F6FBF7' : 'var(--bg)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
          <input type="checkbox" checked={i.listo} onChange={(e) => onToggle(i.id, e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
          <span style={{ flex: 1, fontSize: 13, textDecoration: i.listo ? 'line-through' : 'none', color: i.listo ? 'var(--muted)' : 'var(--text)' }}>
            {i.nombre}
            {(i.cantidad > 1 || i.unidad) && (
              <span style={{ color: 'var(--muted)', marginLeft: 6, fontSize: 11 }}>× {i.cantidad}{i.unidad ? ` ${i.unidad}` : ''}</span>
            )}
          </span>
          <button onClick={() => onDelete(i.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 2 }}>
            <Icon name="trash" size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Tab Tareas ───────────────────────────────────────────────────────────────

interface TabTareasProps { cirugia: Cirugia; }

const TIPOS_TAREA = ['Llamar al paciente', 'Confirmar profesional', 'Enviar presupuesto', 'Confirmar fecha', 'Preparar insumos', 'Preparar instrumental', 'Seguimiento post-operatorio', 'Cobro / factura'];

function TabTareas({ cirugia }: TabTareasProps) {
  const [showForm, setShowForm]   = useState(false);
  const [newTarea, setNewTarea]   = useState({ tipo: '', descripcion: '', prioridad: 'NORMAL' as Prioridad, dueAt: '' });
  const [savingT, setSavingT]     = useState(false);
  const [tareas, setTareas]       = useState<Task[]>(cirugia.tareas);

  useEffect(() => { setTareas(cirugia.tareas); }, [cirugia.tareas]);

  const crearTarea = async () => {
    if (!newTarea.tipo || !newTarea.descripcion) return;
    setSavingT(true);
    try {
      const { task } = await api.post<{ task: Task }>('/tasks', {
        tipo:        newTarea.tipo,
        descripcion: newTarea.descripcion,
        prioridad:   newTarea.prioridad,
        dueAt:       newTarea.dueAt ? new Date(newTarea.dueAt).toISOString() : null,
        cirugiaId:   cirugia.id,
        paciente:    cirugia.paciente,
      });
      setTareas((cur) => [...cur, task]);
      setNewTarea({ tipo: '', descripcion: '', prioridad: 'NORMAL', dueAt: '' });
      setShowForm(false);
    } finally {
      setSavingT(false);
    }
  };

  const PRIO_STYLE: Record<Prioridad, { bg: string; color: string }> = {
    BAJA:    { bg: '#EDF5EF', color: '#3A6A4A' },
    NORMAL:  { bg: '#F0F0F0', color: '#606060' },
    URGENTE: { bg: '#FBF5EB', color: '#C07B3A' },
  };

  const ETAPA_ES: Record<string, string> = {
    PENDIENTE: 'Pendiente', ASIGNADO: 'Asignado', EN_PROCESO: 'En proceso', REVISION: 'Revisión', CERRADO: 'Cerrado',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" style={{ fontSize: 12 }} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Nueva tarea'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="form-2" style={{ gap: 8 }}>
            <div>
              <label className="label" style={{ fontSize: 10 }}>Tipo</label>
              <select className="select" value={newTarea.tipo} onChange={(e) => setNewTarea((d) => ({ ...d, tipo: e.target.value }))}>
                <option value="">Seleccionar…</option>
                {TIPOS_TAREA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label" style={{ fontSize: 10 }}>Prioridad</label>
              <select className="select" value={newTarea.prioridad} onChange={(e) => setNewTarea((d) => ({ ...d, prioridad: e.target.value as Prioridad }))}>
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>
          <textarea className="input" rows={2} value={newTarea.descripcion} onChange={(e) => setNewTarea((d) => ({ ...d, descripcion: e.target.value }))} placeholder="Descripción de la tarea…" style={{ resize: 'vertical' }} />
          <div>
            <label className="label" style={{ fontSize: 10 }}>Fecha límite</label>
            <input type="datetime-local" className="input" value={newTarea.dueAt} onChange={(e) => setNewTarea((d) => ({ ...d, dueAt: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 14px' }} onClick={crearTarea} disabled={savingT || !newTarea.tipo || !newTarea.descripcion}>{savingT ? '…' : 'Crear tarea'}</button>
          </div>
        </div>
      )}

      {tareas.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0' }}>Sin tareas vinculadas. Las tareas creadas aquí también aparecerán en el kanban de Tareas.</p>
        : tareas.map((t) => {
            const ps = PRIO_STYLE[t.prioridad];
            return (
              <div key={t.id} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border-soft)', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>{t.tipo}</div>
                  <div style={{ fontSize: 13 }}>{t.descripcion}</div>
                  {t.dueAt && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{fmtDateTime(t.dueAt)}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: ps.bg, color: ps.color }}>{t.prioridad}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: '#F0F0F0', color: '#606060' }}>{ETAPA_ES[t.etapa]}</span>
                </div>
              </div>
            );
          })}
    </div>
  );
}

// ─── Tab Comunicaciones + Actividad ──────────────────────────────────────────

interface TabComunicacionesProps {
  cirugia: Cirugia; saving: boolean; setSaving: (v: boolean) => void;
  agregarComunicacion: (data: { canal: CanalComunicacion; descripcion: string }) => Promise<void>;
  eliminarComunicacion: (logId: string) => Promise<void>;
}

const ACTIVIDAD_ICON: Record<string, string> = {
  ETAPA: 'arrow', PRESUPUESTO: 'tag', INSUMO: 'pkg', TAREA: 'tasks',
};

function TabComunicaciones({ cirugia, saving, setSaving, agregarComunicacion, eliminarComunicacion }: TabComunicacionesProps) {
  const [draft, setDraft] = useState({ canal: 'LLAMADA' as CanalComunicacion, descripcion: '' });

  const registrar = async () => {
    if (!draft.descripcion) return;
    setSaving(true);
    try {
      await agregarComunicacion(draft);
      setDraft((d) => ({ ...d, descripcion: '' }));
    } finally {
      setSaving(false);
    }
  };

  // Timeline unificado: comunicaciones manuales + actividad automática
  type TimelineItem =
    | { _kind: 'com'; item: Cirugia['comunicaciones'][0] }
    | { _kind: 'act'; item: CirugiaActividad };

  const timeline: TimelineItem[] = [
    ...cirugia.comunicaciones.map((c) => ({ _kind: 'com' as const, item: c })),
    ...(cirugia.actividad ?? []).map((a) => ({ _kind: 'act' as const, item: a })),
  ].sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Formulario nueva comunicación */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
          <div>
            <label className="label" style={{ fontSize: 10 }}>Canal</label>
            <select className="select" value={draft.canal} onChange={(e) => setDraft((d) => ({ ...d, canal: e.target.value as CanalComunicacion }))}>
              {(['LLAMADA', 'WHATSAPP', 'EMAIL', 'PRESENCIAL', 'OTRO'] as CanalComunicacion[]).map((c) => (
                <option key={c} value={c}>{CANAL_LABEL[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" style={{ fontSize: 10 }}>Detalle</label>
            <input className="input" value={draft.descripcion} onChange={(e) => setDraft((d) => ({ ...d, descripcion: e.target.value }))} placeholder="Ej: Paciente confirmó fecha, solicitó nuevo presupuesto..." />
          </div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 14px', alignSelf: 'flex-start' }} onClick={registrar} disabled={saving || !draft.descripcion}>
          {saving ? '…' : 'Registrar'}
        </button>
      </div>

      {/* Timeline unificado */}
      {timeline.length === 0
        ? <p style={{ fontSize: 12, color: 'var(--muted)' }}>Sin actividad registrada.</p>
        : timeline.map((entry) => {
            if (entry._kind === 'com') {
              const c = entry.item;
              return (
                <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border-soft)', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--muted-2)', paddingTop: 2, flexShrink: 0 }}>
                    <Icon name={CANAL_ICON[c.canal] as 'phone'} size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>{CANAL_LABEL[c.canal]}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {c.usuario.nombre}</span>
                    </div>
                    <div style={{ fontSize: 13 }}>{c.descripcion}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 3 }}>{fmtDateTime(c.createdAt)}</div>
                  </div>
                  <button onClick={() => eliminarComunicacion(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 2, flexShrink: 0 }}>
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              );
            }

            // Entrada automática de actividad
            const a = entry.item;
            const iconName = (ACTIVIDAD_ICON[a.tipo] ?? 'info') as 'info';
            return (
              <div key={a.id} style={{ display: 'flex', gap: 10, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-softer)', alignItems: 'flex-start' }}>
                <div style={{ paddingTop: 3, flexShrink: 0, color: 'var(--muted-3)' }}>
                  <Icon name={iconName} size={12} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.descripcion}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>
                    {a.usuario.nombre} · {fmtDateTime(a.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );
}
