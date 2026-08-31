import React, { useState } from 'react';
import { Train, Clock, MapPin, Filter, Search, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { TrainMovement } from '../types';
import { TrainDetailDrawer } from '../components/drawers/TrainDetailDrawer';

export const TrainsPage: React.FC = () => {
  const { trains } = useScenario();

  const [selectedTrain, setSelectedTrain] = useState<TrainMovement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleOpenTrain = (train: TrainMovement) => {
    setSelectedTrain(train);
    setIsDrawerOpen(true);
  };

  const filteredTrains = trains.filter((t) => {
    const matchesDir = directionFilter === 'ALL' || t.direction === directionFilter;
    const matchesSearch =
      (t.train_number && t.train_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.train_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.train_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.train_name && t.train_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDir && matchesSearch;
  });

  const highPriorityCount = trains.filter((t) => t.priority_category === 1 || t.train_type.includes('RAJDHANI')).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Scheduled Movements
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {trains.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Trains</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            {highPriorityCount} Premium Rajdhani / Express
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Corridor Headway Safety
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            ≥ 15 mins
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)' }}>
            100% Conflict-Free Separation
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            UP Direction Trains
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {trains.filter((t) => t.direction === 'UP').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Delhi → Kanpur Direction
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DOWN Direction Trains
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {trains.filter((t) => t.direction === 'DOWN').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Kanpur → Delhi Direction
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
          {['ALL', 'UP', 'DOWN'].map((dir) => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: directionFilter === dir ? 700 : 500,
                backgroundColor: directionFilter === dir ? 'var(--accent-primary)' : 'transparent',
                color: directionFilter === dir ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
              }}
            >
              {dir === 'ALL' ? 'All Directions' : `${dir} Line`}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search train by name, number, or corridor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
            }}
          />
        </div>
      </div>

      {/* Train Schedule Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Train ID / Number</th>
              <th style={{ padding: '0.85rem 1rem' }}>Type</th>
              <th style={{ padding: '0.85rem 1rem' }}>Train Name</th>
              <th style={{ padding: '0.85rem 1rem' }}>Direction</th>
              <th style={{ padding: '0.85rem 1rem' }}>Entry Window</th>
              <th style={{ padding: '0.85rem 1rem' }}>Exit Window</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrains.map((train) => {
              const isHighPriority = train.priority_category === 1 || train.train_type.includes('RAJDHANI') || train.train_type.includes('EXPRESS');
              return (
                <tr
                  key={train.train_id}
                  onClick={() => handleOpenTrain(train)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {train.train_number || train.train_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: isHighPriority ? 'rgba(220, 38, 38, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                        color: isHighPriority ? 'var(--accent-danger)' : 'var(--accent-primary)',
                      }}
                    >
                      {train.train_type}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {train.train_name || 'Northern Express'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {train.direction} Line
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {new Date(train.scheduled_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(train.scheduled_exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTrain(train);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--border-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <span>Inspect</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Train Detail Drawer */}
      <TrainDetailDrawer
        train={selectedTrain}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
