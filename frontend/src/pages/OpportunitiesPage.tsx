import React, { useState } from 'react';
import { Calendar, Filter, Info, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { BlockOpportunity } from '../types';
import { useScenario } from '../context/ScenarioContext';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, loadingAll, trains } = useScenario();
  const [selectedOpp, setSelectedOpp] = useState<BlockOpportunity | null>(null);
  const [filterSection, setFilterSection] = useState<string>('ALL');

  const filteredOpportunities = opportunities.filter((opp) =>
    filterSection === 'ALL' ? true : opp.track_section_id === filterSection
  );

  const sections = Array.from(new Set(opportunities.map((o) => o.track_section_id)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
            Candidate Block Opportunities ({opportunities.length})
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Discovered low-density traffic windows derived from active timetable headway analysis
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: '#f8fafc',
              fontSize: '0.8rem',
            }}
          >
            <option value="ALL">All Track Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Opportunity Suitability Inspector */}
      {selectedOpp && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--accent-primary)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Opportunity Suitability Rationale: {selectedOpp.opportunity_id}
              </h3>
            </div>
            <button
              onClick={() => setSelectedOpp(null)}
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', border: 'none', background: 'none' }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <strong>Why This Window is Suitable:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
              <li><strong>Section Allocation:</strong> Positioned on section <strong style={{ color: '#f8fafc' }}>{selectedOpp.track_section_id}</strong> ({selectedOpp.corridor_id}).</li>
              <li><strong>Duration Capacity:</strong> Provides <strong style={{ color: 'var(--accent-warning)' }}>{selectedOpp.maximum_duration_mins} minutes</strong> continuous maintenance possession.</li>
              <li><strong>Power Isolation:</strong> OHE Electrical Traction power block is <strong style={{ color: selectedOpp.is_power_block_available ? 'var(--accent-success)' : 'var(--text-muted)' }}>{selectedOpp.is_power_block_available ? 'AVAILABLE' : 'NOT REQUIRED'}</strong>.</li>
              <li><strong>Timetable Headway:</strong> Discovered between low-density passenger/freight paths with zero conflict to high-priority Rajdhani/Shatabdi express corridors.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loadingAll ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading opportunities...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Opportunity ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Section</th>
                <th style={{ padding: '0.85rem 1rem' }}>Window Start</th>
                <th style={{ padding: '0.85rem 1rem' }}>Window End</th>
                <th style={{ padding: '0.85rem 1rem' }}>Max Duration</th>
                <th style={{ padding: '0.85rem 1rem' }}>OHE Power Block</th>
                <th style={{ padding: '0.85rem 1rem' }}>Suitability</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.map((opp) => (
                <tr
                  key={opp.opportunity_id}
                  onClick={() => setSelectedOpp(opp)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: selectedOpp?.opportunity_id === opp.opportunity_id ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {opp.opportunity_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {opp.track_section_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(opp.window_start).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(opp.window_end).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                    {opp.maximum_duration_mins} mins
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: opp.is_power_block_available ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                    {opp.is_power_block_available ? 'Available' : 'Unavailable'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedOpp(opp); }}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-dark)',
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      View Rationale
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
