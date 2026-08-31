import React, { useState } from 'react';
import { MapPin, Activity, ShieldCheck, ArrowRight, Layers, Zap } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { TrackSection } from '../types';
import { SectionDetailDrawer } from '../components/drawers/SectionDetailDrawer';

export const CorridorsPage: React.FC = () => {
  const { tasks, opportunities } = useScenario();

  // Synthetic sections model for the Delhi-Kanpur high-density corridor
  const sections: TrackSection[] = [
    { section_id: 'SEC-DEL-GZB-01', corridor_id: 'COR-DEL-CNB', sequence_order: 1, name: 'Delhi Jn → Shahdara', start_location: 'Delhi Jn (DLI)', end_location: 'Shahdara (DSA)', distance_km: 14.2, max_permissible_speed_kmh: 110, track_configuration: 'Double Track Mainline', operational_status: 'OPERATIONAL' },
    { section_id: 'SEC-GZB-SBB-UP', corridor_id: 'COR-DEL-CNB', sequence_order: 2, name: 'Shahdara → Sahibabad', start_location: 'Shahdara (DSA)', end_location: 'Sahibabad (SBB)', distance_km: 12.8, max_permissible_speed_kmh: 130, track_configuration: 'Double Track Mainline', operational_status: 'OPERATIONAL' },
    { section_id: 'SEC-SBB-CNB-01', corridor_id: 'COR-DEL-CNB', sequence_order: 3, name: 'Sahibabad → Ghaziabad', start_location: 'Sahibabad (SBB)', end_location: 'Ghaziabad (GZB)', distance_km: 18.5, max_permissible_speed_kmh: 130, track_configuration: 'Quadruple Track Trunk', operational_status: 'OPERATIONAL' },
    { section_id: 'SEC-GZB-CNB-DN', corridor_id: 'COR-DEL-CNB', sequence_order: 4, name: 'Ghaziabad → Aligarh Jn', start_location: 'Ghaziabad (GZB)', end_location: 'Aligarh Jn (ALR)', distance_km: 42.0, max_permissible_speed_kmh: 130, track_configuration: 'Double Track High-Density', operational_status: 'OPERATIONAL' },
    { section_id: 'SEC-ALR-TDL-01', corridor_id: 'COR-DEL-CNB', sequence_order: 5, name: 'Aligarh Jn → Tundla Jn', start_location: 'Aligarh Jn (ALR)', end_location: 'Tundla Jn (TDL)', distance_km: 56.4, max_permissible_speed_kmh: 130, track_configuration: 'Double Track High-Density', operational_status: 'OPERATIONAL' },
    { section_id: 'SEC-TDL-CNB-DN', corridor_id: 'COR-DEL-CNB', sequence_order: 6, name: 'Tundla Jn → Kanpur Central', start_location: 'Tundla Jn (TDL)', end_location: 'Kanpur Central (CNB)', distance_km: 84.0, max_permissible_speed_kmh: 130, track_configuration: 'Double Track High-Density', operational_status: 'OPERATIONAL' },
  ];

  const [selectedSection, setSelectedSection] = useState<TrackSection | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const handleOpenSection = (sec: TrackSection) => {
    setSelectedSection(sec);
    setIsDrawerOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Overview Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Corridor Network Topology & Track Sections
          </h2>
          <span style={{
            padding: '0.15rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            color: 'var(--accent-primary)',
          }}>
            COR-DEL-CNB Trunk Line
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Interactive schematic representation of Northern Railway trunk corridors, section lengths, speed profiles, and active block possession demands.
        </p>
      </div>

      {/* Interactive Topology Schematic Diagram */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Corridor Track Topology Schematic
        </div>

        {/* Track Line Representation */}
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '1rem 0' }}>
          {sections.map((sec, idx) => {
            const secTasks = tasks.filter((t) => t.location_section_id === sec.section_id);
            return (
              <React.Fragment key={sec.section_id}>
                {/* Station Node */}
                <div
                  onClick={() => handleOpenSection(sec)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: '130px',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: secTasks.length > 0 ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                      border: '3px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.4rem', textAlign: 'center' }}>
                    {sec.name.split('→')[0].trim()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {sec.distance_km} km
                  </div>
                </div>

                {/* Track Segment Connector */}
                {idx < sections.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: '50px',
                      height: '4px',
                      backgroundColor: 'var(--accent-primary)',
                      position: 'relative',
                      top: '-12px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Sections Grid with Detail Drawers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {sections.map((sec) => {
          const secTasks = tasks.filter((t) => t.location_section_id === sec.section_id);
          const secOpps = opportunities.filter((o) => o.track_section_id === sec.section_id);

          return (
            <div
              key={sec.section_id}
              onClick={() => handleOpenSection(sec)}
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
                  {sec.name}
                </span>
                <span
                  style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {sec.section_id}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Length: <strong style={{ color: 'var(--text-primary)' }}>{sec.distance_km} km</strong></div>
                <div>Max Speed: <strong style={{ color: 'var(--text-primary)' }}>{sec.max_permissible_speed_kmh} km/h</strong></div>
                <div>Maintenance Demand: <strong style={{ color: 'var(--accent-danger)' }}>{secTasks.length} Tasks</strong></div>
                <div>Opportunities: <strong style={{ color: 'var(--accent-success)' }}>{secOpps.length} Windows</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span>Inspect Section</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Detail Drawer */}
      <SectionDetailDrawer
        section={selectedSection}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tasks={tasks}
        opportunities={opportunities}
      />
    </div>
  );
};
