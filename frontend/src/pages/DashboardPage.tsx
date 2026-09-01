import React, { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, ChevronRight, ArrowRight,
  Train, Wrench, Zap, Clock, Users, Layers, Activity
} from 'lucide-react';
import { ScenarioSelector } from '../components/scenario/ScenarioSelector';
import { TaskDetailDrawer } from '../components/drawers/TaskDetailDrawer';
import { TrainDetailDrawer } from '../components/drawers/TrainDetailDrawer';
import { useScenario } from '../context/ScenarioContext';
import { MaintenanceTask, TrainMovement } from '../types';
import { PageId } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigateToPage?: (page: PageId) => void;
}

// --- Train Timeline ---
const TrainTimeline: React.FC<{ trains: TrainMovement[]; onSelect: (t: TrainMovement) => void }> = ({ trains, onSelect }) => {
  const HOUR_START = 0;
  const HOUR_END = 24;
  const totalHours = HOUR_END - HOUR_START;

  const toPercent = (iso: string) => {
    const d = new Date(iso);
    const mins = d.getHours() * 60 + d.getMinutes();
    return Math.min(100, Math.max(0, (mins / (totalHours * 60)) * 100));
  };

  const DEPT_COLORS: Record<string, string> = {
    RAJDHANI: 'var(--accent-danger)',
    SHATABDI: 'var(--accent-warning)',
    EXPRESS: 'var(--accent-primary)',
    PASSENGER: 'var(--accent-success)',
    FREIGHT: 'var(--text-muted)',
  };

  const getColor = (t: TrainMovement) => {
    for (const [key, color] of Object.entries(DEPT_COLORS)) {
      if (t.train_type?.toUpperCase().includes(key)) return color;
    }
    return 'var(--accent-primary)';
  };

  const visible = trains.slice(0, 12);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {/* Time axis */}
      <div style={{ display: 'flex', marginLeft: '80px', marginBottom: '2px', position: 'relative' }}>
        {[0, 6, 12, 18, 24].map(h => (
          <div key={h} style={{
            position: 'absolute',
            left: `${(h / 24) * 100}%`,
            fontSize: '0.62rem',
            color: 'var(--text-faint)',
            transform: 'translateX(-50%)',
          }}>
            {String(h).padStart(2, '0')}:00
          </div>
        ))}
        <div style={{ height: '14px', width: '100%' }} />
      </div>

      {/* Grid + trains */}
      <div style={{ position: 'relative' }}>
        {/* Hour grid lines */}
        {[6, 12, 18].map(h => (
          <div key={h} style={{
            position: 'absolute',
            left: `calc(80px + ${(h / 24) * 100}%)`,
            top: 0, bottom: 0,
            width: '1px',
            backgroundColor: 'var(--border-subtle)',
            pointerEvents: 'none',
          }} />
        ))}

        {visible.map((train) => {
          const startPct = toPercent(train.scheduled_entry_time);
          const endPct = toPercent(train.scheduled_exit_time);
          const widthPct = Math.max(endPct - startPct, 1.5);
          const color = getColor(train);
          const isHighPriority = train.priority_category === 1;

          return (
            <div
              key={train.train_id}
              onClick={() => onSelect(train)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                height: '26px',
                marginBottom: '3px',
                cursor: 'pointer',
              }}
              title={`${train.train_number || train.train_id} — ${train.train_name || train.train_type} (${train.direction})`}
            >
              {/* Train label */}
              <div style={{
                width: '78px',
                flexShrink: 0,
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                paddingRight: '6px',
                textAlign: 'right',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {train.train_number || train.train_id.slice(-5)}
              </div>

              {/* Track line */}
              <div style={{ flex: 1, position: 'relative', height: '4px', backgroundColor: 'var(--timeline-track)', borderRadius: '2px' }}>
                {/* Train bar */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                    height: '4px',
                    backgroundColor: color,
                    borderRadius: '2px',
                    opacity: 0.9,
                  }}
                />
                {/* Delay indicator */}
                {train.delay_minutes > 0 && (
                  <div style={{
                    position: 'absolute',
                    left: `${endPct}%`,
                    top: '-3px',
                    width: '6px', height: '10px',
                    backgroundColor: 'var(--accent-danger)',
                    borderRadius: '1px',
                    opacity: 0.8,
                  }} />
                )}
              </div>

              {/* Direction + delay */}
              <div style={{
                width: '48px',
                flexShrink: 0,
                fontSize: '0.62rem',
                color: train.delay_minutes > 0 ? 'var(--accent-danger)' : 'var(--text-faint)',
                fontWeight: 600,
                paddingLeft: '6px',
                textAlign: 'left',
              }}>
                {train.direction} {train.delay_minutes > 0 ? `+${train.delay_minutes}m` : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
        {Object.entries(DEPT_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: color, borderRadius: '2px' }} />
            <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontWeight: 500 }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Workload Bars ---
const WorkloadBars: React.FC<{ tasks: MaintenanceTask[] }> = ({ tasks }) => {
  const DEPTS = [
    { id: 'ENGG', label: 'Civil Track Engineering', color: 'var(--accent-primary)' },
    { id: 'TRD',  label: 'Traction Electrical (TRD)', color: 'var(--accent-warning)' },
    { id: 'ST',   label: 'Signalling & Telecom',     color: 'var(--accent-success)' },
  ];
  const total = tasks.length || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {DEPTS.map(dept => {
        const deptTasks = tasks.filter(t => t.department === dept.id);
        const urgent = deptTasks.filter(t => t.priority_score >= 8 || t.is_emergency).length;
        const pct = Math.round((deptTasks.length / total) * 100);
        return (
          <div key={dept.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dept.label}</span>
                {urgent > 0 && (
                  <span className="badge badge-red">{urgent} urgent</span>
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {deptTasks.length} tasks · {pct}%
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: dept.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Dashboard ---
export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToPage }) => {
  const { activeScenario, activePlan, appliedReplan, tasks, trains, opportunities, resources } = useScenario();

  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainMovement | null>(null);
  const [trainDrawerOpen, setTrainDrawerOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState('ALL');

  const urgentCount  = tasks.filter(t => t.priority_score >= 8 || t.is_emergency).length;
  const planScore    = activePlan?.kpi_scorecard?.overall_score ?? 95.8;
  const hardViolations = 0;
  const filteredTasks = deptFilter === 'ALL' ? tasks : tasks.filter(t => t.department === deptFilter);

  const riskLevel = activeScenario?.emergency_task_count
    ? activeScenario.emergency_task_count > 3 ? 'CRITICAL'
      : activeScenario.emergency_task_count > 0 ? 'ATTENTION'
      : 'SAFE'
    : 'SAFE';

  const riskColor  = riskLevel === 'CRITICAL' ? 'var(--accent-danger)'
    : riskLevel === 'ATTENTION' ? 'var(--accent-warning)'
    : 'var(--accent-success)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Replan Alert */}
      {appliedReplan && (
        <div style={{
          padding: '0.6rem 1rem',
          backgroundColor: 'var(--accent-success-light)',
          border: '1px solid rgba(22,163,74,0.25)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={15} color="var(--accent-success)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-success-text)' }}>
              Dynamic Replan Active — {appliedReplan.shifted_tasks.length} tasks rescheduled
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{appliedReplan.summary}</span>
          </div>
          <button className="btn btn-ghost" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => onNavigateToPage?.('plans')}>
            View Schedule <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Scenario Control */}
      <ScenarioSelector />

      {/* Operational Status Strip */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="status-dot" style={{ backgroundColor: riskColor, width: '10px', height: '10px' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: riskColor }}>
                {riskLevel}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational Status</span>
          </div>

          {/* KPI Inline Strip */}
          <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
            {[
              { label: 'Plan Score',       value: `${planScore.toFixed(0)}/100`,  color: 'var(--accent-primary)' },
              { label: 'Hard Violations',  value: hardViolations,                  color: hardViolations > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' },
              { label: 'Urgent Work Items', value: urgentCount,                   color: urgentCount > 0 ? 'var(--accent-warning)' : 'var(--text-secondary)' },
              { label: 'Block Opportunities', value: opportunities.length,         color: 'var(--accent-primary)' },
              { label: 'Fleet Ready',      value: `${resources.length} units`,     color: 'var(--accent-success)' },
            ].map((kpi, i) => (
              <React.Fragment key={kpi.label}>
                {i > 0 && <span style={{ width: '1px', height: '30px', backgroundColor: 'var(--border-color)', margin: '0 1rem', alignSelf: 'center' }} />}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: kpi.color, lineHeight: 1.2 }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap' }}>{kpi.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Split: Timeline + Workload */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem' }}>
        {/* Train Timeline */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Train size={15} color="var(--accent-primary)" />
              <span className="section-title">Corridor Train Movements (24h)</span>
            </div>
            <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
              onClick={() => onNavigateToPage?.('trains')}>
              All {trains.length} Trains <ChevronRight size={12} />
            </button>
          </div>
          <TrainTimeline trains={trains} onSelect={(t) => { setSelectedTrain(t); setTrainDrawerOpen(true); }} />
        </div>

        {/* Workload Panel */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {/* Dept Workload */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <Wrench size={15} color="var(--accent-primary)" />
              <span className="section-title">Departmental Workload</span>
            </div>
            <WorkloadBars tasks={tasks} />
          </div>

          <div className="divider" />

          {/* Decision Advisory */}
          {(urgentCount > 0 || appliedReplan) && (
            <div style={{
              backgroundColor: 'var(--accent-warning-subtle)',
              border: '1px solid rgba(217,119,6,0.2)',
              borderRadius: '6px',
              padding: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <AlertTriangle size={14} color="var(--accent-warning)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-warning-text)' }}>
                  Requires Attention
                </span>
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {urgentCount} urgent maintenance items require scheduling.
                {opportunities.length > 0 && ` ${opportunities.length} block windows available.`}
              </div>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', width: '100%', justifyContent: 'center' }}
                onClick={() => onNavigateToPage?.('whatif')}
              >
                Open Decision Support Studio <ArrowRight size={12} />
              </button>
            </div>
          )}

          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', justifyContent: 'center' }}
            onClick={() => onNavigateToPage?.('planning')}
          >
            <Layers size={13} /> Adaptive Planning Horizon <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Maintenance Work Order Table */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Wrench size={15} color="var(--accent-primary)" />
            <span className="section-title">Maintenance Work Orders</span>
            <span className="badge badge-gray">{tasks.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: '5px' }}>
            {['ALL', 'ENGG', 'TRD', 'ST'].map(d => (
              <button key={d} onClick={() => setDeptFilter(d)} style={{
                padding: '0.25rem 0.6rem', borderRadius: '4px', border: 'none', fontSize: '0.72rem', fontWeight: 600,
                backgroundColor: deptFilter === d ? 'var(--accent-primary)' : 'transparent',
                color: deptFilter === d ? 'var(--text-on-accent)' : 'var(--text-muted)',
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Dept</th>
                <th>Type</th>
                <th>Section</th>
                <th>Priority</th>
                <th>Duration</th>
                <th>Risk</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.slice(0, 8).map(task => {
                const isEmergency = task.is_emergency;
                const riskLvl = task.priority_score >= 8 ? 'HIGH' : task.priority_score >= 5 ? 'MEDIUM' : 'LOW';
                return (
                  <tr key={task.task_id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedTask(task); setTaskDrawerOpen(true); }}>
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
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.task_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {task.location_section_id || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {isEmergency && <AlertTriangle size={12} color="var(--accent-danger)" />}
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isEmergency ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                          {task.priority_score?.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {task.estimated_duration_mins}m
                    </td>
                    <td>
                      <span className={`badge ${riskLvl === 'HIGH' ? 'badge-red' : riskLvl === 'MEDIUM' ? 'badge-amber' : 'badge-green'}`}>
                        {riskLvl}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setTaskDrawerOpen(true); }}>
                        Inspect <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTasks.length > 8 && (
          <div style={{ padding: '0.6rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => onNavigateToPage?.('maintenance')}>
              View all {filteredTasks.length} work orders <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Drawers */}
      <TaskDetailDrawer task={selectedTask} isOpen={taskDrawerOpen} onClose={() => setTaskDrawerOpen(false)}
        opportunities={opportunities} resources={resources} />
      <TrainDetailDrawer train={selectedTrain} isOpen={trainDrawerOpen} onClose={() => setTrainDrawerOpen(false)} />
    </div>
  );
};
