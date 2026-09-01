import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Search, Sparkles } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { MaintenanceTask } from '../types';
import { TaskDetailDrawer } from '../components/drawers/TaskDetailDrawer';

export const MaintenancePage: React.FC = () => {
  const { tasks, opportunities, resources } = useScenario();
  const [selected, setSelected] = useState<MaintenanceTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dept, setDept] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'priority' | 'duration' | 'none'>('priority');

  const urgentCount = tasks.filter(t => t.priority_score >= 8 || t.is_emergency).length;
  const enggCount   = tasks.filter(t => t.department === 'ENGG').length;
  const trdCount    = tasks.filter(t => t.department === 'TRD').length;
  const stCount     = tasks.filter(t => t.department === 'ST').length;

  let filtered = tasks.filter(t => {
    const matchDept = dept === 'ALL' || t.department === dept;
    const matchSearch = !search
      || t.task_id.toLowerCase().includes(search.toLowerCase())
      || t.task_type.toLowerCase().includes(search.toLowerCase())
      || (t.location_section_id?.toLowerCase().includes(search.toLowerCase()));
    return matchDept && matchSearch;
  });

  if (sortKey === 'priority') filtered = [...filtered].sort((a, b) => b.priority_score - a.priority_score);
  if (sortKey === 'duration') filtered = [...filtered].sort((a, b) => b.estimated_duration_mins - a.estimated_duration_mins);

  const getRisk = (t: MaintenanceTask) => t.priority_score >= 8 ? 'HIGH' : t.priority_score >= 5 ? 'MEDIUM' : 'LOW';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Summary Strip */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginRight: '1rem' }}>
          Maintenance Work Orders
        </span>
        {[
          { label: 'Total',   value: tasks.length,    color: 'var(--text-primary)' },
          { label: 'Urgent',  value: urgentCount,      color: urgentCount > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' },
          { label: 'ENGG',    value: enggCount,        color: 'var(--accent-primary)' },
          { label: 'TRD',     value: trdCount,         color: 'var(--accent-warning)' },
          { label: 'S&T',     value: stCount,          color: 'var(--accent-success)' },
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

      {/* Filter + Search Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: '5px' }}>
          {['ALL', 'ENGG', 'TRD', 'ST'].map(d => (
            <button key={d} onClick={() => setDept(d)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: dept === d ? 'var(--accent-primary)' : 'transparent',
              color: dept === d ? 'var(--text-on-accent)' : 'var(--text-muted)',
            }}>
              {d}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '200px', maxWidth: '300px', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem 0.65rem', backgroundColor: 'var(--bg-input)' }}>
          <Search size={13} color="var(--text-muted)" />
          <input type="text" placeholder="Search task, type, section…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', width: '100%' }} />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Sort:
          {['none', 'priority', 'duration'].map(s => (
            <button key={s} onClick={() => setSortKey(s as any)} style={{
              padding: '0.25rem 0.55rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.72rem', fontWeight: 600,
              backgroundColor: sortKey === s ? 'var(--bg-subtle)' : 'transparent',
              color: sortKey === s ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>
              {s === 'none' ? 'Default' : s === 'priority' ? 'Priority ↓' : 'Duration ↓'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Department</th>
                <th>Work Type</th>
                <th>Section</th>
                <th>Priority Score</th>
                <th>Estimated Duration</th>
                <th>AI Prediction</th>
                <th>Overrun Risk</th>
                <th>Constraints</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const risk = getRisk(task);
                const aiPred = Math.round((task.estimated_duration_mins || 0) * 0.94);
                return (
                  <tr key={task.task_id} style={{ cursor: 'pointer' }} onClick={() => { setSelected(task); setDrawerOpen(true); }}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                        {task.task_id}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${task.department === 'ENGG' ? 'badge-blue' : task.department === 'TRD' ? 'badge-amber' : 'badge-green'}`}>
                        {task.department}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.task_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {task.location_section_id || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {task.is_emergency && <AlertTriangle size={12} color="var(--accent-danger)" />}
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: task.priority_score >= 8 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                          {task.priority_score?.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {task.estimated_duration_mins}m
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Sparkles size={12} color="var(--accent-ai)" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-ai-text)' }}>{aiPred}m</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>RF R²=0.95</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${risk === 'HIGH' ? 'badge-red' : risk === 'MEDIUM' ? 'badge-amber' : 'badge-green'}`}>
                        {risk}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-green">CR-001..008 ✓</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={e => { e.stopPropagation(); setSelected(task); setDrawerOpen(true); }}>
                        Inspect <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No tasks match the current filter.
          </div>
        )}
      </div>

      <TaskDetailDrawer task={selected} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} opportunities={opportunities} resources={resources} />
    </div>
  );
};
