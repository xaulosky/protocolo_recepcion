import { useApp } from '../store/app-context';
import { VIEW_LABELS } from '../lib/nav';
import { Icon } from '../lib/icons';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { useDarkMode } from '../hooks/useDarkMode';

export function Header({ onOpenMobile, onOpenSearch }: { onOpenMobile: () => void; onOpenSearch?: () => void }) {
  const { view } = useApp();
  const { dark, toggle } = useDarkMode();
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
    </header>
  );
}
