import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { TrackSection, MaintenanceTask, BlockOpportunity } from '../types';
import { SectionDetailDrawer } from '../components/drawers/SectionDetailDrawer';

// Static section definitions (synthetic northern railway corridor)
const SECTIONS: TrackSection[] = [
  { section_id: 'SEC-DEL-GZB-01', corridor_id: 'COR-DEL-CNB', sequence_order: 1, name: 'Delhi Jn → Shahdara', start_location: 'Delhi Jn (DLI)', end_location: 'Shahdara (DSA)', distance_km: 14.2, max_permissible_speed_kmh: 110, track_configuration: 'Double Track Mainline', operational_status: 'OPERATIONAL' },
  { section_id: 'SEC-GZB-SBB-UP',  corridor_id: 'COR-DEL-CNB', sequence_order: 2, name: 'Shahdara → Sahibabad', start_location: 'Shahdara (DSA)', end_location: 'Sahibabad (SBB)', distance_km: 12.8, max_permissible_speed_kmh: 130, track_configuration: 'Double Track', operational_status: 'OPERATIONAL' },
  { section_id: 'SEC-SBB-CNB-01',  corridor_id: 'COR-DEL-CNB', sequence_order: 3, name: 'Sahibabad → Ghaziabad', start_location: 'Sahibabad (SBB)', end_location: 'Ghaziabad (GZB)', distance_km: 18.5, max_permissible_speed_kmh: 130, track_configuration: 'Quadruple Track Trunk', operational_status: 'OPERATIONAL' },
  { section_id: 'SEC-GZB-CNB-DN',  corridor_id: 'COR-DEL-CNB', sequence_order: 4, name: 'Ghaziabad → Aligarh Jn', start_location: 'Ghaziabad (GZB)', end_location: 'Aligarh Jn (ALR)', distance_km: 42.0, max_permissible_speed_kmh: 130, track_configuration: 'Double Track High-Density', operational_status: 'OPERATIONAL' },
  { section_id: 'SEC-ALR-TDL-01',  corridor_id: 'COR-DEL-CNB', sequence_order: 5, name: 'Aligarh Jn → Tundla Jn', start_location: 'Aligarh Jn (ALR)', end_location: 'Tundla Jn (TDL)', distance_km: 56.4, max_permissible_speed_kmh: 130, track_configuration: 'Double Track High-Density', operational_status: 'OPERATIONAL' },
  { section_id: 'SEC-TDL-CNB-DN',  corridor_id: 'COR-DEL-CNB', sequence_order: 6, name: 'Tundla Jn → Kanpur Central', start_location: 'Tundla Jn (TDL)', end_location: 'Kanpur Central (CNB)', distance_km: 84.0, max_permissible_speed_kmh: 130, track_configuration: 'Double Track High-Density', operational_status: 'OPERATIONAL' },
];

function getSectionColor(taskCount: number): string {
  if (taskCount === 0) return 'var(--accent-success)';
  if (taskCount <= 2) return 'var(--accent-warning)';
  return 'var(--accent-danger)';
}

export const CorridorsPage: React.FC = () => {
  const { tasks, opportunities } = useScenario();
  const [selected, setSelected]     = useState<TrackSection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoverId, setHoverId]       = useState<string | null>(null);

  const sectionTasks = (id: string) => tasks.filter(t => t.location_section_id === id);
  const sectionOpps  = (id: string) => opportunities.filter(o => o.track_section_id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header strip */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem 1.25rem', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          COR-DEL-CNB — Delhi–Kanpur Trunk Corridor
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>Total Length: <strong style={{ color: 'var(--text-primary)' }}>227.9 km</strong></span>
          <span>Sections: <strong style={{ color: 'var(--text-primary)' }}>6</strong></span>
          <span>Max Speed: <strong style={{ color: 'var(--text-primary)' }}>130 km/h</strong></span>
          <span>Track Config: <strong style={{ color: 'var(--text-primary)' }}>Double–Quadruple Track</strong></span>
          <span style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-success)', display: 'inline-block' }} />
              <span>No demand</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-warning)', display: 'inline-block' }} />
              <span>Maintenance needed</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-danger)', display: 'inline-block' }} />
              <span>High demand</span>
            </span>
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem' }}>
        {/* Vertical Topology Schematic */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem 1rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Network Topology
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {SECTIONS.map((sec, idx) => {
              const st = sectionTasks(sec.section_id);
              const color = getSectionColor(st.length);
              const isSelected = selected?.section_id === sec.section_id;
              const isHover = hoverId === sec.section_id;

              return (
                <React.Fragment key={sec.section_id}>
                  {/* Station node */}
                  <div
                    onClick={() => { setSelected(sec); setDrawerOpen(true); }}
                    onMouseEnter={() => setHoverId(sec.section_id)}
                    onMouseLeave={() => setHoverId(null)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                      cursor: 'pointer', width: '100%',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: isSelected ? color : isHover ? 'var(--bg-subtle)' : 'var(--bg-subtle)',
                      border: `2px solid ${isSelected ? color : color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 800, color: isSelected ? '#ffffff' : color,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 0 3px ${color}40` : 'none',
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)', lineHeight: 1.2 }}>
                        {sec.start_location.split('(')[0].trim()}
                      </div>
                      {st.length > 0 && (
                        <div style={{ fontSize: '0.62rem', color: color, fontWeight: 600 }}>
                          {st.length} task{st.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector with distance */}
                  {idx < SECTIONS.length - 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
                      <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--border-strong)' }} />
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)', fontWeight: 500 }}>
                        {sec.distance_km} km
                      </span>
                      <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--border-strong)' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Terminal station */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', marginTop: '4px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'var(--bg-subtle)', border: '2px solid var(--border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)',
              }}>CNB</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Kanpur Central</div>
            </div>
          </div>
        </div>

        {/* Section Details Table */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Track Section Details</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Click a row to inspect section</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Seq</th>
                  <th>Section</th>
                  <th>From → To</th>
                  <th>Length</th>
                  <th>Max Speed</th>
                  <th>Track Config</th>
                  <th>Maintenance</th>
                  <th>Opportunities</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map(sec => {
                  const st = sectionTasks(sec.section_id);
                  const so = sectionOpps(sec.section_id);
                  const color = getSectionColor(st.length);
                  const isSelected = selected?.section_id === sec.section_id;
                  return (
                    <tr key={sec.section_id} style={{ cursor: 'pointer', backgroundColor: isSelected ? 'var(--accent-primary-light)' : undefined }}
                      onClick={() => { setSelected(sec); setDrawerOpen(true); }}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{sec.sequence_order}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', color: 'var(--text-muted)' }}>{sec.section_id}</td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sec.start_location} <ArrowRight size={11} style={{ display: 'inline', opacity: 0.5, verticalAlign: 'middle' }} /> {sec.end_location}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sec.distance_km} km</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sec.max_permissible_speed_kmh} km/h</td>
                      <td style={{ fontSize: '0.73rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{sec.track_configuration}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700, color }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />
                          {st.length} task{st.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-blue">{so.length} windows</span>
                      </td>
                      <td>
                        <span className="badge badge-green">{sec.operational_status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          onClick={e => { e.stopPropagation(); setSelected(sec); setDrawerOpen(true); }}>
                          Inspect <ArrowRight size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SectionDetailDrawer section={selected} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} tasks={tasks} opportunities={opportunities} />
    </div>
  );
};
