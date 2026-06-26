import { useApp } from '../store/app-context';
import { VIEW_LABELS } from '../lib/nav';
import { Icon } from '../lib/icons';
import { NotificationBell } from '../features/notifications/NotificationBell';

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { view } = useApp();
  return (
    <header
      style={{
        height: 56, background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 20,
      }}
    >
      <button
        onClick={onOpenMobile}
        className="mobile-menu-btn"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
          borderRadius: 7, border: 'none', background: 'none', color: 'var(--muted)', outline: 'none',
        }}
      >
        <Icon name="menu" size={17} />
      </button>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', flex: 1, letterSpacing: '-0.2px' }}>
        {VIEW_LABELS[view]}
      </span>
      <NotificationBell />
    </header>
  );
}
