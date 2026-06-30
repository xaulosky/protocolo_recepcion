import { useState, useCallback } from 'react';
import { useResource } from '../../lib/useResource';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { Icon } from '../../lib/icons';
import { money } from '../../lib/format';
import type { Treatment, Professional, FaqItem, Consultation } from '../../lib/types';

type Tab = 'tratamientos' | 'profesionales' | 'faq' | 'consultas';

// ── Shared modal shell ────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.45)' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, type = 'text', disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  required?: boolean; type?: string; disabled?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="label">{label}{required && <span style={{ color: 'var(--orange)', marginLeft: 2 }}>*</span>}</label>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

// ── Treatments CRUD ───────────────────────────────────────────────────────────

interface TreatmentForm {
  id: string; nombre: string; categoria: string; descripcion: string;
  subcategoria: string; valorDesde: string; valorHasta: string; duracion: string;
}

const emptyTreatment = (): TreatmentForm => ({
  id: '', nombre: '', categoria: '', descripcion: '',
  subcategoria: '', valorDesde: '', valorHasta: '', duracion: '',
});

function TreatmentModal({ initial, onClose, onSaved }: {
  initial: Treatment | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useApp();
  const isEdit = !!initial;
  const [form, setForm] = useState<TreatmentForm>(
    initial
      ? {
          id: initial.id,
          nombre: initial.nombre,
          categoria: initial.categoria,
          descripcion: initial.descripcion,
          subcategoria: initial.subcategoria ?? '',
          valorDesde: initial.valorDesde != null ? String(initial.valorDesde) : '',
          valorHasta: initial.valorHasta != null ? String(initial.valorHasta) : '',
          duracion: initial.duracion ?? '',
        }
      : emptyTreatment()
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof TreatmentForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        id: form.id,
        nombre: form.nombre,
        categoria: form.categoria,
        descripcion: form.descripcion,
        subcategoria: form.subcategoria || null,
        valorDesde: form.valorDesde !== '' ? parseInt(form.valorDesde, 10) : null,
        valorHasta: form.valorHasta !== '' ? parseInt(form.valorHasta, 10) : null,
        duracion: form.duracion || null,
      };
      if (isEdit) {
        await api.patch(`/data/treatments/${form.id}`, body);
        toast('Tratamiento actualizado');
      } else {
        await api.post('/data/treatments', body);
        toast('Tratamiento creado');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al guardar';
      toast(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar tratamiento' : 'Nuevo tratamiento'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <Field label="ID" value={form.id} onChange={set('id')} placeholder="ej. lip-acido-hialuronico" required disabled={isEdit} />
        <Field label="Nombre" value={form.nombre} onChange={set('nombre')} placeholder="Nombre del tratamiento" required />
        <Field label="Categoría" value={form.categoria} onChange={set('categoria')} placeholder="Ej. Medicina Estética" required />
        <div style={{ marginBottom: 12 }}>
          <label className="label">Descripción<span style={{ color: 'var(--orange)', marginLeft: 2 }}>*</span></label>
          <textarea
            className="input"
            value={form.descripcion}
            onChange={(e) => set('descripcion')(e.target.value)}
            placeholder="Descripción del tratamiento"
            rows={3}
            style={{ resize: 'vertical' }}
            required
          />
        </div>
        <Field label="Subcategoría" value={form.subcategoria} onChange={set('subcategoria')} placeholder="Opcional" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Valor Desde (CLP)" value={form.valorDesde} onChange={set('valorDesde')} type="number" placeholder="Ej. 50000" />
          <Field label="Valor Hasta (CLP)" value={form.valorHasta} onChange={set('valorHasta')} type="number" placeholder="Ej. 80000" />
        </div>
        <Field label="Duración" value={form.duracion} onChange={set('duracion')} placeholder="Ej. 45-60 min" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-soft" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TratamientosTab() {
  const { toast } = useApp();
  const { data, loading, error, reload } = useResource<{ treatments: Treatment[] }>('/data/treatments');
  const treatments = data?.treatments ?? [];
  const [editing, setEditing] = useState<Treatment | null | 'new'>(null);

  const handleDelete = useCallback(async (t: Treatment) => {
    if (!window.confirm(`¿Eliminar "${t.nombre}"?`)) return;
    try {
      await api.del(`/data/treatments/${t.id}`);
      toast('Tratamiento eliminado');
      reload();
    } catch {
      toast('Error al eliminar');
    }
  }, [toast, reload]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{treatments.length} tratamientos</span>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={13} strokeWidth={2.5} /> Nuevo tratamiento
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted-2)' }}>Cargando…</div>}
      {error && <div style={{ color: 'var(--orange)', padding: 16 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: 'var(--border-softer)' }}>
              <tr>
                <th style={TH}>ID</th>
                <th style={TH}>Nombre</th>
                <th style={TH}>Categoría</th>
                <th style={TH}>Precio</th>
                <th style={{ ...TH, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'var(--surface-soft)' : 'var(--bg)' }}>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 500 }}>{t.nombre}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)' }}>{t.categoria}</td>
                  <td style={{ padding: '9px 14px', whiteSpace: 'nowrap', color: 'var(--primary)', fontWeight: 600 }}>
                    {t.valorDesde ? money(t.valorDesde) : <span style={{ color: 'var(--muted-4)' }}>—</span>}
                  </td>
                  <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => setEditing(t)} title="Editar" style={iconBtn}>
                      <Icon name="edit" size={14} />
                    </button>
                    <button onClick={() => handleDelete(t)} title="Eliminar" style={{ ...iconBtn, color: 'var(--orange)' }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {treatments.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--muted-2)' }}>Sin tratamientos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <TreatmentModal
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </div>
  );
}

// ── Professionals CRUD ────────────────────────────────────────────────────────

interface ProfessionalForm {
  id: string; nombreCompleto: string; especialidad: string;
  rut: string; telefono: string; email: string;
}

const emptyProfessional = (): ProfessionalForm => ({
  id: '', nombreCompleto: '', especialidad: '', rut: '', telefono: '', email: '',
});

function ProfessionalModal({ initial, onClose, onSaved }: {
  initial: Professional | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useApp();
  const isEdit = !!initial;
  const [form, setForm] = useState<ProfessionalForm>(
    initial
      ? { id: initial.id, nombreCompleto: initial.nombreCompleto, especialidad: initial.especialidad, rut: initial.rut ?? '', telefono: initial.telefono ?? '', email: initial.email ?? '' }
      : emptyProfessional()
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ProfessionalForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        id: form.id,
        nombreCompleto: form.nombreCompleto,
        especialidad: form.especialidad,
        rut: form.rut || null,
        telefono: form.telefono || null,
        email: form.email || null,
      };
      if (isEdit) {
        await api.patch(`/data/professionals/${form.id}`, body);
        toast('Profesional actualizado');
      } else {
        await api.post('/data/professionals', body);
        toast('Profesional creado');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al guardar';
      toast(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar profesional' : 'Nuevo profesional'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <Field label="ID" value={form.id} onChange={set('id')} placeholder="ej. dra-garcia" required disabled={isEdit} />
        <Field label="Nombre completo" value={form.nombreCompleto} onChange={set('nombreCompleto')} placeholder="Dra. Ana García" required />
        <Field label="Especialidad" value={form.especialidad} onChange={set('especialidad')} placeholder="Médico Cirujano Estético" required />
        <Field label="RUT" value={form.rut} onChange={set('rut')} placeholder="12.345.678-9" />
        <Field label="Teléfono" value={form.telefono} onChange={set('telefono')} placeholder="+56 9 XXXX XXXX" />
        <Field label="Email" value={form.email} onChange={set('email')} type="email" placeholder="profesional@cialo.cl" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-soft" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProfesionalesTab() {
  const { toast } = useApp();
  const { data, loading, error, reload } = useResource<{ professionals: Professional[] }>('/data/professionals');
  const professionals = data?.professionals ?? [];
  const [editing, setEditing] = useState<Professional | null | 'new'>(null);

  const handleDelete = useCallback(async (p: Professional) => {
    if (!window.confirm(`¿Eliminar a "${p.nombreCompleto}"?`)) return;
    try {
      await api.del(`/data/professionals/${p.id}`);
      toast('Profesional eliminado');
      reload();
    } catch {
      toast('Error al eliminar');
    }
  }, [toast, reload]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{professionals.length} profesionales</span>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={13} strokeWidth={2.5} /> Nuevo profesional
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted-2)' }}>Cargando…</div>}
      {error && <div style={{ color: 'var(--orange)', padding: 16 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: 'var(--border-softer)' }}>
              <tr>
                <th style={TH}>ID</th>
                <th style={TH}>Nombre</th>
                <th style={TH}>Especialidad</th>
                <th style={TH}>Teléfono</th>
                <th style={TH}>Email</th>
                <th style={{ ...TH, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'var(--surface-soft)' : 'var(--bg)' }}>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}>{p.id}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 500 }}>{p.nombreCompleto}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)' }}>{p.especialidad}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)' }}>{p.telefono ?? '—'}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)' }}>{p.email ?? '—'}</td>
                  <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => setEditing(p)} title="Editar" style={iconBtn}>
                      <Icon name="edit" size={14} />
                    </button>
                    <button onClick={() => handleDelete(p)} title="Eliminar" style={{ ...iconBtn, color: 'var(--orange)' }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {professionals.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted-2)' }}>Sin profesionales</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProfessionalModal
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </div>
  );
}

// ── FAQ CRUD ──────────────────────────────────────────────────────────────────

interface FaqForm { id: string; categoria: string; pregunta: string; respuesta: string; tags: string }

const emptyFaq = (): FaqForm => ({ id: '', categoria: '', pregunta: '', respuesta: '', tags: '' });

function FaqModal({ initial, onClose, onSaved }: { initial: FaqItem | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useApp();
  const isEdit = !!initial;
  const [form, setForm] = useState<FaqForm>(
    initial
      ? { id: initial.id, categoria: initial.categoria, pregunta: initial.pregunta, respuesta: initial.respuesta, tags: initial.tags.join(', ') }
      : emptyFaq()
  );
  const [saving, setSaving] = useState(false);
  const set = (k: keyof FaqForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      if (isEdit) {
        await api.patch(`/data/faq/${form.id}`, body);
        toast('FAQ actualizada');
      } else {
        await api.post('/data/faq', body);
        toast('FAQ creada');
      }
      onSaved(); onClose();
    } catch (err: unknown) {
      toast((err as { message?: string })?.message ?? 'Error al guardar');
    } finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Editar pregunta frecuente' : 'Nueva pregunta frecuente'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <Field label="ID" value={form.id} onChange={set('id')} placeholder="ej. pago-cuotas" required disabled={isEdit} />
        <Field label="Categoría" value={form.categoria} onChange={set('categoria')} placeholder="Ej. Pagos" required />
        <Field label="Pregunta" value={form.pregunta} onChange={set('pregunta')} placeholder="¿Se puede pagar en cuotas?" required />
        <div style={{ marginBottom: 12 }}>
          <label className="label">Respuesta<span style={{ color: 'var(--orange)', marginLeft: 2 }}>*</span></label>
          <textarea className="input" value={form.respuesta} onChange={(e) => set('respuesta')(e.target.value)} rows={4} style={{ resize: 'vertical' }} required />
        </div>
        <Field label="Tags (separados por coma)" value={form.tags} onChange={set('tags')} placeholder="pago, cuotas, financiamiento" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-soft" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}

function FaqTab() {
  const { toast } = useApp();
  const { data, loading, error, reload } = useResource<{ faq: FaqItem[] }>('/data/faq');
  const faq = data?.faq ?? [];
  const [editing, setEditing] = useState<FaqItem | null | 'new'>(null);

  const handleDelete = useCallback(async (f: FaqItem) => {
    if (!window.confirm(`¿Eliminar la pregunta "${f.pregunta}"?`)) return;
    try { await api.del(`/data/faq/${f.id}`); toast('FAQ eliminada'); reload(); }
    catch { toast('Error al eliminar'); }
  }, [toast, reload]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{faq.length} preguntas frecuentes</span>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={13} strokeWidth={2.5} /> Nueva FAQ
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted-2)' }}>Cargando…</div>}
      {error && <div style={{ color: 'var(--orange)', padding: 16 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: 'var(--border-softer)' }}>
              <tr>
                <th style={TH}>Pregunta</th>
                <th style={TH}>Categoría</th>
                <th style={TH}>Tags</th>
                <th style={{ ...TH, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {faq.map((f, i) => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'var(--surface-soft)' : 'var(--bg)' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 500, maxWidth: 340 }}>
                    <div style={{ marginBottom: 2 }}>{f.pregunta}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)', fontWeight: 400, lineHeight: 1.4 }}>{f.respuesta}</div>
                  </td>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{f.categoria}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {f.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: 'var(--border-softer)', color: 'var(--muted)', border: '1px solid var(--border-soft)' }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => setEditing(f)} title="Editar" style={iconBtn}><Icon name="edit" size={14} /></button>
                    <button onClick={() => handleDelete(f)} title="Eliminar" style={{ ...iconBtn, color: 'var(--orange)' }}><Icon name="trash" size={14} /></button>
                  </td>
                </tr>
              ))}
              {faq.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--muted-2)' }}>Sin preguntas frecuentes</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <FaqModal initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={reload} />}
    </div>
  );
}

// ── Consultas CRUD ────────────────────────────────────────────────────────────

interface ConsultaForm {
  id: string; nombre: string; descripcion: string; valor: string;
  categoria: string; emoji: string; duracion: string; reembolsable: boolean;
}

const emptyConsulta = (): ConsultaForm => ({
  id: '', nombre: '', descripcion: '', valor: '', categoria: '', emoji: '', duracion: '', reembolsable: false,
});

function ConsultaModal({ initial, onClose, onSaved }: { initial: Consultation | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useApp();
  const isEdit = !!initial;
  const [form, setForm] = useState<ConsultaForm>(
    initial
      ? { id: initial.id, nombre: initial.nombre, descripcion: initial.descripcion, valor: initial.valor,
          categoria: initial.categoria ?? '', emoji: initial.emoji ?? '', duracion: initial.duracion ?? '',
          reembolsable: initial.reembolsable }
      : emptyConsulta()
  );
  const [saving, setSaving] = useState(false);
  const set = (k: keyof ConsultaForm) => (v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, categoria: form.categoria || null, emoji: form.emoji || null, duracion: form.duracion || null };
      if (isEdit) {
        await api.patch(`/data/consultations/${form.id}`, body);
        toast('Consulta actualizada');
      } else {
        await api.post('/data/consultations', body);
        toast('Consulta creada');
      }
      onSaved(); onClose();
    } catch (err: unknown) {
      toast((err as { message?: string })?.message ?? 'Error al guardar');
    } finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Editar consulta' : 'Nueva consulta'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <Field label="ID" value={form.id} onChange={set('id')} placeholder="ej. dermato-consulta" required disabled={isEdit} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10 }}>
          <Field label="Nombre" value={form.nombre} onChange={set('nombre')} placeholder="Consulta dermatológica" required />
          <Field label="Emoji" value={form.emoji} onChange={set('emoji')} placeholder="🩺" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label className="label">Descripción<span style={{ color: 'var(--orange)', marginLeft: 2 }}>*</span></label>
          <textarea className="input" value={form.descripcion} onChange={(e) => set('descripcion')(e.target.value)} rows={2} style={{ resize: 'vertical' }} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Valor" value={form.valor} onChange={set('valor')} placeholder="$50.000" required />
          <Field label="Duración" value={form.duracion} onChange={set('duracion')} placeholder="30 min" />
        </div>
        <Field label="Categoría" value={form.categoria} onChange={set('categoria')} placeholder="Dermatología" />
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="reembolsable" checked={form.reembolsable} onChange={(e) => set('reembolsable')(e.target.checked)} style={{ width: 15, height: 15 }} />
          <label htmlFor="reembolsable" style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>Reembolsable por Fonasa/Isapre</label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-soft" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}

function ConsultasTab() {
  const { toast } = useApp();
  const { data, loading, error, reload } = useResource<{ consultations: Consultation[] }>('/data/consultations');
  const consultations = data?.consultations ?? [];
  const [editing, setEditing] = useState<Consultation | null | 'new'>(null);

  const handleDelete = useCallback(async (c: Consultation) => {
    if (!window.confirm(`¿Eliminar "${c.nombre}"?`)) return;
    try { await api.del(`/data/consultations/${c.id}`); toast('Consulta eliminada'); reload(); }
    catch { toast('Error al eliminar'); }
  }, [toast, reload]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{consultations.length} consultas</span>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={13} strokeWidth={2.5} /> Nueva consulta
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted-2)' }}>Cargando…</div>}
      {error && <div style={{ color: 'var(--orange)', padding: 16 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: 'var(--border-softer)' }}>
              <tr>
                <th style={TH}>Nombre</th>
                <th style={TH}>Categoría</th>
                <th style={TH}>Valor</th>
                <th style={TH}>Duración</th>
                <th style={TH}>Reembolsable</th>
                <th style={{ ...TH, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'var(--surface-soft)' : 'var(--bg)' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 500 }}>
                    <span style={{ marginRight: 6 }}>{c.emoji}</span>{c.nombre}
                    {c.descripcion && <div style={{ fontSize: 11, color: 'var(--muted-2)', fontWeight: 400, marginTop: 1 }}>{c.descripcion}</div>}
                  </td>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{c.categoria ?? '—'}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.valor}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{c.duracion ?? '—'}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: c.reembolsable ? '#EDF5EF' : 'var(--border-softer)', color: c.reembolsable ? '#3A6A4A' : 'var(--muted)' }}>
                      {c.reembolsable ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '9px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => setEditing(c)} title="Editar" style={iconBtn}><Icon name="edit" size={14} /></button>
                    <button onClick={() => handleDelete(c)} title="Eliminar" style={{ ...iconBtn, color: 'var(--orange)' }}><Icon name="trash" size={14} /></button>
                  </td>
                </tr>
              ))}
              {consultations.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--muted-2)' }}>Sin consultas</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ConsultaModal initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={reload} />}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('tratamientos');

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Panel de Administración</h1>
        <p style={{ fontSize: 13, color: 'var(--muted-2)' }}>Gestión de datos clínicos (solo administradores)</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {(['tratamientos', 'profesionales', 'faq', 'consultas'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '9px 18px', fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: tab === t ? 'var(--primary)' : 'var(--muted)',
              borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'color .15s, border-color .15s',
            }}
          >
            {t === 'tratamientos' ? 'Tratamientos' : t === 'profesionales' ? 'Profesionales' : t === 'faq' ? 'FAQ' : 'Consultas'}
          </button>
        ))}
      </div>

      {tab === 'tratamientos' && <TratamientosTab />}
      {tab === 'profesionales' && <ProfesionalesTab />}
      {tab === 'faq' && <FaqTab />}
      {tab === 'consultas' && <ConsultasTab />}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--muted)', whiteSpace: 'nowrap', letterSpacing: '0.3px',
  borderBottom: '1px solid var(--border)',
};

const iconBtn: React.CSSProperties = {
  border: 'none', background: 'none', padding: '4px 6px', cursor: 'pointer',
  color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', borderRadius: 4,
};
