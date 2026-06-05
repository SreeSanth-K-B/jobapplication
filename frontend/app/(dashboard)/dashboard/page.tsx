'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AnalyticsOverview {
  total: number;
  stageCounts: Record<string, number>;
  responseRate: number;
  weeklyActivity: { date: string; count: number }[];
  hotApplications: { _id: string; company: string; role: string; stage: string; updatedAt: string }[];
  goal: { target: number; current: number; percentage: number };
}

const STAGES = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected'];

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [nudges, setNudges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      api.get('/api/analytics/overview').then(r => r.json()),
      api.get('/api/ai/nudge').then(r => r.json()),
    ]).then(([overview, nudgeData]) => {
      setData(overview);
      setNudges(nudgeData.nudges || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const maxActivity = Math.max(...(data?.weeklyActivity.map(d => d.count) || [1]), 1);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your job search at a glance</p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard title="Total Applications" value={data?.total || 0} sub="across all stages" accent />
        <StatCard title="Response Rate" value={`${data?.responseRate || 0}%`} sub="of applied applications" />
        <StatCard title="In Interview" value={data?.stageCounts['interview'] || 0} sub="active interviews" color="var(--stage-interview)" />
        <StatCard title="Offers" value={data?.stageCounts['offer'] || 0} sub="total offers received" color="var(--stage-offer)" />
      </div>

      <div className="content-grid" style={{ marginBottom: '24px' }}>
        {/* Funnel */}
        <div className="card">
          <div className="card-title">Application Funnel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {STAGES.map(stage => {
              const count = data?.stageCounts[stage] || 0;
              const max = data?.total || 1;
              const pct = Math.round((count / max) * 100);
              return (
                <div key={stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className={`stage-badge stage-${stage}`}>{stage}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: `var(--stage-${stage})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <div className="card-title">Weekly Activity</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', marginTop: '16px' }}>
            {data?.weeklyActivity.map(day => {
              const height = maxActivity > 0 ? Math.max((day.count / maxActivity) * 120, day.count > 0 ? 8 : 0) : 0;
              const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
              return (
                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{day.count > 0 ? day.count : ''}</span>
                  <div style={{ width: '100%', position: 'relative', height: '120px', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: '100%', height: `${height}px`, background: 'var(--accent)',
                      borderRadius: '4px 4px 0 0', transition: 'height 600ms ease',
                      opacity: day.count > 0 ? 1 : 0.15,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Goal Progress */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weekly Goal</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {data?.goal.current} / {data?.goal.target} apps
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${data?.goal.percentage || 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Hot Applications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title" style={{ margin: 0 }}>Needs Attention</div>
            <Link href="/board" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>View all</Link>
          </div>
          {data?.hotApplications.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active applications yet</p>
              <Link href="/board" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Add Application</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data?.hotApplications.map(app => (
                <div
                  key={app._id}
                  onClick={() => router.push(`/applications/${app._id}`)}
                  style={{
                    padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px',
                    cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 200ms',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{app.company}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{app.role}</div>
                  </div>
                  <span className={`stage-badge stage-${app.stage}`}>{app.stage}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Nudges */}
        <div className="card">
          <div className="card-title">AI Nudges</div>
          {nudges.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
              No pending nudges — your job search is on track!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {nudges.map((nudge, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  background: 'var(--accent-light)',
                  borderLeft: '3px solid var(--accent)',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}>
                  {nudge}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '16px' }}>
            <Link href="/ai-coach" className="btn btn-secondary btn-sm">Open AI Coach</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, accent, color }: {
  title: string; value: number | string; sub: string; accent?: boolean; color?: string;
}) {
  return (
    <div className="card" style={{ borderColor: accent ? 'var(--accent)' : undefined }}>
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ color: color || (accent ? 'var(--accent)' : 'var(--text-primary)') }}>{value}</div>
      <div className="card-sub">{sub}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ height: '28px', width: '180px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ height: '16px', width: '240px', background: 'var(--bg-secondary)', borderRadius: '6px' }} />
      </div>
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="card" style={{ height: '100px' }}>
            <div style={{ height: '12px', width: '80px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '12px' }} />
            <div style={{ height: '32px', width: '60px', background: 'var(--bg-tertiary)', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
