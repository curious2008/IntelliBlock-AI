import React, { useState } from 'react';
import { Train, AlertCircle, Search, Filter } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';

export const TrainsPage: React.FC = () => {
  const { trains, loadingAll, error } = useScenario();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');

  const filteredTrains = trains.filter((trn) => {
    const matchesDir = directionFilter === 'ALL' || trn.direction === directionFilter;
    const matchesSearch =
      searchQuery === '' ||
      trn.train_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trn.train_number.includes(searchQuery) ||
      trn.train_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDir && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
            Train Movement Timetables & Freight Forecasts ({trains.length})
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Passenger train timetables and forecasted goods train movements along monitored corridors
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search train name / no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none',
                width: '180px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <button
              onClick={() => setDirectionFilter('ALL')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: directionFilter === 'ALL' ? 600 : 400,
                backgroundColor: directionFilter === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: directionFilter === 'ALL' ? '#0f172a' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              All Lines
            </button>
            <button
              onClick={() => setDirectionFilter('UP')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: directionFilter === 'UP' ? 600 : 400,
                backgroundColor: directionFilter === 'UP' ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: directionFilter === 'UP' ? '#0f172a' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              UP Line
            </button>
            <button
              onClick={() => setDirectionFilter('DOWN')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: directionFilter === 'DOWN' ? 600 : 400,
                backgroundColor: directionFilter === 'DOWN' ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: directionFilter === 'DOWN' ? '#0f172a' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              DOWN Line
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', borderRadius: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loadingAll ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading trains...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Train ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Train Name / Number</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Direction</th>
                <th style={{ padding: '0.85rem 1rem' }}>Entry Time</th>
                <th style={{ padding: '0.85rem 1rem' }}>Exit Time</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority Rank</th>
                <th style={{ padding: '0.85rem 1rem' }}>Live Delay</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrains.map((trn) => (
                <tr key={trn.train_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {trn.train_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {trn.train_name} ({trn.train_number})
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {trn.train_type}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: trn.direction === 'UP' ? 'var(--accent-primary)' : 'var(--accent-warning)' }}>
                    {trn.direction} Line
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(trn.scheduled_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(trn.scheduled_exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                    Cat {trn.priority_category}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: trn.delay_minutes > 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                    {trn.delay_minutes > 0 ? `+${trn.delay_minutes} mins` : 'On Time'}
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
