'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Application {
  _id: string;
  company: string;
  role: string;
  location?: string;
  stage: string;
  priority: string;
  jdUrl?: string;
  jdText?: string;
  notes?: string;
  resumeUsed?: string;
  salaryRange?: string;
  contacts: { name: string; email?: string; role?: string }[];
  timeline: { event: string; date: string; source: string; note?: string }[];
  nextActionDate?: string;
  nextActionNote?: string;
  createdAt: string;
  updatedAt: string;
}

const STAGES = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected'];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [aiPanel, setAiPanel] = useState<'none' | 'email' | 'interview'>('none');
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/applications/${id}`).then(r => r.json()).then(data => {
      setApp(data);
      setNotes(data.notes || '');
    }).finally(() => setLoading(false));
  }, [id]);

  const saveNotes = async () => {
    await api.put(`/api/applications/${id}`, { notes });
    setEditing(false);
  };

  const updateStage = async (stage: string) => {
    const res = await api.patch(`/api/applications/${id}/stage`, { stage });
    const data = await res.json();
    setApp(data);
  };

  const addTimeline = async () => {
    if (!newEvent.trim()) return;
    const res = await api.post(`/api/applications/${id}/timeline`, { event: newEvent });
    const data = await res.json();
    setApp(data);
    setNewEvent('');
  };

  const generateEmail = async () => {
    if (!app) return;
    setAiPanel('email');
    setAiLoading(true);
    try {
      const res = await api.post('/api/ai/email-draft', {
        company: app.company, role: app.role, stage: app.stage,
        emailType: 'follow-up',
      });
      const data = await res.json();
      const parsed = JSON.parse(data.output.replace(/```json\n?|\n?```/g, '').trim());
      setAiOutput(`Subject: ${parsed.subject}\n\n${parsed.body}`);
    } catch { setAiOutput('Failed to generate email. Please try again.'); }
    setAiLoading(false);
  };

  const generateInterviewPrep = async () => {
    if (!app) return;
    setAiPanel('interview');
    setAiLoading(true);
    try {
      const res = await api.post('/api/ai/interview-prep', {
        company: app.company, role: app.role,
        jobDescription: app.jdText || `${app.role} at ${app.company}`,
        applicationId: app._id,
      });
      const data = await res.json();
      setAiOutput(data.output);
    } catch { setAiOutput('Failed to generate interview prep. Please try again.'); }
    setAiLoading(false);
  };

  const deleteApp = async () => {
    if (!confirm('Delete this application?')) return;
    await api.delete(`/api/applications/${id}`);
    router.push('/board');
  };

  if (loading) return (
    <div className="page-container">
      <div style={{ height: '400px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
    </div>
  );

  if (!app) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-state-title">Application not found</div>
        <button className="btn btn-primary btn-sm" onClick={() => router.push('/board')}>Back to Board</button>
      </div>
    </div>
  );

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/board')} style={{ marginBottom: '12px', paddingLeft: 0 }}>
            ← Back to Board
          </button>
          <h1 className="page-title">{app.company}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>{app.role}</p>
          {app.location && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{app.location}</p>}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button className="btn btn-danger btn-sm" onClick={deleteApp} id="delete-application-btn">Delete</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stage Selector */}
          <div className="card">
            <div className="card-title">Stage</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {STAGES.map(stage => (
                <button
                  key={stage}
                  onClick={() => updateStage(stage)}
                  className={`stage-badge stage-${stage}`}
                  style={{
                    cursor: 'pointer', border: `2px solid ${app.stage === stage ? `var(--stage-${stage})` : 'transparent'}`,
                    opacity: app.stage === stage ? 1 : 0.5, transition: 'all 200ms',
                    background: app.stage === stage ? undefined : 'transparent',
                  }}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="card">
            <div className="card-title">Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
                <span className={`priority-badge priority-${app.priority}`}>{app.priority}</span>
              </div>
              {app.salaryRange && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salary Range</div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{app.salaryRange}</span>
                </div>
              )}
              {app.resumeUsed && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resume Used</div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{app.resumeUsed}</span>
                </div>
              )}
              {app.jdUrl && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JD Link</div>
                  <a href={app.jdUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>View JD</a>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied On</div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{new Date(app.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="card-title" style={{ margin: 0 }}>Notes</div>
              {editing
                ? <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={saveNotes}>Save</button>
                  </div>
                : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} id="edit-notes-btn">Edit</button>
              }
            </div>
            {editing ? (
              <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this application..." />
            ) : (
              <p style={{ fontSize: '0.875rem', color: notes ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {notes || 'No notes yet. Click Edit to add.'}
              </p>
            )}
          </div>

          {/* Contacts */}
          {app.contacts?.length > 0 && (
            <div className="card">
              <div className="card-title">Contacts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {app.contacts.map((c, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.name}</div>
                    {c.role && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.role}</div>}
                    {c.email && <div style={{ fontSize: '0.78rem', color: 'var(--accent)', marginTop: '2px' }}>{c.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Timeline + AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Sidebar */}
          <div className="card" style={{ borderColor: 'var(--accent-light)' }}>
            <div className="card-title">AI Coach</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={generateEmail} id="generate-email-btn">
                Draft Follow-up Email
              </button>
              <button className="btn btn-secondary btn-sm" onClick={generateInterviewPrep} id="generate-interview-btn">
                Interview Prep
              </button>
            </div>
            {aiLoading && <div style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>AI is thinking...</div>}
            {aiOutput && !aiLoading && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                {aiOutput}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-title">Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', marginBottom: '16px' }}>
              {app.timeline.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No events yet</p>
              )}
              {[...app.timeline].reverse().map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: i < app.timeline.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: event.source === 'gmail' ? 'var(--accent)' : 'var(--text-muted)', marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{event.event}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(event.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                      {event.source === 'gmail' && ' · via Gmail'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add event */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input"
                placeholder="Log an event..."
                value={newEvent}
                onChange={e => setNewEvent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTimeline()}
                id="timeline-event-input"
              />
              <button className="btn btn-primary btn-sm" onClick={addTimeline} style={{ flexShrink: 0 }}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
