'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

const STAGES = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected'];

export default function AddApplicationModal({ onClose, onAdded }: Props) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState('applied');
  const [priority, setPriority] = useState('medium');
  const [jdUrl, setJdUrl] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) { setError('Company and Role are required'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/applications', {
        company, role, location, stage, priority, jdUrl, salaryRange,
        timeline: [{ event: `Application added`, date: new Date(), source: 'manual' }],
      });
      onAdded();
    } catch {
      setError('Failed to add application. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <h2 className="modal-title">Add Application</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} id="close-add-modal-btn" style={{ width: '32px', height: '32px', padding: 0, fontSize: '18px' }}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Company Name *</label>
                <input id="modal-company" className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" autoFocus />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Role / Position *</label>
                <input id="modal-role" className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer Intern" />
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input id="modal-location" className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bangalore / Remote" />
              </div>
              <div className="input-group">
                <label className="input-label">Salary / Stipend</label>
                <input id="modal-salary" className="input" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="e.g. 30k/month" />
              </div>
              <div className="input-group">
                <label className="input-label">Stage</label>
                <select id="modal-stage" className="select" value={stage} onChange={e => setStage(e.target.value)}>
                  {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Priority</label>
                <select id="modal-priority" className="select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Job Description URL</label>
                <input id="modal-jd-url" className="input" value={jdUrl} onChange={e => setJdUrl(e.target.value)} placeholder="https://..." type="url" />
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="submit-add-application-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
