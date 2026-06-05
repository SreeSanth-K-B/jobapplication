'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import AddApplicationModal from '@/components/AddApplicationModal';

type Stage = 'wishlist' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

interface Application {
  _id: string;
  company: string;
  role: string;
  location?: string;
  stage: Stage;
  priority: 'low' | 'medium' | 'high';
  updatedAt: string;
  createdAt: string;
}

const STAGES: Stage[] = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected'];
const STAGE_LABELS: Record<Stage, string> = {
  wishlist: 'Wishlist', applied: 'Applied', screening: 'Screening',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
};

export default function BoardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Stage | null>(null);
  const router = useRouter();

  const fetchApps = async () => {
    try {
      const res = await api.get('/api/applications');
      const data = await res.json();
      setApplications(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const handleDrop = async (stage: Stage) => {
    if (!dragging) return;
    const app = applications.find(a => a._id === dragging);
    if (!app || app.stage === stage) { handleDragEnd(); return; }

    setApplications(prev => prev.map(a => a._id === dragging ? { ...a, stage } : a));
    try {
      await api.patch(`/api/applications/${dragging}/stage`, { stage });
    } catch { fetchApps(); }
    handleDragEnd();
  };

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter(a => a.stage === stage);
    return acc;
  }, {} as Record<Stage, Application[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-primary)', flexShrink: 0,
      }}>
        <div>
          <h1 className="page-title">Board</h1>
          <p className="page-subtitle">{applications.length} applications total</p>
        </div>
        <button id="add-application-btn" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusIcon /> Add Application
        </button>
      </div>

      {/* Kanban Board */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '24px 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            {STAGES.map(s => <ColumnSkeleton key={s} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', height: '100%', minWidth: 'max-content' }}>
            {STAGES.map(stage => (
              <KanbanColumn
                key={stage}
                stage={stage}
                label={STAGE_LABELS[stage]}
                cards={grouped[stage]}
                isDragOver={dragOver === stage}
                onDragOver={() => setDragOver(stage)}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(stage)}
                onCardDragStart={handleDragStart}
                onCardDragEnd={handleDragEnd}
                onCardClick={(id) => router.push(`/applications/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { fetchApps(); setShowAddModal(false); }}
        />
      )}
    </div>
  );
}

function KanbanColumn({ stage, label, cards, isDragOver, onDragOver, onDragLeave, onDrop, onCardDragStart, onCardDragEnd, onCardClick }: {
  stage: Stage; label: string; cards: Application[];
  isDragOver: boolean;
  onDragOver: () => void; onDragLeave: () => void; onDrop: () => void;
  onCardDragStart: (id: string) => void; onCardDragEnd: () => void;
  onCardClick: (id: string) => void;
}) {
  return (
    <div
      style={{
        width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: isDragOver ? 'var(--bg-hover)' : 'var(--bg-secondary)',
        borderRadius: '12px', border: `1px solid ${isDragOver ? 'var(--accent)' : 'var(--border-color)'}`,
        transition: 'border-color 200ms, background 200ms', maxHeight: '100%',
      }}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={`stage-badge stage-${stage}`}>{label}</span>
          <span style={{
            width: '22px', height: '22px', background: 'var(--bg-tertiary)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)',
          }}>{cards.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cards.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Drop cards here
          </div>
        )}
        {cards.map(card => (
          <KanbanCard
            key={card._id}
            card={card}
            onDragStart={() => onCardDragStart(card._id)}
            onDragEnd={onCardDragEnd}
            onClick={() => onCardClick(card._id)}
          />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({ card, onDragStart, onDragEnd, onClick }: {
  card: Application; onDragStart: () => void; onDragEnd: () => void; onClick: () => void;
}) {
  const daysAgo = Math.floor((Date.now() - new Date(card.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="animate-slide-up"
      style={{
        padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px',
        border: '1px solid var(--border-color)', cursor: 'grab', transition: 'border-color 200ms, box-shadow 200ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {card.company}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
        {card.role}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`priority-badge priority-${card.priority}`}>{card.priority}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
        </span>
      </div>
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div style={{ width: '260px', flexShrink: 0, background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', height: '400px' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ height: '20px', width: '80px', background: 'var(--bg-tertiary)', borderRadius: '10px' }} />
      </div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1,2].map(i => <div key={i} style={{ height: '80px', background: 'var(--bg-tertiary)', borderRadius: '8px' }} />)}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
