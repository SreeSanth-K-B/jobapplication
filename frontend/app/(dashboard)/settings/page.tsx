'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [targetRoles, setTargetRoles] = useState('');
  const [locations, setLocations] = useState('');
  const [salary, setSalary] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');
  const [gmailStatus, setGmailStatus] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const gmail = searchParams.get('gmail');
    if (gmail === 'connected') {
      setGmailStatus('Gmail connected successfully!');
      // Reload the page to refresh user state from server
      window.location.replace('/settings');
    } else if (gmail === 'error') {
      const reason = searchParams.get('reason');
      setGmailStatus(reason === 'no_refresh_token' ? 'Error: Please revoke access at myaccount.google.com/permissions and try again.' : 'Failed to connect Gmail. Please try again.');
    }
  }, [searchParams]);

  const saveProfile = async () => {
    setSaving(true);
    await api.put('/api/auth/profile', { name, targetRoles, preferredLocations: locations, salaryRange: salary });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const connectGmail = async () => {
    setGmailLoading(true);
    const res = await api.get('/api/gmail/auth-url');
    const data = await res.json();
    // Open in same tab so the callback redirect works correctly
    window.location.href = data.url;
  };

  const syncGmail = async () => {
    setSyncing(true);
    setSyncResult('');
    try {
      const res = await api.post('/api/gmail/sync', {});
      const data = await res.json();
      setSyncResult(`Sync complete — ${data.new} new, ${data.updated} updated`);
    } catch {
      setSyncResult('Sync failed. Check your connection.');
    }
    setSyncing(false);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and integrations</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        {/* Profile */}
        <div className="card">
          <div className="card-title">Profile</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" id="settings-name" />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} id="settings-email" />
            </div>
            <div className="input-group">
              <label className="input-label">Target Roles</label>
              <input className="input" value={targetRoles} onChange={e => setTargetRoles(e.target.value)} placeholder="e.g. SDE Intern, Backend Engineer" id="settings-roles" />
            </div>
            <div className="input-group">
              <label className="input-label">Preferred Locations</label>
              <input className="input" value={locations} onChange={e => setLocations(e.target.value)} placeholder="e.g. Bangalore, Remote" id="settings-locations" />
            </div>
            <div className="input-group">
              <label className="input-label">Expected Salary / Stipend</label>
              <input className="input" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 30,000/month" id="settings-salary" />
            </div>
            <button
              id="save-profile-btn"
              className="btn btn-primary"
              onClick={saveProfile}
              disabled={saving}
            >
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Gmail Integration */}
        <div className="card">
          <div className="card-title">Gmail Integration</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '16px' }}>
            Connect your Gmail to automatically detect job application emails and sync them to your board.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: user?.gmailConnected ? 'var(--success)' : 'var(--text-muted)',
              }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {user?.gmailConnected ? 'Gmail connected' : 'Gmail not connected'}
              </span>
            </div>
            {!user?.gmailConnected ? (
              <button
                id="connect-gmail-btn"
                className="btn btn-secondary"
                onClick={connectGmail}
                disabled={gmailLoading}
              >
                {gmailLoading ? 'Opening...' : 'Connect Gmail'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  id="sync-gmail-btn"
                  className="btn btn-primary"
                  onClick={syncGmail}
                  disabled={syncing}
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  id="disconnect-gmail-btn"
                  className="btn btn-danger"
                  onClick={async () => {
                    await api.delete('/api/gmail/disconnect');
                    window.location.reload();
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
            {syncResult && (
              <div style={{ padding: '10px 14px', background: 'var(--accent-light)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {syncResult}
              </div>
            )}
            {gmailStatus && (
              <div style={{ padding: '10px 14px', background: 'var(--accent-light)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {gmailStatus}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="card-title" style={{ color: 'var(--danger)' }}>Account</div>
          <div style={{ marginTop: '12px' }}>
            <button id="logout-btn" className="btn btn-danger" onClick={logout}>Log Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
