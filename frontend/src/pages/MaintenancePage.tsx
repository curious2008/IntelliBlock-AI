import React, { useState } from 'react';
import {
  Wrench, Filter, Search, ArrowRight, Sparkles, CheckCircle2,
  AlertTriangle, Clock, Layers
} from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { MaintenanceTask } from '../types';
import { TaskDetailDrawer } from '../components/drawers/TaskDetailDrawer';

export const MaintenancePage: React.FC = () => {
  const { tasks, opportunities, resources } = useScenario();

  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleOpenTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;
    const matchesSearch =
      t.task_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.task_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.location_section_id && t.location_section_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const urgentCount = tasks.filter((t) => t.priority_score >= 8.0 || t.is_emergency).length;
  const enggCount = tasks.filter((t) => t.department === 'ENGG').length;
  const trdCount = tasks.filter((t) => t.department === 'TRD').length;
  const stCount = tasks.filter((t) => t.department === 'ST').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Metric Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Work Orders
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {tasks.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            {urgentCount} High Priority / Urgent
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Civil Engineering (ENGG)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {enggCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tasks</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Track Tamping, Rail Grinding
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Traction Distribution (TRD)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
            {trdCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tasks</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            OHE Neutral Section, Catenary
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Signalling & Telecom (S&T)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            {stCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tasks</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Point Machines, Axle Counters
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
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
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: '6px' }}>
          {['ALL', 'ENGG', 'TRD', 'ST'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: selectedDept === dept ? 700 : 500,
                backgroundColor: selectedDept === dept ? 'var(--accent-primary)' : 'transparent',
                color: selectedDept === dept ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
              }}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by ID, task type, or section..."
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

      {/* Operational Task List */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Task ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Department</th>
              <th style={{ padding: '0.85rem 1rem' }}>Work Description</th>
              <th style={{ padding: '0.85rem 1rem' }}>Section</th>
              <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
              <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task.task_id}
                onClick={() => handleOpenTask(task)}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {task.task_id}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor:
                        task.department === 'ENGG'
                          ? 'rgba(2, 132, 199, 0.1)'
                          : task.department === 'ST'
                          ? 'rgba(22, 163, 74, 0.1)'
                          : 'rgba(217, 119, 6, 0.1)',
                      color:
                        task.department === 'ENGG'
                          ? 'var(--accent-primary)'
                          : task.department === 'ST'
                          ? 'var(--accent-success)'
                          : 'var(--accent-warning)',
                    }}
                  >
                    {task.department}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {task.task_type.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                  {task.location_section_id || 'SEC-DEL-GZB-01'}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {task.estimated_duration_mins}m
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: task.priority_score >= 8.0 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                      color: task.priority_score >= 8.0 ? 'var(--accent-danger)' : 'var(--accent-primary)',
                    }}
                  >
                    {task.priority_score?.toFixed(1)} / 10
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTask(task);
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        opportunities={opportunities}
        resources={resources}
      />
    </div>
  );
};
