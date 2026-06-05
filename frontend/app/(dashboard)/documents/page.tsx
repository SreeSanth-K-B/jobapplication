'use client';

import { useAuth } from '@/lib/auth-context';

export default function DocumentsPage() {
  const { user } = useAuth();

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <p className="page-subtitle">Manage your resumes and cover letters</p>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <div className="card-title">Documents Vault</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
          File storage integration (AWS S3 / Cloudinary) is ready to be connected.
          Currently you can reference document names in your applications under the &quot;Resume Used&quot; field.
        </p>
        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--accent-light)', border: '1px solid var(--accent-glow)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px' }}>Coming in v2</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Upload PDF resumes, track which version you used per application, and store cover letter templates.
          </div>
        </div>
      </div>
    </div>
  );
}
