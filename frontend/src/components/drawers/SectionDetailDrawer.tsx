import React from 'react';
import { MapPin, Activity, Clock, ShieldCheck, Layers, Wrench } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { TrackSection, MaintenanceTask, BlockOpportunity } from '../../types';

interface SectionDetailDrawerProps {
  section: TrackSection | null;
  isOpen: boolean;
  onClose: () => void;
  tasks?: MaintenanceTask[];
  opportunities?: BlockOpportunity[];
}

export const SectionDetailDrawer: React.FC<SectionDetailDrawerProps> = ({
  section,
  isOpen,
  onClose,
  tasks = [],
  opportunities = [],
}) => {
  if (!section) return null;

  const sectionTasks = tasks.filter((t) => t.location_section_id === section.section_id);
  const sectionOpps = opportunities.filter((o) => o.track_section_id === section.section_id);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={section.name || section.section_id}
      subtitle={`Corridor: ${section.corridor_id} • ${section.track_configuration || 'Double Track'}`}
      badge={
        <span
          style={{
            padding: '0.15rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            color: 'var(--accent-primary)',
          }}
        >
          {section.operational_status || 'OPERATIONAL'}
        </span>
      }
    >
      {/* Metric Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Section Length</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {section.distance_km || 24.5} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>km</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Max Speed: {section.max_permissible_speed_kmh || 130} km/h
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Maintenance Demand</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-danger)' }}>
            {sectionTasks.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
            {sectionOpps.length} Block Opportunities
          </div>
        </div>
      </div>

      {/* Track Assets & Infrastructure Details */}
      <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Track Infrastructure Profile
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Start → End:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{section.start_location} → {section.end_location}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Track Structure:</span>
          <strong style={{ color: 'var(--text-primary)' }}>60kg 90UTS Rails on PSC Sleepers</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Signalling System:</span>
          <strong style={{ color: 'var(--text-primary)' }}>Automatic Block Signalling (ABS)</strong>
        </div>
      </div>
    </Drawer>
  );
};
