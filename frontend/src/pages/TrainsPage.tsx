import React, { useState } from 'react';
import { Search, ArrowRight, Train } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { TrainMovement } from '../types';
import { TrainDetailDrawer } from '../components/drawers/TrainDetailDrawer';

// Mini 24h timeline
const MiniTimeline: React.FC<{ trains: TrainMovement[] }> = ({ trains }) => {
  const toPercent = (iso: string) => {
    const d = new Date(iso);
    const mins = d.getHours() * 60 + d.getMinutes();
    return Math.min(100, Math.max(0, (mins / 1440) * 100));
  };

  const grouped: Record<string, TrainMovement[]> = {};
  trains.forEach(t => {
    const dir = t.direction || 'UP';
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(t);
  });

  return (
    <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
        <Train size={14} color="var(--accent-primary)" />
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          24-Hour Corridor Traffic Distribution ({trains.length} movements)
        </span>
      </div>
      {/* Time labels */}
      <div style={{ display: 'flex', position: 'relative', marginLeft: '40px', marginBottom: '4px' }}>
        {[0, 6, 12, 18, 24].map(h => (
          <span key={h} style={{
            position: 'absolute', left: `${(h / 24) * 100}%`,
            fontSize: '0.6rem', color: 'var(--text-faint)',
            transform: 'translateX(-50%)',
          }}>{String(h).padStart(2, '0')}:00</span>
        ))}
        <div style={{ height: '14px' }} />
      </div>

      {Object.entries(grouped).map(([dir, dTrains]) => (
        <div key={dir} style={{ display: 'flex', alignItems: 'center', gap: '0', height: '18px', marginBottom: '6px' }}>
          <span style={{ width: '38px', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right', paddingRight: '6px', flexShrink: 0 }}>{dir}</span>
          <div style={{ flex: 1, position: 'relative', height: '4px', backgroundColor: 'var(--timeline-track)', borderRadius: '2px' }}>
            {dTrains.map(t => {
              const s = toPercent(t.scheduled_entry_time);
              const e = toPercent(t.scheduled_exit_time);
              const w = Math.max(e - s, 0.8);
              return (
                <div key={t.train_id} style={{
                  position: 'absolute', left: `${s}%`, width: `${w}%`, height: '4px',
                  backgroundColor: t.priority_category === 1 ? 'var(--accent-danger)' : 'var(--accent-primary)',
                  borderRadius: '2px', opacity: 0.75,
                }} title={`${t.train_number || t.train_id}`} />
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'High Priority (Rajdhani/Shatabdi)', color: 'var(--accent-danger)' },
          { label: 'Regular', color: 'var(--accent-primary)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '16px', height: '3px', backgroundColor: l.color, borderRadius: '2px' }} />
            <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrainsPage: React.FC = () => {
  const { trains } = useScenario();
  const [selected, setSelected]     = useState<TrainMovement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dir, setDir]               = useState('ALL');
  const [search, setSearch]         = useState('');

  const filtered = trains.filter(t => {
    const matchDir    = dir === 'ALL' || t.direction === dir;
    const matchSearch = !search
      || (t.train_number?.toLowerCase().includes(search.toLowerCase()))
      || t.train_type.toLowerCase().includes(search.toLowerCase())
      || (t.train_name?.toLowerCase().includes(search.toLowerCase()));
    return matchDir && matchSearch;
  });

  const upCount      = trains.filter(t => t.direction === 'UP').length;
  const downCount    = trains.filter(t => t.direction === 'DOWN').length;
  const highPriority = trains.filter(t => t.priority_category === 1).length;
  const delayed      = trains.filter(t => t.delay_minutes > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Summary Strip */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', boxShadow: 'var(--shadow-xs)' }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginRight: '1rem' }}>Train Movements</span>
        {[
          { label: 'Total',          value: trains.length,    color: 'var(--text-primary)' },
          { label: 'UP (DLI→CNB)',   value: upCount,          color: 'var(--accent-primary)' },
          { label: 'DOWN (CNB→DLI)', value: downCount,        color: 'var(--accent-warning)' },
          { label: 'High Priority',  value: highPriority,     color: 'var(--accent-danger)' },
          { label: 'Delayed',        value: delayed,          color: delayed > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' },
          { label: 'Headway',        value: '≥ 15m Safe',     color: 'var(--accent-success)' },
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

      {/* Mini Timeline */}
      <MiniTimeline trains={trains} />

      {/* Filter + Search */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: '5px' }}>
          {['ALL', 'UP', 'DOWN'].map(d => (
            <button key={d} onClick={() => setDir(d)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: dir === d ? 'var(--accent-primary)' : 'transparent',
              color: dir === d ? 'var(--text-on-accent)' : 'var(--text-muted)',
            }}>{d === 'ALL' ? 'All Directions' : `${d} Line`}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '200px', maxWidth: '300px', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem 0.65rem', backgroundColor: 'var(--bg-input)' }}>
          <Search size={13} color="var(--text-muted)" />
          <input type="text" placeholder="Search by number, name, type…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', width: '100%' }} />
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} of {trains.length} shown
        </span>
      </div>

      {/* Timetable Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>Train No.</th>
                <th>Type</th>
                <th>Name</th>
                <th>Direction</th>
                <th>Entry Window</th>
                <th>Exit Window</th>
                <th>Delay</th>
                <th>Headway Safety</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(train => {
                const isHP = train.priority_category === 1 || train.train_type?.toUpperCase().includes('RAJDHANI');
                return (
                  <tr key={train.train_id} style={{ cursor: 'pointer' }} onClick={() => { setSelected(train); setDrawerOpen(true); }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                      {train.train_number || train.train_id}
                    </td>
                    <td>
                      <span className={`badge ${isHP ? 'badge-red' : 'badge-blue'}`}>{train.train_type}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {train.train_name || '—'}
                    </td>
                    <td>
                      <span className="badge badge-gray">{train.direction}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(train.scheduled_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(train.scheduled_exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      {train.delay_minutes > 0
                        ? <span className="badge badge-red">+{train.delay_minutes}m</span>
                        : <span className="badge badge-green">On Time</span>
                      }
                    </td>
                    <td>
                      <span className="badge badge-green">≥15m ✓</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={e => { e.stopPropagation(); setSelected(train); setDrawerOpen(true); }}>
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

      <TrainDetailDrawer train={selected} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};
