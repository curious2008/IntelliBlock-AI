import React, { useEffect, useState } from 'react';
import { Wrench, Filter, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { MaintenanceTask, Department } from '../types';

export const MaintenancePage: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [deptData, taskData] = await Promise.all([
          apiClient.getDepartments(),
          apiClient.getMaintenanceTasks(selectedDept === 'ALL' ? undefined : selectedDept),
        ]);
        setDepartments(deptData);
        setTasks(taskData);
      } catch (err: any) {
        setError(err.message || 'Failed to load maintenance tasks');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedDept]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
            Multi-Department Maintenance Work Orders
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Uncoordinated maintenance requests from Civil (ENGG), Signal & Telecom (S&T), and Electrical (TRD)
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            All Departments
          </button>
          {departments.map((d) => (
            <button
              key={d.department_code}
              onClick={() => setSelectedDept(d.department_code)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: selectedDept === d.department_code ? 600 : 400,
                backgroundColor: selectedDept === d.department_code ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: selectedDept === d.department_code ? '#0f172a' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              {d.department_code}
            </button>
          ))}
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
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Fetching maintenance tasks from API...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No maintenance tasks found for selected department filter.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Task ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Dept</th>
                <th style={{ padding: '0.85rem 1rem' }}>Task Type & Description</th>
                <th style={{ padding: '0.85rem 1rem' }}>Target Asset</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority Score</th>
                <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
                <th style={{ padding: '0.85rem 1rem' }}>Due Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
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
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{task.task_type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.description}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {task.asset_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      fontWeight: 700,
                      color: task.priority_score >= 8.0 ? 'var(--accent-danger)' : task.priority_score >= 6.0 ? 'var(--accent-warning)' : 'var(--text-main)',
                    }}>
                      {task.priority_score.toFixed(1)} / 10
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {task.estimated_duration_mins} mins
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {task.due_date}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: 'var(--accent-primary)',
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
