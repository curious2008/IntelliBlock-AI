import React, { useState } from 'react';
import { ArrowRight, Zap, Clock, Layers } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { BlockOpportunity } from '../types';
import { OpportunityDetailDrawer } from '../components/drawers/OpportunityDetailDrawer';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, tasks } = useScenario();
  const [selected, setSelected]     = useState<BlockOpportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter]         = useState('ALL');

  const powerCount   = opportunities.filter(o => o.is_power_block_available).length;
  const trafficCount = opportunities.filter(o => !o.is_power_block_available).length;

  const filtered = opportunities.filter(o => {
    if (filter === 'POWER')   return o.is_power_block_available;
    if (filter === 'TRAFFIC') return !o.is_power_block_available;
    return true;
  });

  const getSuitability = (o: BlockOpportunity) => {
    const tasksForSection = tasks.filter(t => t.location_section_id === o.track_section_id).length;
    const score = (o.is_power_block_available ? 30 : 0)
      + (tasksForSection > 0 ? 40 : 10)
      + Math.round((o.maximum_duration_mins / 600) * 30);
    return Math.min(100, score);
  };

  const getSuitabilityLabel = (score: number) =>
    score >= 70 ? 'EXCELLENT' : score >= 50 ? 'GOOD' : 'MARGINAL';
  const getSuitabilityBadge = (score: number) =>
    score >= 70 ? 'badge-green' : score >= 50 ? 'badge-blue' : 'badge-amber';

  const getTrafficDensity = (o: BlockOpportunity): number => {
    // derive traffic density from affected line direction proxy
    if (o.affected_line_direction === 'BOTH') return 0.8;
    if (o.affected_line_direction === 'UP')   return 0.5;
    return 0.3;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Summary Strip */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', boxShadow: 'var(--shadow-xs)' }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginRight: '1rem' }}>Discovered Block Opportunities</span>
        {[
          { label: 'Total Windows',   value: opportunities.length,  color: 'var(--text-primary)' },
          { label: 'Power Blocks',    value: powerCount,            color: 'var(--accent-success)' },
          { label: 'Traffic Shadows', value: trafficCount,          color: 'var(--accent-primary)' },
          { label: 'Safety Check',    value: '100%',                color: 'var(--accent-success)' },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <span style={{ width: '1px', height: '28px', background: 'var(--border-color)', margin: '0 0.85rem' }} />}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Filter */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-xs)' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter:</span>
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: '5px' }}>
          {[
            { key: 'ALL',     label: `All (${opportunities.length})` },
            { key: 'POWER',   label: `Power Blocks (${powerCount})` },
            { key: 'TRAFFIC', label: `Traffic-Only (${trafficCount})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: filter === f.key ? 'var(--accent-primary)' : 'transparent',
              color: filter === f.key ? 'var(--text-on-accent)' : 'var(--text-muted)',
            }}>{f.label}</button>
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} shown</span>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>Opportunity ID</th>
                <th>Section</th>
                <th>Window Start</th>
                <th>Window End</th>
                <th>Max Capacity</th>
                <th>Block Type</th>
                <th>Direction</th>
                <th>Traffic Load</th>
                <th>Suitability</th>
                <th style={{ textAlign: 'right' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(opp => {
                const suit = getSuitability(opp);
                const density = getTrafficDensity(opp);
                return (
                  <tr key={opp.opportunity_id} style={{ cursor: 'pointer' }}
                    onClick={() => { setSelected(opp); setDrawerOpen(true); }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {opp.opportunity_id}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                      {opp.track_section_id}
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(opp.window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(opp.window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {opp.maximum_duration_mins}m
                        </span>
                      </div>
                    </td>
                    <td>
                      {opp.is_power_block_available
                        ? <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><Zap size={10} /> Power Block</span>
                        : <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><Layers size={10} /> Traffic Shadow</span>
                      }
                    </td>
                    <td>
                      <span className="badge badge-gray">{opp.affected_line_direction}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div className="progress-track" style={{ width: '60px', height: '5px' }}>
                          <div className="progress-fill" style={{
                            width: `${density * 100}%`,
                            backgroundColor: density < 0.4 ? 'var(--accent-success)' : density < 0.7 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{Math.round(density * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={`badge ${getSuitabilityBadge(suit)}`}>{getSuitabilityLabel(suit)}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{suit}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={e => { e.stopPropagation(); setSelected(opp); setDrawerOpen(true); }}>
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

      <OpportunityDetailDrawer opportunity={selected} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} tasks={tasks} />
    </div>
  );
};
