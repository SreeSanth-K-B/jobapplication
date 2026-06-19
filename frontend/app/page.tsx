'use client';

import { AuthProvider } from '@/lib/auth-context';
import Link from 'next/link';
import HireHuntLogo from '@/components/HireHuntLogo';

export default function HomePage() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
          <HireHuntLogo showText={true} size={44} variant="light" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', maxWidth: '600px' }}>
          Track every application.<br />Win the job.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.7, marginBottom: '36px' }}>
          HireHunt combines a Kanban board, AI coaching, and Gmail sync into one powerful job search engine — built for serious candidates.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/signup" className="btn btn-primary btn-lg" id="home-signup-btn">Get Started Free</Link>
          <Link href="/login" className="btn btn-secondary btn-lg" id="home-login-btn">Sign In</Link>
        </div>
        <div style={{ marginTop: '60px', display: 'flex', gap: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>Kanban Board</span>
          <span>AI Resume Analyzer</span>
          <span>Gmail Sync</span>
          <span>Interview Prep</span>
          <span>Analytics</span>
        </div>
      </div>
    </AuthProvider>
  );
}
