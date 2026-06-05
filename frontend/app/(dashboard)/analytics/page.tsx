'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Overview {
  total: number;
  stageCounts: Record<string, number>;
  responseRate: number;
  weeklyActivity: { date: string; count: number }[];
  goal: { target: number; current: number; percentage: number };
}

const STAGE_COLORS: Record<string, string> = {
  wishlist: '#6B7280', applied: '#3B82F6', screening: '#8B5CF6',
  interview: '#F59E0B', offer: '#22C55E', rejected: '#EF4444',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    api.get('/api/analytics/overview').then(r => r.json()).then(d => {
      setData(d);
      setGoalInput(String(d.goal?.target || 10));
    }).finally(() => setLoading(false));
  }, []);

  const saveGoal = async () => {
    setSavingGoal(true);
    await api.put('/api/analytics/goal', { weeklyTarget: parseInt(goalInput) });
    const res = await api.get('/api/analytics/overview');
    setData(await res.json());
    setSavingGoal(false);
  };

  if (loading) return (
    <div className="page-container">
      <div style={{ height: '400px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
    </div>
  );

  const totalApplied = Object.entries(data?.stageCounts || {}).filter(([s]) => s !== 'wishlist').reduce((a, [, b]) => a + b, 0);
  const maxActivity = Math.max(...(data?.weeklyActivity.map(d => d.count) || [1]), 1);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights into your job search performance</p>
      </div>

      {/* Top Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-title">Total Applications</div>
          <div className="card-value" style={{ color: 'var(--accent)' }}>{data?.total || 0}</div>
          <div className="card-sub">all time</div>
        </div>
        <div className="card">
          <div className="card-title">Response Rate</div>
          <div className="card-value">{data?.responseRate || 0}%</div>
          <div className="card-sub">of {totalApplied} applied</div>
        </div>
        <div className="card">
          <div className="card-title">Active Interviews</div>
          <div className="card-value" style={{ color: 'var(--stage-interview)' }}>{data?.stageCounts['interview'] || 0}</div>
          <div className="card-sub">in progress</div>
        </div>
        <div className="card">
          <div className="card-title">Offers Received</div>
          <div className="card-value" style={{ color: 'var(--stage-offer)' }}>{data?.stageCounts['offer'] || 0}</div>
          <div className="card-sub">total</div>
        </div>
      </div>

      <div className="content-grid" style={{ marginBottom: '24px' }}>
        {/* Stage Breakdown */}
        <div className="card">
          <div className="card-title">Stage Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {Object.entries(data?.stageCounts || {}).map(([stage, count]) => {
              const pct = data?.total ? Math.round((count / data.total) * 100) : 0;
              return (
                <div key={stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className={`stage-badge stage-${stage}`}>{stage}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[stage] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="card">
          <div className="card-title">Applications per Day (Last 7 Days)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '180px', marginTop: '24px' }}>
            {data?.weeklyActivity.map(day => {
              const height = maxActivity > 0 ? Math.max((day.count / maxActivity) * 150, day.count > 0 ? 8 : 2) : 2;
              const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
              const dateLabel = new Date(day.date).toLocaleDateString('en', { day: 'numeric', month: 'short' });
              return (
                <div key={day.date} className="tooltip" data-tip={`${dateLabel}: ${day.count} apps`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'default' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minHeight: '16px' }}>
                    {day.count > 0 ? day.count : ''}
                  </span>
                  <div style={{ width: '100%', position: 'relative', height: '150px', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: '100%', height: `${height}px`, background: day.count > 0 ? 'var(--accent)' : 'var(--bg-tertiary)',
                      borderRadius: '4px 4px 0 0', transition: 'height 600ms ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Goal Setting */}
      <div className="card">
        <div className="card-title">Weekly Application Goal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Progress this week</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {data?.goal.current} / {data?.goal.target} applications
              </span>
            </div>
            <div className="progress-bar" style={{ height: '10px' }}>
              <div className="progress-fill" style={{ width: `${data?.goal.percentage || 0}%` }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Target per week</label>
              <input
                className="input"
                type="number"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                style={{ width: '80px' }}
                min="1"
                max="100"
                id="goal-target-input"
              />
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={saveGoal}
              disabled={savingGoal}
              style={{ marginTop: '18px' }}
              id="save-goal-btn"
            >
              {savingGoal ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
