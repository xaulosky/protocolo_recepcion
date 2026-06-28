import { useMemo } from 'react';
import { useApp } from '../store/app-context';
import { useAuth } from '../store/auth-context';
import { NAV } from '../lib/nav';
import { allowedViews } from '../lib/permissions';
import { Icon } from '../lib/icons';
import { initials } from '../lib/format';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador', RECEPCION: 'Recepción', PROFESIONAL: 'Profesional', LECTURA: 'Solo lectura',
};

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const { view, go } = useApp();
  const { user, logout } = useAuth();
  const width = collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)';

  // Filtra el menú según los permisos del usuario; oculta secciones vacías.
  const nav = useMemo(() => {
    const allowed = allowedViews(user);
    return NAV
      .map((sec) => ({ ...sec, items: sec.items.filter((it) => allowed.has(it.id)) }))
      .filter((sec) => sec.items.length > 0);
  }, [user]);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="sidebar-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, animation: 'overlayIn .2s ease' }}
        />
      )}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width,
          background: '#fff', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden',
          transition: 'transform .25s ease, width .25s ease',
          ...(mobileOpen ? { transform: 'translateX(0)' } : {}),
        }}
        className="sidebar"
      >
        <div style={{ height: 60, padding: '0 14px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, justifyContent: collapsed ? 'center' : undefined }}>
          {!collapsed && (
            <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
              <Icon name="logo" size={18} />
            </div>
          )}
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.2px' }}>Cialo Hub</div>
              <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>Clínica Cialo</div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="sidebar-collapse-btn"
            style={{ flexShrink: 0, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'none', color: 'var(--muted-3)', outline: 'none' }}
          >
            <Icon name={collapsed ? 'colR' : 'colL'} size={14} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 8 }}>
          {nav.map((sec, si) => (
            <div key={sec.section}>
              {!collapsed && (
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-4)', letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', marginBottom: 3, marginTop: si > 0 ? 14 : 6 }}>
                  {sec.section}
                </div>
              )}
              {sec.items.map((it) => {
                const active = view === it.id;
                return (
                  <button
                    key={it.id}
                    data-navid={it.id}
                    onClick={() => { go(it.id); onCloseMobile(); }}
                    title={collapsed ? it.label : undefined}
                    style={{
                      display: 'flex', width: '100%', alignItems: 'center', gap: 9, padding: 8,
                      borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
                      fontWeight: active ? 500 : 400, textAlign: 'left', marginBottom: 2, outline: 'none',
                      overflow: 'hidden', whiteSpace: 'nowrap',
                      background: active ? 'var(--primary-soft)' : 'transparent',
                      color: active ? 'var(--primary)' : 'var(--text-2)',
                    }}
                  >
                    <span style={{ flexShrink: 0, width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={it.icon} size={16} />
                    </span>
                    {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-soft)', padding: collapsed ? '10px 8px' : '10px 12px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>
            {user ? initials(user.nombre) : '?'}
          </div>
          {!collapsed && user && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nombre}</div>
                <div style={{ fontSize: 10.5, color: 'var(--muted-2)' }}>{ROLE_LABEL[user.role] ?? user.role}</div>
              </div>
              <button onClick={logout} title="Cerrar sesión" className="icon-btn" style={{ flexShrink: 0, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'none', color: 'var(--muted-3)' }}>
                <Icon name="logout" size={15} />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
