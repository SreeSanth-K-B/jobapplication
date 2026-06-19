'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import HireHuntLogo from './HireHuntLogo';

const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <GridIcon /> },
      { href: '/board', label: 'Board', icon: <BoardIcon /> },
      { href: '/applications', label: 'Applications', icon: <ListIcon /> },
    ],
  },
  {
    section: 'AI Tools',
    items: [
      { href: '/ai-coach', label: 'AI Coach', icon: <AIIcon /> },
    ],
  },
  {
    section: 'Insights',
    items: [
      { href: '/analytics', label: 'Analytics', icon: <ChartIcon /> },
      { href: '/documents', label: 'Documents', icon: <DocIcon /> },
    ],
  },
  {
    section: 'Account',
    items: [
      { href: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    ],
  },
];

interface SidebarProps {
  unreadCount?: number;
  onNotificationsClick?: () => void;
}

export default function Sidebar({ unreadCount = 0, onNotificationsClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <>
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: '12px', padding: '28px', width: '320px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Log out?
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              You'll need to sign in again to access your account.
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)} id="cancel-logout-btn">
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => { setShowLogoutConfirm(false); logout(); }} id="confirm-logout-btn">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

        {/* ── Header ── */}
        <div className="sidebar-header">
          {collapsed ? (
            /* When collapsed: logo icon acts as expand button */
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              id="sidebar-expand-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '4px 0', color: 'var(--text-primary)',
              }}
            >
              <HireHuntLogo showText={false} size={32} variant="light" />
            </button>
          ) : (
            /* When expanded: logo + collapse button */
            <>
              <div className="sidebar-logo">
                <HireHuntLogo showText={true} size={32} variant="light" />
              </div>
              <button
                className="sidebar-toggle"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                id="sidebar-toggle-btn"
              >
                <ChevronLeftIcon />
              </button>
            </>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
                  id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}

          {/* Notifications */}
          <div className="sidebar-section-label">Alerts</div>
          <button
            className="nav-item nav-item-btn"
            onClick={onNotificationsClick}
            id="nav-notifications"
          >
            <span className="nav-icon"><BellIcon /></span>
            <span className="nav-label">Notifications</span>
            {unreadCount > 0 && (
              <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* Dark / Light mode toggle */}
          <button
            className="nav-item nav-item-btn"
            onClick={() => setDarkMode(!darkMode)}
            id="nav-theme-toggle"
          >
            <span className="nav-icon">{darkMode ? <SunIcon /> : <MoonIcon />}</span>
            <span className="nav-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </nav>

        {/* ── Footer / Profile ── */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={() => setShowLogoutConfirm(true)}
            id="sidebar-logout-btn"
            title="Log out"
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}

// ── Icons ──
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function BoardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
}
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function AIIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2l4 4-4 4"/><path d="M22 2h-4v4"/></svg>;
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
function DocIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>;
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function SunIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}
function ChevronLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
}
