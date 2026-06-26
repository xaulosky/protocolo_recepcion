import { useApp } from '../store/app-context';
import { Icon } from '../lib/icons';

export function Toast() {
  const { toastMsg } = useApp();
  if (!toastMsg) return null;
  return (
    <div
      className="fade-up"
      style={{
        position: 'fixed', bottom: 22, right: 22,
        background: '#1A1918', color: '#fff',
        padding: '11px 16px', borderRadius: 8, fontSize: 13,
        zIndex: 100, display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <Icon name="check" size={13} strokeWidth={2.5} style={{ color: 'var(--green-check)' }} />
      {toastMsg}
    </div>
  );
}
