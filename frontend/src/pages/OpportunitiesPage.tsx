import React, { useState } from 'react';
import { Layers, Clock, Zap, ShieldCheck, ArrowRight, Filter, Search, Award } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { BlockOpportunity } from '../types';
import { OpportunityDetailDrawer } from '../components/drawers/OpportunityDetailDrawer';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, tasks } = useScenario();

  const [selectedOpp, setSelectedOpp] = useState<BlockOpportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [powerFilter, setPowerFilter] = useState<string>('ALL');

  const handleOpenOpp = (opp: BlockOpportunity) => {
    setSelectedOpp(opp);
    setIsDrawerOpen(true);
  };

  const filteredOpps = opportunities.filter((o) => {
    if (powerFilter === 'POWER_ONLY') return o.is_power_block_available;
    if (powerFilter === 'TRAFFIC_ONLY') return !o.is_power_block_available;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Discovered Block Windows
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {opportunities.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Slots</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Low-Density Traffic Shadows
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Power Block Permits
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            {opportunities.filter((o) => o.is_power_block_available).length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)' }}>
            25kV OHE Isolation Approved
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Average Window Duration
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            195 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>mins</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Capacity for Track & OHE Bundles
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Safety Compliance
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)' }}>
            CR-001..CR-008 Verified
          </div>
        </div>
      </div>

      {/* Filter Bar */}
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
          {[
            { id: 'ALL', label: 'All Opportunities' },
            { id: 'POWER_ONLY', label: 'Power Blocks' },
            { id: 'TRAFFIC_ONLY', label: 'Traffic Only' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setPowerFilter(f.id)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: powerFilter === f.id ? 700 : 500,
                backgroundColor: powerFilter === f.id ? 'var(--accent-primary)' : 'transparent',
                color: powerFilter === f.id ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredOpps.length} available opportunity windows
        </div>
      </div>

      {/* Opportunities Grid with Detail Drawers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredOpps.map((opp) => (
          <div
            key={opp.opportunity_id}
            onClick={() => handleOpenOpp(opp)}
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
                {opp.opportunity_id}
              </span>
              <span
                style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: opp.is_power_block_available ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                  color: opp.is_power_block_available ? 'var(--accent-success)' : 'var(--accent-warning)',
                }}
              >
                {opp.is_power_block_available ? 'POWER BLOCK' : 'TRAFFIC ONLY'}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Section: {opp.track_section_id}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Window: {new Date(opp.window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(opp.window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <strong style={{ color: 'var(--accent-primary)' }}>{opp.maximum_duration_mins}m capacity</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>Why is this suitable?</span>
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Opportunity Detail Drawer */}
      <OpportunityDetailDrawer
        opportunity={selectedOpp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tasks={tasks}
      />
    </div>
  );
};
