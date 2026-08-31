import React from 'react';
import { Users, MapPin, Wrench, ShieldCheck, Clock, CheckCircle2, Activity } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Resource } from '../../types';

interface ResourceDetailDrawerProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  allocatedTaskId?: string | null;
}

export const ResourceDetailDrawer: React.FC<ResourceDetailDrawerProps> = ({
  resource,
  isOpen,
  onClose,
  allocatedTaskId,
}) => {
  if (!resource) return null;

  const isAllocated = Boolean(allocatedTaskId);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={resource.resource_name || resource.resource_id}
      subtitle={`Capability: ${resource.capability?.replace(/_/g, ' ') || 'General Fleet'} • Depot: ${resource.home_depot_location || 'GZB Depot'}`}
      badge={
        <span
          style={{
            padding: '0.15rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: isAllocated ? 'rgba(217, 119, 6, 0.12)' : 'rgba(22, 163, 74, 0.12)',
            color: isAllocated ? 'var(--accent-warning)' : 'var(--accent-success)',
          }}
        >
          {isAllocated ? `ALLOCATED: ${allocatedTaskId}` : 'READY AT DEPOT'}
        </span>
      }
    >
      {/* Overview Metric Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Department</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {resource.department}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {resource.department === 'ENGG' ? 'Civil Engineering' : resource.department === 'TRD' ? 'Traction Distribution' : 'Signalling & Telecom'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Home Depot Location</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {resource.home_depot_location || 'GZB Depot'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Status: {resource.status || 'AVAILABLE'}
          </div>
        </div>
      </div>

      {/* Equipment Certification & Maintenance Status */}
      <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Equipment Fitness & Safety Certification
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)' }}>
            <CheckCircle2 size={14} />
            <span>RDSO Periodic Overhaul (POH) Certified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)' }}>
            <CheckCircle2 size={14} />
            <span>Crew Competency & Night Shift Clearance Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)' }}>
            <CheckCircle2 size={14} />
            <span>GPS Telemetry & Speed Recorder Operational</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
