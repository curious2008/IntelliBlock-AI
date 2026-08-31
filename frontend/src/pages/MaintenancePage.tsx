import React, { useState } from 'react';
import { Wrench, Filter, AlertCircle, Search } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';

export const MaintenancePage: React.FC = () => {
  const { tasks, loadingAll, error } = useScenario();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTasks = tasks.filter((t) => {
    const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;
    const matchesSearch =
      searchQuery === '' ||
      t.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.location_section_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
            Multi-Department Maintenance Work Orders ({tasks.length})
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Track, OHE Electrical, and Signalling & Telecom work orders registered in the active environment
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
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none',
                width: '150px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <button
              onClick={() => setSelectedDept('ALL')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: selectedDept === 'ALL' ? 600 : 400,
                backgroundColor: selectedDept === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: selectedDept === 'ALL' ? '#0f172a' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              All
            </button>
            {['ENGG', 'TRD', 'ST'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: selectedDept === dept ? 600 : 400,
                  backgroundColor: selectedDept === dept ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: selectedDept === dept ? '#0f172a' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          color: 'var(--accent-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks Table Card */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loadingAll ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading maintenance tasks...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Task ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Task Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Section</th>
                <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1rem' }}>Emergency</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.task_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {task.task_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: task.department === 'ENGG' ? 'rgba(56, 189, 248, 0.2)' : task.department === 'ST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: task.department === 'ENGG' ? 'var(--accent-primary)' : task.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                    }}>
                      {task.department}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#f8fafc', fontWeight: 600 }}>
                    {task.task_type}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {task.location_section_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {task.estimated_duration_mins}m
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: task.priority_score >= 8 ? 'rgba(239, 68, 68, 0.2)' : task.priority_score >= 5 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: task.priority_score >= 8 ? 'var(--accent-danger)' : task.priority_score >= 5 ? 'var(--accent-warning)' : 'var(--accent-success)',
                    }}>
                      {task.priority_score.toFixed(1)}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {task.is_emergency ? (
                      <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)' }}>
                        EMERGENCY
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Routine</span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: task.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: task.status === 'PENDING' ? 'var(--accent-warning)' : 'var(--accent-success)',
                    }}>
                      {task.status}
                    </span>
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
