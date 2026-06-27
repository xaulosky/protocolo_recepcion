import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../store/app-context';
import { useAuth } from '../../store/auth-context';
import { Icon } from '../../lib/icons';
import { initials } from '../../lib/format';
import type { ManagedUser, Role } from '../../lib/types';
import { UserModal } from './UserModal';
import type { UserFormData } from './UserModal';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador', RECEPCION: 'Recepción', PROFESIONAL: 'Profesional', LECTURA: 'Solo lectura', BOX: 'Box / Estación',
};
const ROLE_COLOR: Record<Role, string> = {
  ADMIN: 'var(--primary)', RECEPCION: 'var(--green)', PROFESIONAL: '#4A6A8C', LECTURA: 'var(--muted)', BOX: '#B07B3E',
};

export function Usuarios() {
  const { toast } = useApp();
  const { user: me } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await api.get<{ users: ManagedUser[] }>('/users');
      setUsers(users);
    } catch {
      toast('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (u: ManagedUser) => { setEditing(u); setModalOpen(true); };

  const handleSubmit = async (data: UserFormData) => {
    if (editing) {
      const body: Record<string, unknown> = {
        nombre: data.nombre, role: data.role, activo: data.activo, permisos: data.permisos,
        ocultarEnDM: data.ocultarEnDM,
      };
      if (data.password) body.password = data.password;
      await api.patch(`/users/${editing.id}`, body);
      toast('Usuario actualizado');
    } else {
      await api.post('/users', {
        nombre: data.nombre, email: data.email, role: data.role,
        password: data.password, permisos: data.permisos, ocultarEnDM: data.ocultarEnDM,
      });
      toast('Usuario creado');
    }
    await load();
  };

  const handleDelete = async (u: ManagedUser) => {
    if (!confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.del(`/users/${u.id}`);
      toast('Usuario eliminado');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
          {users.length} usuario{users.length !== 1 ? 's' : ''} · gestiona accesos y permisos del equipo
        </p>
        <button onClick={openCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="plus" size={15} /> Crear usuario
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-2)', fontSize: 14 }}>Cargando…</div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: 'var(--surface-soft)', borderBottom: '1px solid var(--border-soft)' }}>
                <Th>Usuario</Th><Th>Rol</Th><Th>Permisos</Th><Th>Estado</Th><Th style={{ textAlign: 'right' }}>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: ROLE_COLOR[u.role], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>
                        {initials(u.nombre)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>
                          {u.nombre} {u.id === me?.id && <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>(tú)</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>{u.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span style={{ fontSize: 12, fontWeight: 600, color: ROLE_COLOR[u.role], background: 'var(--surface-soft)', padding: '3px 9px', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                      {u.role === 'ADMIN' ? 'Acceso total' : u.permisos.length > 0 ? `${u.permisos.length} secciones` : 'Según rol'}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: u.activo ? 'var(--green)' : 'var(--orange)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: 4, background: u.activo ? 'var(--green)' : 'var(--orange)' }} />
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </Td>
                  <Td style={{ textAlign: 'right' }}>
                    <button onClick={() => openEdit(u)} title="Editar" style={iconBtn}><Icon name="edit" size={15} /></button>
                    {u.id !== me?.id && (
                      <button onClick={() => handleDelete(u)} title="Eliminar" style={{ ...iconBtn, color: 'var(--orange)' }}><Icon name="trash" size={15} /></button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} editing={editing} />
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <th style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: 0.5, ...style }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: '11px 14px', verticalAlign: 'middle', ...style }}>{children}</td>;
}

const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 6, border: 'none', background: 'none', color: 'var(--muted)',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2,
};
