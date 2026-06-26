import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Modal } from '../../components/Modal';
import { Icon } from '../../lib/icons';
import { VIEW_LABELS } from '../../lib/nav';
import type { ViewId } from '../../lib/nav';
import { PERMISSION_VIEWS, defaultPermisos } from '../../lib/permissions';
import type { ManagedUser, Role } from '../../lib/types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'RECEPCION', label: 'Recepción' },
  { value: 'PROFESIONAL', label: 'Profesional' },
  { value: 'LECTURA', label: 'Solo lectura' },
];

export interface UserFormData {
  nombre: string;
  email: string;
  role: Role;
  password?: string;
  activo?: boolean;
  permisos: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  editing: ManagedUser | null; // null = crear
}

export function UserModal({ open, onClose, onSubmit, editing }: Props) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('RECEPCION');
  const [password, setPassword] = useState('');
  const [activo, setActivo] = useState(true);
  const [custom, setCustom] = useState(false);
  const [permisos, setPermisos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setPassword('');
    if (editing) {
      setNombre(editing.nombre);
      setEmail(editing.email);
      setRole(editing.role);
      setActivo(editing.activo);
      const tienePersonalizados = editing.permisos && editing.permisos.length > 0;
      setCustom(!!tienePersonalizados);
      setPermisos(tienePersonalizados ? editing.permisos : defaultPermisos(editing.role));
    } else {
      setNombre(''); setEmail(''); setRole('RECEPCION'); setActivo(true);
      setCustom(false); setPermisos(defaultPermisos('RECEPCION'));
    }
  }, [open, editing]);

  // Al cambiar el rol mientras NO hay permisos personalizados, refleja los defaults.
  useEffect(() => {
    if (!custom) setPermisos(defaultPermisos(role));
  }, [role, custom]);

  const isAdmin = role === 'ADMIN';

  const toggle = (v: ViewId) =>
    setPermisos((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const submit = async () => {
    setError('');
    if (!nombre.trim()) return setError('El nombre es obligatorio');
    if (!editing && !email.trim()) return setError('El email es obligatorio');
    if (!editing && password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (editing && password && password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');

    setBusy(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        email: email.trim(),
        role,
        password: password || undefined,
        activo,
        // Admin → permisos vacíos (ve todo). Custom → la selección. Si no → vacío (defaults del rol).
        permisos: isAdmin || !custom ? [] : permisos,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} eyebrow={editing ? 'Editar' : 'Nuevo'} title={editing ? editing.nombre : 'Crear usuario'} maxWidth={600}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Nombre">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={input} placeholder="Nombre y apellido" />
        </Field>

        <Field label="Email">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!editing}
            style={{ ...input, opacity: editing ? 0.6 : 1 }}
            placeholder="persona@cialo.cl"
          />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Rol" style={{ flex: 1 }}>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={input}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
          {editing && (
            <Field label="Estado" style={{ flex: 1 }}>
              <button
                onClick={() => setActivo((a) => !a)}
                style={{
                  ...input, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  color: activo ? 'var(--green)' : 'var(--orange)', fontWeight: 500,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 4, background: activo ? 'var(--green)' : 'var(--orange)' }} />
                {activo ? 'Activo' : 'Inactivo'}
              </button>
            </Field>
          )}
        </div>

        <Field label={editing ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            placeholder={editing ? '••••••' : 'Mínimo 6 caracteres'}
          />
        </Field>

        {/* Permisos */}
        <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
          {isAdmin ? (
            <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={15} style={{ color: 'var(--primary)' }} />
              Los administradores tienen acceso completo a todas las secciones.
            </div>
          ) : (
            <>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', marginBottom: 10 }}>
                <input type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Permisos personalizados</span>
                <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>
                  {custom ? '(elige las secciones)' : '(usa los permisos por defecto del rol)'}
                </span>
              </label>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 14px',
                opacity: custom ? 1 : 0.55, pointerEvents: custom ? 'auto' : 'none',
              }}>
                {PERMISSION_VIEWS.map((v) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: custom ? 'pointer' : 'default', fontSize: 12.5, color: 'var(--text-2)' }}>
                    <input type="checkbox" checked={permisos.includes(v)} onChange={() => toggle(v)} disabled={!custom} />
                    {VIEW_LABELS[v]}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {error && <div style={{ fontSize: 12.5, color: 'var(--orange)', background: 'var(--danger-soft)', padding: '8px 10px', borderRadius: 7 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button onClick={onClose} className="btn-soft" style={btn}>Cancelar</button>
          <button onClick={submit} disabled={busy} className="btn-primary" style={{ ...btn, opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const input: CSSProperties = {
  width: '100%', padding: '8px 11px', fontSize: 13.5, border: '1px solid var(--border)',
  borderRadius: 7, outline: 'none', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text)',
};

const btn: CSSProperties = {
  padding: '8px 16px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
