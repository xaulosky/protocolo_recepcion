import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { enablePush, pushSupported } from '../../lib/push';
import { Icon } from '../../lib/icons';
import { useApp } from '../../store/app-context';
import type { Notification as Notif } from '../../lib/types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'recién';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export function NotificationBell() {
  const { toast } = useApp();
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ notifications: Notif[]; unread: number }>('/notifications');
      setItems(res.notifications);
      setUnread(res.unread);
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, [load]);

  // Cerrar al hacer click fuera.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markAll = async () => {
    await api.post('/notifications/read-all');
    setUnread(0);
    setItems((cur) => cur.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  };

  const markOne = async (n: Notif) => {
    if (n.readAt) return;
    await api.post(`/notifications/${n.id}/read`);
    setUnread((u) => Math.max(0, u - 1));
    setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
  };

  const activarPush = async () => {
    const res = await enablePush();
    toast(res.ok ? 'Notificaciones push activadas' : res.reason ?? 'No se pudo activar push');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="icon-btn"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 7, border: 'none', background: 'none', color: 'var(--muted)', position: 'relative' }}
        aria-label="Notificaciones"
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: 'var(--orange)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fade-up"
          style={{ position: 'absolute', top: 44, right: 0, width: 340, maxWidth: '90vw', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card-lg)', zIndex: 80, overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Notificaciones</span>
            {unread > 0 && <button onClick={markAll} style={{ fontSize: 11.5, color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 500 }}>Marcar todas</button>}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--muted-3)', fontSize: 13 }}>Sin notificaciones</div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markOne(n)}
                  style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-softer)', cursor: n.readAt ? 'default' : 'pointer', background: n.readAt ? '#fff' : 'var(--surface-soft)', display: 'flex', gap: 10 }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5, background: n.readAt ? 'transparent' : 'var(--orange)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.45, marginTop: 1 }}>{n.body}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted-3)', marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pushSupported() && (
            <button onClick={activarPush} className="btn btn-soft btn-sm" style={{ margin: 10, width: 'calc(100% - 20px)' }}>
              <Icon name="bell" size={13} /> Activar notificaciones push
            </button>
          )}
        </div>
      )}
    </div>
  );
}
