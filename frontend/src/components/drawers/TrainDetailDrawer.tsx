import React from 'react';
import { Train, Clock, MapPin, AlertTriangle, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { TrainMovement } from '../../types';

interface TrainDetailDrawerProps {
  train: TrainMovement | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrainDetailDrawer: React.FC<TrainDetailDrawerProps> = ({
  train,
  isOpen,
  onClose,
}) => {
  if (!train) return null;

  const isHighPriority = train.priority_category === 1 || train.train_type.includes('RAJDHANI') || train.train_type.includes('EXPRESS');

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Train ${train.train_number || train.train_id}`}
      subtitle={`${train.train_type} • ${train.train_name || 'Corridor Express'}`}
      badge={
        <span
          style={{
            padding: '0.15rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: isHighPriority ? 'rgba(220, 38, 38, 0.12)' : 'rgba(2, 132, 199, 0.12)',
            color: isHighPriority ? 'var(--accent-danger)' : 'var(--accent-primary)',
          }}
        >
          {isHighPriority ? 'HIGH PRIORITY' : 'REGULAR PRIORITY'}
        </span>
      }
    >
      {/* Timetable Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corridor Entry Time</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {new Date(train.scheduled_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corridor Exit Time</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {new Date(train.scheduled_exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Speed & Headway Safety Status */}
      <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Direction:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{train.direction} Track</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Delay Status:</span>
          <strong style={{ color: train.delay_minutes > 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
            {train.delay_minutes > 0 ? `+${train.delay_minutes} mins delay` : 'On Time'}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Required Headway Buffer:</span>
          <strong style={{ color: 'var(--accent-success)' }}>&ge; 15 mins (Compliant)</strong>
        </div>
      </div>

      {/* Route Stops & Section Traversal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Section Traversal Path
        </h4>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>1. Delhi Junction (DLI) → Shahdara (DSA) [Clear]</div>
          <div style={{ margin: '0.3rem 0' }}>2. Sahibabad (SBB) → Ghaziabad (GZB) [Maintenance Window Cleared]</div>
          <div>3. Ghaziabad → Tundla Junction (TDL) → Kanpur Central (CNB)</div>
        </div>
      </div>
    </Drawer>
  );
};
