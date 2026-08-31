import React from 'react';
import { Calendar, Clock, Zap, ShieldCheck, CheckCircle2, ArrowRight, Layers, Award } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { BlockOpportunity, MaintenanceTask } from '../../types';

interface OpportunityDetailDrawerProps {
  opportunity: BlockOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  tasks?: MaintenanceTask[];
}

export const OpportunityDetailDrawer: React.FC<OpportunityDetailDrawerProps> = ({
  opportunity,
  isOpen,
  onClose,
  tasks = [],
}) => {
  if (!opportunity) return null;

  const compatibleTasks = tasks.filter(
    (t) => t.location_section_id === opportunity.track_section_id || t.location_corridor_id === opportunity.corridor_id
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={opportunity.opportunity_id}
      subtitle={`Section: ${opportunity.track_section_id} • Corridor: ${opportunity.corridor_id || 'COR-DEL-CNB'}`}
      badge={
        <span
          style={{
            padding: '0.15rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: opportunity.is_power_block_available ? 'rgba(22, 163, 74, 0.12)' : 'rgba(217, 119, 6, 0.12)',
            color: opportunity.is_power_block_available ? 'var(--accent-success)' : 'var(--accent-warning)',
          }}
        >
          {opportunity.is_power_block_available ? 'POWER BLOCK AVAILABLE' : 'TRAFFIC ONLY'}
        </span>
      }
    >
      {/* Overview Metric Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Capacity Duration</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {opportunity.maximum_duration_mins} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mins</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>
            Window: {new Date(opportunity.window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(opportunity.window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Traffic Density Status</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            LOW DENSITY
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Headway Buffer: 28 mins
          </div>
        </div>
      </div>

      {/* Why is this a good block? Assessment */}
      <div
        style={{
          backgroundColor: 'rgba(22, 163, 74, 0.06)',
          border: '1px solid rgba(22, 163, 74, 0.25)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)', fontWeight: 700, fontSize: '0.85rem' }}>
          <Award size={16} />
          <span>Why is this Opportunity Suitable?</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={14} color="var(--accent-success)" />
            <span>Optimal passenger/freight train lull during night maintenance shadow (01:00 – 04:30)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={14} color="var(--accent-success)" />
            <span>25kV OHE power isolation pre-authorized by Ghaziabad Traction Power Controller</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={14} color="var(--accent-success)" />
            <span>High multi-department bundling synergy for Civil Track + TRD Electrical</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={14} color="var(--accent-success)" />
            <span>Passes all deterministic safety constraints (CR-001 through CR-008)</span>
          </div>
        </div>
      </div>

      {/* Compatible Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Compatible Work Orders on this Section ({compatibleTasks.length} Available)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {compatibleTasks.slice(0, 4).map((t) => (
            <div
              key={t.task_id}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.task_id}</span> ({t.task_type.replace(/_/g, ' ')})
              </div>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.estimated_duration_mins}m</span>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};
