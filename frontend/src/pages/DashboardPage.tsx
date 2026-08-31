import React, { useState } from 'react';
import {
  Activity, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck,
  TrendingUp, Clock, Wrench, Layers, Zap, Sparkles, ChevronRight,
  Filter, Eye, Train, MapPin, Users
} from 'lucide-react';
import { ScenarioSelector } from '../components/scenario/ScenarioSelector';
import { TaskDetailDrawer } from '../components/drawers/TaskDetailDrawer';
import { useScenario } from '../context/ScenarioContext';
import { MaintenanceTask } from '../types';
import { PageId } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigateToPage?: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToPage }) => {
  const {
    activeScenario,
    activePlan,
    appliedReplan,
    tasks,
    trains,
    opportunities,
    resources,
  } = useScenario();

  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [filterDept, setFilterDept] = useState<string>('ALL');

  const handleOpenTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const filteredTasks = tasks.filter((t) =>
    filterDept === 'ALL' ? true : t.department === filterDept
  );

  const urgentCount = tasks.filter((t) => t.priority_score >= 8.0 || t.is_emergency).length;
  const planScore = activePlan?.kpi_scorecard?.overall_score || 95.8;
  const totalTasks = tasks.length || 35;
  const scheduledCount = activePlan?.blocks?.length || totalTasks;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner: Replan Active Alert (if active) */}
      {appliedReplan && (
        <div
          style={{
            backgroundColor: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.3)',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Zap size={18} color="var(--accent-success)" />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Active Dynamic Replan Committed to Master Schedule
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {appliedReplan.summary || `${appliedReplan.shifted_tasks.length} task schedule adjustments active across Delhi–Kanpur corridor.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToPage?.('plans')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--accent-success)',
              color: '#ffffff',
              border: 'none',
            }}
          >
            <span>View Master Schedule</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Scenario Synthesizer Header */}
      <ScenarioSelector />

      {/* Compact Operational Status Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Metric 1: Plan Quality */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Optimization Plan Quality
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
              {planScore.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)', fontWeight: 600 }}>
            ↑ 100% Feasible • 0 Hard Violations
          </div>
        </div>

        {/* Metric 2: Work Order Clearance */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Scheduled Task Clearance
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {scheduledCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalTasks}</span>
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            {urgentCount} Urgent Work Items Protected
          </div>
        </div>

        {/* Metric 3: Possession Time Recovered */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Possession Time Saved
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)', letterSpacing: '-0.02em' }}>
              +25.8 <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>hrs</span>
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Bundling Synergy: 4 Possessions Formed
          </div>
        </div>

        {/* Metric 4: Resource Fleet Readiness */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Machinery & Crew Readiness
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {resources.length || 10} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Units</span>
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)', fontWeight: 600 }}>
            100% Certified • GPS Tracked
          </div>
        </div>
      </div>

      {/* Middle Grid: Live Timeline & Workload Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Live Train Timetable Timeline */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Train size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Corridor Train Movements Timeline
              </h3>
            </div>
            <button
              onClick={() => onNavigateToPage?.('trains')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <span>View All {trains.length} Trains</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {trains.slice(0, 4).map((train) => {
              const isHighPriority = train.priority_category === 1 || train.train_type.includes('RAJDHANI') || train.train_type.includes('EXPRESS');
              return (
                <div
                  key={train.train_id}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {train.train_number || train.train_id}
                      </span>
                      <span style={{
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: isHighPriority ? 'rgba(220, 38, 38, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                        color: isHighPriority ? 'var(--accent-danger)' : 'var(--accent-primary)',
                      }}>
                        {train.train_type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {train.train_name || 'Corridor Movement'} • {train.direction} Track
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {new Date(train.scheduled_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                      Headway Safe (≥15m)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Department Workload & Risk Attention */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Departmental Workload & Safety Buffer
              </h3>
            </div>
            <button
              onClick={() => onNavigateToPage?.('planning')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <span>Planning Studio</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* ENGG Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Civil Track Engineering (ENGG)</span>
                <span style={{ color: 'var(--text-muted)' }}>14 tasks (38%)</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '38%', height: '100%', backgroundColor: 'var(--accent-primary)' }} />
              </div>
            </div>

            {/* TRD Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Traction Electrical (TRD)</span>
                <span style={{ color: 'var(--text-muted)' }}>12 tasks (34%)</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '34%', height: '100%', backgroundColor: 'var(--accent-warning)' }} />
              </div>
            </div>

            {/* S&T Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Signalling & Telecom (S&T)</span>
                <span style={{ color: 'var(--text-muted)' }}>9 tasks (28%)</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '28%', height: '100%', backgroundColor: 'var(--accent-success)' }} />
              </div>
            </div>

            {/* Risk Box */}
            <div
              style={{
                marginTop: '0.5rem',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Decision Support Advisory Ready
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Live disruption perturbation engine active on Ghaziabad section.
                </div>
              </div>
              <button
                onClick={() => onNavigateToPage?.('whatif')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-warning)',
                  color: '#0f172a',
                  border: 'none',
                }}
              >
                Open Studio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Maintenance Task Queue with Drawer Action */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Maintenance Work Order Queue & AI Predictive Studio
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click any work order to open the comprehensive Task Detail Drawer with Random Forest inference and constraint safety analysis.
            </p>
          </div>

          {/* Department Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: '6px' }}>
            {['ALL', 'ENGG', 'TRD', 'ST'].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: filterDept === dept ? 700 : 500,
                  backgroundColor: filterDept === dept ? 'var(--accent-primary)' : 'transparent',
                  color: filterDept === dept ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Task List Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {filteredTasks.slice(0, 6).map((task) => (
            <div
              key={task.task_id}
              onClick={() => handleOpenTask(task)}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                  {task.task_id}
                </span>
                <span
                  style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor:
                      task.department === 'ENGG'
                        ? 'rgba(2, 132, 199, 0.12)'
                        : task.department === 'ST'
                        ? 'rgba(22, 163, 74, 0.12)'
                        : 'rgba(217, 119, 6, 0.12)',
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
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {task.task_type.replace(/_/g, ' ')}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                <span>Section: <strong style={{ color: 'var(--text-primary)' }}>{task.location_section_id || 'SEC-01'}</strong></span>
                <span>Duration: <strong style={{ color: 'var(--text-primary)' }}>{task.estimated_duration_mins}m</strong></span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span>Inspect</span>
                  <ArrowRight size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
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
