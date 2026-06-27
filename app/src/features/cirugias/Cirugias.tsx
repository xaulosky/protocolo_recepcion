import { useState } from 'react';
import { Icon } from '../../lib/icons';
import { AsyncState } from '../../components/AsyncState';
import { fmtDate } from '../../lib/format';
import { useAuth } from '../../store/auth-context';
import type { EtapaCirugia } from '../../lib/types';
import { useCirugias } from './useCirugias';
import { CirugiaCreateModal } from './CirugiaCreateModal';
import { CirugiaDetailModal } from './CirugiaDetailModal';
import {
  ETAPA_LABEL, ETAPA_STYLE, ETAPAS_ORDEN, PRESUPUESTO_LABEL, PRESUPUESTO_STYLE,
} from './cirugiasStyles';

export function Cirugias() {
  const { user } = useAuth();
  const canWrite  = user?.role === 'ADMIN' || user?.role === 'RECEPCION';

  const {
    cirugias, loading, error, load, crear, actualizar, eliminar,
    upsertPresupuesto, agregarInsumo, toggleInsumo, eliminarInsumo,
    agregarComunicacion, eliminarComunicacion,
  } = useCirugias();

  const [etapaFiltro, setEtapaFiltro] = useState<EtapaCirugia | 'TODAS'>('TODAS');
  const [q, setQ]                      = useState('');
  const [createOpen, setCreateOpen]    = useState(false);
  const [detailId, setDetailId]        = useState<string | null>(null);

  const filtradas = cirugias.filter((c) => {
    if (etapaFiltro !== 'TODAS' && c.etapa !== etapaFiltro) return false;
    if (q && !c.paciente.toLowerCase().includes(q.toLowerCase()) && !c.tipo.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Cirugías</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0' }}>Seguimiento de procedimientos por paciente</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} />Nueva cirugía
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar paciente o tipo..."
          style={{ width: 220, fontSize: 13 }}
        />
        <button
          onClick={() => setEtapaFiltro('TODAS')}
          style={{
            padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border-soft)',
            cursor: 'pointer', fontSize: 12, fontWeight: etapaFiltro === 'TODAS' ? 600 : 400,
            background: etapaFiltro === 'TODAS' ? 'var(--primary)' : 'var(--bg)',
            color: etapaFiltro === 'TODAS' ? '#fff' : 'var(--muted)',
          }}
        >
          Todas
        </button>
        {ETAPAS_ORDEN.map((etapa) => {
          const st     = ETAPA_STYLE[etapa];
          const active = etapaFiltro === etapa;
          return (
            <button key={etapa}
              onClick={() => setEtapaFiltro(active ? 'TODAS' : etapa)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border-soft)',
                cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400,
                background: active ? st.bg : 'var(--bg)',
                color: active ? st.color : 'var(--muted)',
                borderColor: active ? st.color : 'var(--border-soft)',
              }}
            >
              {ETAPA_LABEL[etapa]}
            </button>
          );
        })}
      </div>

      <AsyncState loading={loading} error={error} onRetry={() => load()}>
        {filtradas.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>
              {cirugias.length === 0 ? 'No hay cirugías registradas.' : 'Sin resultados para el filtro actual.'}
            </p>
          : <div className="grid-cards">
              {filtradas.map((c) => {
                const estSt = c.etapa ? ETAPA_STYLE[c.etapa] : null;
                const presSt = c.presupuesto ? PRESUPUESTO_STYLE[c.presupuesto.estado] : null;
                return (
                  <div key={c.id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => setDetailId(c.id)}>
                    {/* Etapa badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: estSt?.bg, color: estSt?.color }}>
                        {ETAPA_LABEL[c.etapa]}
                      </span>
                      {c.presupuesto && (
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 12, background: presSt?.bg, color: presSt?.color }}>
                          {PRESUPUESTO_LABEL[c.presupuesto.estado]}
                        </span>
                      )}
                    </div>

                    {/* Paciente + tipo */}
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{c.paciente}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{c.tipo}</div>

                    {/* Info rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--border-soft)', paddingTop: 10 }}>
                      {c.professional && (
                        <InfoRow icon="user" text={c.professional.nombreCompleto} />
                      )}
                      {c.fechaCirugia && (
                        <InfoRow icon="calendar" text={fmtDate(c.fechaCirugia)} />
                      )}
                      {c.telefono && (
                        <InfoRow icon="phone" text={c.telefono} />
                      )}
                      <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                        {c._count.tareas > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>
                            <Icon name="tasks" size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                            {c._count.tareas} tarea{c._count.tareas !== 1 ? 's' : ''}
                          </span>
                        )}
                        {c._count.insumos > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>
                            <Icon name="pkg" size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                            {c._count.insumos} insumo{c._count.insumos !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>}
      </AsyncState>

      <CirugiaCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onGuardar={async (data) => { await crear(data); }}
      />

      <CirugiaDetailModal
        cirugiaId={detailId}
        onClose={() => setDetailId(null)}
        onActualizar={async (id, data) => actualizar(id, data)}
        onEliminar={async (id) => { await eliminar(id); setDetailId(null); }}
        upsertPresupuesto={upsertPresupuesto}
        agregarInsumo={agregarInsumo}
        toggleInsumo={toggleInsumo}
        eliminarInsumo={eliminarInsumo}
        agregarComunicacion={agregarComunicacion}
        eliminarComunicacion={eliminarComunicacion}
      />
    </div>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ color: 'var(--muted-2)', display: 'flex', flexShrink: 0 }}><Icon name={icon as 'user'} size={11} /></span>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{text}</span>
    </div>
  );
}
