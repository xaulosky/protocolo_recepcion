import { useState } from 'react';
import { useApp } from '../store/app-context';
import { useAuth } from '../store/auth-context';
import { VIEW_LABELS } from '../lib/nav';
import { Icon } from '../lib/icons';
import { initials, colorFromString } from '../lib/format';
import { api } from '../lib/api';
import { Modal } from './Modal';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { useDarkMode } from '../hooks/useDarkMode';
import type { AuthUser } from '../lib/types';

export function Header({ onOpenMobile, onOpenSearch }: { onOpenMobile: () => void; onOpenSearch?: () => void }) {
  const { view } = useApp();
  const { user } = useAuth();
  const { dark, toggle } = useDarkMode();
  const [perfilOpen, setPerfilOpen] = useState(false);
  return (
    <header
      style={{
        height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 45,
      }}
    >
      <button
        onClick={onOpenMobile}
        className="mobile-menu-btn"
        style={{
          alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
          borderRadius: 7, border: 'none', background: 'none', color: 'var(--muted)', outline: 'none',
        }}
      >
        <Icon name="menu" size={17} />
      </button>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', flex: 1, letterSpacing: '-0.2px' }}>
        {VIEW_LABELS[view]}
      </span>
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          title="Búsqueda global (Ctrl+K)"
          className="icon-btn"
          style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="search" size={15} />
        </button>
      )}
      <button
        onClick={toggle}
        title={dark ? 'Modo claro' : 'Modo oscuro'}
        className="icon-btn"
        style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name={dark ? 'sun' : 'moon'} size={15} />
      </button>
      <NotificationBell />
      {user && (
        <button
          onClick={() => setPerfilOpen(true)}
          title="Mi perfil"
          style={{
            width: 32, height: 32, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: colorFromString(user.nombre), color: '#fff', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {initials(user.nombre)}
        </button>
      )}
      {perfilOpen && user && <PerfilModal onClose={() => setPerfilOpen(false)} />}
    </header>
  );
}

/** Modal de perfil propio: nombre, teléfono, fecha de nacimiento y cambio de contraseña. */
function PerfilModal({ onClose }: { onClose: () => void }) {
  const { toast } = useApp();
  const { user, updateUser } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [telefono, setTelefono] = useState(user?.telefono ?? '');
  const [fechaNacimiento, setFechaNacimiento] = useState(user?.fechaNacimiento ?? '');
  const [saving, setSaving] = useState(false);
  // Cambio de contraseña (sección plegable)
  const [showPass, setShowPass] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passRepetir, setPassRepetir] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const cambiarPassword = async () => {
    if (passNueva.length < 6) { toast('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (passNueva !== passRepetir) { toast('Las contraseñas no coinciden'); return; }
    setSavingPass(true);
    try {
      await api.post('/users/me/password', { actual: passActual, nueva: passNueva });
      toast('Contraseña actualizada');
      setPassActual(''); setPassNueva(''); setPassRepetir(''); setShowPass(false);
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'Error al cambiar la contraseña');
    } finally {
      setSavingPass(false);
    }
  };

  const guardar = async () => {
    if (!nombre.trim()) { toast('El nombre no puede quedar vacío'); return; }
    setSaving(true);
    try {
      const data = await api.patch<{ user: AuthUser }>('/users/me/perfil', {
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        fechaNacimiento: fechaNacimiento || null,
      });
      if (user) updateUser({ ...user, nombre: data.user.nombre, telefono: data.user.telefono, fechaNacimiento: data.user.fechaNacimiento });
      toast('Perfil actualizado');
      onClose();
    } catch {
      toast('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} eyebrow="Mi perfil" title={user?.nombre ?? ''} maxWidth={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label className="label">Nombre</label>
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 XXXX XXXX" />
        </div>
        <div>
          <label className="label">Fecha de nacimiento</label>
          <input className="input" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 4 }}>
            Se usa para avisar al equipo cuando estés de cumpleaños 🎂
          </div>
        </div>
        <div>
          <label className="label">Correo</label>
          <input className="input" value={user?.email ?? ''} disabled style={{ opacity: 0.6 }} />
        </div>

        {/* Cambio de contraseña */}
        <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
          {!showPass ? (
            <button
              onClick={() => setShowPass(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: 'var(--primary)', fontWeight: 500, padding: 0 }}
            >
              Cambiar contraseña
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="eyebrow">Cambiar contraseña</div>
              <div>
                <label className="label">Contraseña actual</label>
                <input className="input" type="password" value={passActual} onChange={(e) => setPassActual(e.target.value)} autoComplete="current-password" />
              </div>
              <div>
                <label className="label">Nueva contraseña</label>
                <input className="input" type="password" value={passNueva} onChange={(e) => setPassNueva(e.target.value)} autoComplete="new-password" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="label">Repetir nueva contraseña</label>
                <input className="input" type="password" value={passRepetir} onChange={(e) => setPassRepetir(e.target.value)} autoComplete="new-password" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ fontSize: 12.5, padding: '7px 14px' }} onClick={cambiarPassword} disabled={savingPass || !passActual || !passNueva}>
                  {savingPass ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
                <button className="btn btn-soft" style={{ fontSize: 12.5, padding: '7px 14px' }} onClick={() => { setShowPass(false); setPassActual(''); setPassNueva(''); setPassRepetir(''); }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-soft" style={{ fontSize: 13, padding: '8px 16px' }} onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={guardar} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  );
}
