import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useApp } from '../store/app-context';
import { useAuth } from '../store/auth-context';
import { fmtDate } from '../lib/format';
import { Icon } from '../lib/icons';
import type { UserDocument, ManagedUser, DocumentoTipo } from '../lib/types';

const TIPOS: DocumentoTipo[] = ['CONTRATO', 'ANEXO', 'LIQUIDACION', 'CERTIFICADO', 'OTRO'];

const TIPO_LABEL: Record<string, string> = {
  CONTRATO: 'Contratos',
  ANEXO: 'Anexos',
  LIQUIDACION: 'Liquidaciones',
  CERTIFICADO: 'Certificados',
  OTRO: 'Otros documentos',
};

const TIPO_SINGULAR: Record<string, string> = {
  CONTRATO: 'Contrato',
  ANEXO: 'Anexo',
  LIQUIDACION: 'Liquidación',
  CERTIFICADO: 'Certificado',
  OTRO: 'Otro',
};

function fmtSize(n: number): string {
  return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function Documentos() {
  const { toast } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [docs, setDocs] = useState<UserDocument[] | null>(null);
  const [usuarios, setUsuarios] = useState<ManagedUser[]>([]);
  // Admin: usuario cuyo listado se está viendo/gestionando ('' = los míos).
  const [targetId, setTargetId] = useState('');

  const cargar = async (uid: string) => {
    setDocs(null);
    try {
      const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
      const data = await api.get<{ documentos: UserDocument[] }>(`/documentos${qs}`);
      setDocs(data.documentos);
    } catch {
      toast('Error al cargar documentos');
      setDocs([]);
    }
  };

  useEffect(() => { cargar(targetId); }, [targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAdmin) return;
    api.get<{ users: ManagedUser[] }>('/users')
      .then((d) => setUsuarios(d.users.filter((u) => u.activo && u.role !== 'BOX')))
      .catch(() => {});
  }, [isAdmin]);

  const descargar = async (doc: UserDocument) => {
    try {
      const blob = await api.blob(`/documentos/${doc.id}/archivo`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('Error al descargar el archivo');
    }
  };

  const eliminar = async (doc: UserDocument) => {
    if (!window.confirm(`¿Eliminar "${doc.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.del(`/documentos/${doc.id}`);
      setDocs((prev) => (prev ?? []).filter((d) => d.id !== doc.id));
      toast('Documento eliminado');
    } catch {
      toast('Error al eliminar');
    }
  };

  const lista = docs ?? [];
  const grupos = TIPOS.filter((t) => lista.some((d) => d.tipo === t));
  const viendoOtro = isAdmin && targetId !== '';

  return (
    <div className="fade-up" style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
            {viendoOtro ? `Documentos de ${usuarios.find((u) => u.id === targetId)?.nombre ?? '...'}` : 'Mis Documentos'}
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
            Contratos, anexos, liquidaciones y otros documentos personales.
          </p>
        </div>
        {isAdmin && (
          <select className="select" style={{ width: 'auto', minWidth: 220 }} value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">Mis documentos</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
        )}
      </div>

      {isAdmin && viendoOtro && (
        <UploadForm
          userId={targetId}
          onUploaded={(doc) => { setDocs((prev) => [doc, ...(prev ?? [])]); }}
        />
      )}

      {docs === null ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', fontSize: 13 }}>Cargando...</div>
      ) : lista.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ color: 'var(--muted-2)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Icon name="doc" size={28} /></div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>
            {viendoOtro ? 'Este usuario aún no tiene documentos.' : 'Aún no tienes documentos cargados.'}
          </div>
          {!viendoOtro && (
            <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 4 }}>
              Cuando administración suba tu contrato, anexos o liquidaciones, aparecerán aquí.
            </div>
          )}
        </div>
      ) : (
        grupos.map((tipo) => (
          <div key={tipo} style={{ marginBottom: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{TIPO_LABEL[tipo]}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lista.filter((d) => d.tipo === tipo).map((d) => (
                <div key={d.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--cream)', border: '1px solid var(--cream-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                    <Icon name="file" size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>
                      {d.titulo}
                      {d.periodo && <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 400 }}> · {d.periodo}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.filename} · {fmtSize(d.size)} · {fmtDate(d.createdAt)}
                      {d.subidoPor ? ` · subido por ${d.subidoPor.nombre}` : ''}
                    </div>
                    {d.notas && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{d.notas}</div>}
                  </div>
                  <button
                    className="btn btn-soft"
                    style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    onClick={() => descargar(d)}
                  >
                    <Icon name="download" size={13} /> Descargar
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => eliminar(d)}
                      title="Eliminar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, display: 'flex', flexShrink: 0 }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/** Formulario de subida (solo admin, sobre el usuario seleccionado). */
function UploadForm({ userId, onUploaded }: { userId: string; onUploaded: (doc: UserDocument) => void }) {
  const { toast } = useApp();
  const [tipo, setTipo] = useState<DocumentoTipo>('CONTRATO');
  const [titulo, setTitulo] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [notas, setNotas] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const subir = async () => {
    if (!file) { toast('Selecciona un archivo'); return; }
    if (!titulo.trim()) { toast('Ingresa un título'); return; }
    setSubiendo(true);
    try {
      const form = new FormData();
      form.set('userId', userId);
      form.set('tipo', tipo);
      form.set('titulo', titulo.trim());
      if (periodo) form.set('periodo', periodo);
      if (notas.trim()) form.set('notas', notas.trim());
      form.set('archivo', file);
      const data = await api.upload<{ documento: UserDocument }>('/documentos', form);
      onUploaded(data.documento);
      setTitulo(''); setPeriodo(''); setNotas(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      toast('Documento subido — el usuario fue notificado');
    } catch {
      toast('Error al subir el documento');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="card" style={{ padding: 18, marginBottom: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Subir documento</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="label">Tipo</label>
          <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value as DocumentoTipo)}>
            {TIPOS.map((t) => <option key={t} value={t}>{TIPO_SINGULAR[t]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Título</label>
          <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder='Ej: "Contrato de trabajo", "Liquidación junio"' />
        </div>
        <div>
          <label className="label">Período (opcional)</label>
          <input className="input" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
        </div>
        <div>
          <label className="label">Archivo</label>
          <input
            ref={fileRef}
            className="input"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="label">Notas (opcional)</label>
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Visible para el usuario" />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 14, padding: '9px 18px', fontSize: 13 }} onClick={subir} disabled={subiendo}>
        {subiendo ? 'Subiendo...' : 'Subir documento'}
      </button>
    </div>
  );
}
