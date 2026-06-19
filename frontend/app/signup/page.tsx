'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import HireHuntLogo from '@/components/HireHuntLogo';

function SignupForm() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <HireHuntLogo showText={false} size={44} variant="light" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Start tracking your job applications for free</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '28px', gap: '16px', display: 'flex', flexDirection: 'column' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input id="signup-name" className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required autoFocus />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input id="signup-email" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input id="signup-password" className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button id="signup-submit-btn" className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <AuthProvider><SignupForm /></AuthProvider>;
}
