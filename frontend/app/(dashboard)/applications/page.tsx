'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import AddApplicationModal from '@/components/AddApplicationModal';

interface Application {
  _id: string;
  company: string;
  role: string;
  location?: string;
  stage: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

const STAGES = ['all', 'wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected'];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const fetchApps = async () => {
    const params = new URLSearchParams();
    if (stageFilter !== 'all') params.set('stage', stageFilter);
    if (search) params.set('search', search);
    const res = await api.get(`/api/applications?${params.toString()}`);
    const data = await res.json();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [stageFilter, search]);

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">{applications.length} total</p>
        </div>
        <button id="add-application-list-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Application
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="applications-search"
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STAGES.map(s => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              style={{
                padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                background: stageFilter === s ? 'var(--accent)' : 'var(--bg-secondary)',
                borderColor: stageFilter === s ? 'var(--accent)' : 'var(--border-color)',
                color: stageFilter === s ? 'white' : 'var(--text-secondary)',
                transition: 'all 200ms',
              }}
              id={`filter-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ height: '300px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
      ) : applications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-title">No applications found</div>
            <p className="empty-state-desc">Add your first application or adjust your filters</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ marginTop: '8px' }}>Add Application</button>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Applied</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr
                  key={app._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/applications/${app._id}`)}
                >
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{app.role}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{app.location || '—'}</td>
                  <td><span className={`stage-badge stage-${app.stage}`}>{app.stage}</span></td>
                  <td><span className={`priority-badge priority-${app.priority}`}>{app.priority}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(app.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(app.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddApplicationModal
          onClose={() => setShowModal(false)}
          onAdded={() => { fetchApps(); setShowModal(false); }}
        />
      )}
    </div>
  );
}
