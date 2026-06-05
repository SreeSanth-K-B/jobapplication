'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

type AITool = 'resume' | 'cover-letter' | 'interview' | 'email' | 'debrief';

const TOOLS: { id: AITool; label: string; desc: string }[] = [
  { id: 'resume', label: 'Resume Analyzer', desc: 'Score your resume against a job description' },
  { id: 'cover-letter', label: 'Cover Letter Generator', desc: 'Get a tailored cover letter in seconds' },
  { id: 'interview', label: 'Interview Prep', desc: 'Questions and frameworks for your next interview' },
  { id: 'email', label: 'Email Drafter', desc: 'Write follow-up or intro emails' },
  { id: 'debrief', label: 'Weekly Debrief', desc: 'AI summary of your job search this week' },
];

export default function AICoachPage() {
  const [activeTool, setActiveTool] = useState<AITool>('resume');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [tone, setTone] = useState('professional');
  const [emailType, setEmailType] = useState('follow-up');
  const [stage, setStage] = useState('applied');

  const run = async () => {
    setLoading(true);
    setOutput('');
    try {
      let res;
      switch (activeTool) {
        case 'resume':
          res = await api.post('/api/ai/resume-analyze', { resumeText, jobDescription, company, role });
          break;
        case 'cover-letter':
          res = await api.post('/api/ai/cover-letter', { company, role, jobDescription, resumeText, tone });
          break;
        case 'interview':
          res = await api.post('/api/ai/interview-prep', { company, role, jobDescription });
          break;
        case 'email':
          res = await api.post('/api/ai/email-draft', { company, role, stage, emailType });
          break;
        case 'debrief':
          res = await api.get('/api/ai/weekly-debrief');
          break;
      }
      const data = await res!.json();
      setOutput(data.output || JSON.stringify(data, null, 2));
    } catch (e) {
      setOutput('Error calling AI. Make sure your Gemini API key is configured.');
    }
    setLoading(false);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Coach</h1>
        <p className="page-subtitle">Powered by Gemini — your personal career assistant</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* Tool Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              id={`ai-tool-${tool.id}`}
              onClick={() => { setActiveTool(tool.id); setOutput(''); }}
              style={{
                padding: '14px 16px', background: activeTool === tool.id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                border: `1px solid ${activeTool === tool.id ? 'var(--accent)' : 'var(--border-color)'}`,
                borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 200ms',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: activeTool === tool.id ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '4px' }}>
                {tool.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{tool.desc}</div>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            {activeTool === 'resume' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>Resume Analyzer</h3>
                <div className="input-group">
                  <label className="input-label">Company Name</label>
                  <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" id="ai-company-input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer" id="ai-role-input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Job Description</label>
                  <textarea className="textarea" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." style={{ minHeight: '140px' }} id="ai-jd-input" />
                </div>
                <div className="input-group">
                  <label className="input-label">Your Resume</label>
                  <textarea className="textarea" value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume text here..." style={{ minHeight: '180px' }} id="ai-resume-input" />
                </div>
              </div>
            )}

            {activeTool === 'cover-letter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>Cover Letter Generator</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Company</label>
                    <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" id="cl-company" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Role</label>
                    <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="Role title" id="cl-role" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Tone</label>
                  <select className="select" value={tone} onChange={e => setTone(e.target.value)} id="cl-tone">
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="conversational">Conversational</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Job Description</label>
                  <textarea className="textarea" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job description..." id="cl-jd" />
                </div>
                <div className="input-group">
                  <label className="input-label">Your Background (from resume)</label>
                  <textarea className="textarea" value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume or key experience..." id="cl-resume" />
                </div>
              </div>
            )}

            {activeTool === 'interview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>Interview Prep</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Company</label>
                    <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" id="ip-company" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Role</label>
                    <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="Role title" id="ip-role" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Job Description</label>
                  <textarea className="textarea" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job description..." style={{ minHeight: '160px' }} id="ip-jd" />
                </div>
              </div>
            )}

            {activeTool === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>Email Drafter</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Company</label>
                    <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" id="ed-company" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Role</label>
                    <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="Role title" id="ed-role" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Type</label>
                    <select className="select" value={emailType} onChange={e => setEmailType(e.target.value)} id="ed-type">
                      <option value="follow-up">Follow-up</option>
                      <option value="thank-you">Thank You</option>
                      <option value="introduction">Introduction</option>
                      <option value="acceptance">Offer Acceptance</option>
                      <option value="rejection">Decline Offer</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Current Stage</label>
                    <select className="select" value={stage} onChange={e => setStage(e.target.value)} id="ed-stage">
                      {['wishlist','applied','screening','interview','offer','rejected'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'debrief' && (
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Weekly Debrief</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Get an AI-powered summary of your job search activity this week — what&apos;s working, what to improve, and what to do next.
                </p>
              </div>
            )}

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                id="ai-run-btn"
                className="btn btn-primary"
                onClick={run}
                disabled={loading}
              >
                {loading ? 'AI is thinking...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Output */}
          {(output || loading) && (
            <div className="card animate-slide-up">
              <div className="card-title">AI Output</div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: '16px', background: 'var(--bg-tertiary)', borderRadius: '4px', width: `${70 + i * 10}%` }} />)}
                </div>
              ) : (
                <div style={{
                  marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-primary)',
                  lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit',
                  maxHeight: '600px', overflowY: 'auto',
                }}>
                  {output}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
