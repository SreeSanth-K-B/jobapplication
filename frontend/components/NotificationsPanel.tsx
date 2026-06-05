'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onRead: () => void;
}

export default function NotificationsPanel({ onClose, onRead }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/api/notifications').then(r => r.json()).then(data => {
      setNotifications(data.notifications || []);
    }).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.patch('/api/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onRead();
  };

  const markRead = async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={onClose} />
      <div
        ref={panelRef}
        className="animate-slide-up"
        style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: '360px',
          background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)',
          zIndex: 160, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={markAllRead} id="mark-all-read-btn">Mark all read</button>
            <button className="btn btn-ghost btn-sm" onClick={onClose} id="close-notifications-btn" style={{ fontSize: '18px', padding: '0 8px' }}>×</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: '72px', background: 'var(--bg-tertiary)', borderRadius: '8px' }} />)}
            </div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="empty-state" style={{ padding: '48px 24px' }}>
              <div className="empty-state-title">No notifications</div>
              <p className="empty-state-desc">You&apos;re all caught up!</p>
            </div>
          )}
          {notifications.map(notif => (
            <div
              key={notif._id}
              onClick={() => !notif.read && markRead(notif._id)}
              style={{
                padding: '14px', borderRadius: '8px', marginBottom: '6px',
                background: notif.read ? 'transparent' : 'var(--accent-light)',
                border: `1px solid ${notif.read ? 'transparent' : 'var(--accent-glow)'}`,
                cursor: notif.read ? 'default' : 'pointer', transition: 'all 200ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                {!notif.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '5px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{notif.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.message}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {new Date(notif.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
