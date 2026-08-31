import React, { useState } from 'react';
import { Users, Wrench, ShieldCheck, MapPin, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { Resource } from '../types';
import { ResourceDetailDrawer } from '../components/drawers/ResourceDetailDrawer';

export const ResourcesPage: React.FC = () => {
  const { resources, activePlan } = useScenario();

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const handleOpenResource = (res: Resource) => {
    setSelectedResource(res);
    setIsDrawerOpen(true);
  };

  const filteredResources = resources.filter((r) =>
    selectedDept === 'ALL' ? true : r.department === selectedDept
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Fleet Overview Meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Machinery & Crew Units
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {resources.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Units</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)', fontWeight: 600 }}>
            100% POH Certified & Active
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Civil Heavy Track Machines
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {resources.filter((r) => r.department === 'ENGG').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            CSM Tamping, BCM Ballast, SPENO Grinder
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            OHE Tower Wagons (TRD)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
            {resources.filter((r) => r.department === 'TRD').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            4-Wheeler & 8-Wheeler Self-Propelled
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            S&T Specialist Testing Gangs
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            {resources.filter((r) => r.department === 'ST').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Point Machine & Axle Counter Units
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: '6px' }}>
          {['ALL', 'ENGG', 'TRD', 'ST'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: selectedDept === dept ? 700 : 500,
                backgroundColor: selectedDept === dept ? 'var(--accent-primary)' : 'transparent',
                color: selectedDept === dept ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
              }}
            >
              {dept === 'ALL' ? 'All Resources' : dept}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredResources.length} certified machinery & crew units
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredResources.map((res) => (
          <div
            key={res.resource_id}
            onClick={() => handleOpenResource(res)}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.25rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {res.resource_name || res.resource_id}
              </span>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor:
                    res.department === 'ENGG'
                      ? 'rgba(2, 132, 199, 0.1)'
                      : res.department === 'ST'
                      ? 'rgba(22, 163, 74, 0.1)'
                      : 'rgba(217, 119, 6, 0.1)',
                  color:
                    res.department === 'ENGG'
                      ? 'var(--accent-primary)'
                      : res.department === 'ST'
                      ? 'var(--accent-success)'
                      : 'var(--accent-warning)',
                }}
              >
                {res.department}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Capability: {res.capability?.replace(/_/g, ' ') || 'General Fleet'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Depot: <strong style={{ color: 'var(--text-primary)' }}>{res.home_depot_location || 'GZB Depot'}</strong></span>
              <span>Status: <strong style={{ color: 'var(--accent-success)' }}>{res.status || 'AVAILABLE'}</strong></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>Inspect Fleet Unit</span>
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Detail Drawer */}
      <ResourceDetailDrawer
        resource={selectedResource}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
