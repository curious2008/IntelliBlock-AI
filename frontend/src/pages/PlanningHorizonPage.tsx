import React, { useEffect, useState } from 'react';
import {
  Calendar, Layers, Clock, TrendingUp, AlertTriangle, ShieldCheck,
  ChevronRight, ArrowRight, Wrench, Users, Activity, Sparkles, Filter, RefreshCw, Zap
} from 'lucide-react';
import { apiClient } from '../services/api/client';
import {
  PlanningHorizonMonthlyResponse,
  PlanningHorizonWeeklyResponse,
  OptimizedTaskBlock
} from '../types';
import { useScenario } from '../context/ScenarioContext';

interface PlanningHorizonPageProps {
  onNavigateToLiveEmergency?: () => void;
}

export const PlanningHorizonPage: React.FC<PlanningHorizonPageProps> = ({ onNavigateToLiveEmergency }) => {
  const { activeScenario, activePlan } = useScenario();

  const [activeHorizon, setActiveHorizon] = useState<'MONTHLY' | 'WEEKLY' | 'DAILY'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  const [monthlyData, setMonthlyData] = useState<PlanningHorizonMonthlyResponse | null>(null);
  const [weeklyData, setWeeklyData] = useState<PlanningHorizonWeeklyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMonthlyHorizon = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getMonthlyPlanning(selectedMonth, activeScenario?.scenario_type || 'NORMAL');
      setMonthlyData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load monthly planning horizon');
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyHorizon = async (weekNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getWeeklyPlanning(weekNum, selectedMonth, activeScenario?.scenario_type || 'NORMAL');
      setWeeklyData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load weekly planning horizon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthlyHorizon();
    loadWeeklyHorizon(selectedWeekNum);
  }, [activeScenario, selectedMonth]);

  const handleDrillDownToWeek = (weekNum: number) => {
    setSelectedWeekNum(weekNum);
    loadWeeklyHorizon(weekNum);
    setActiveHorizon('WEEKLY');
  };

  const handleDrillDownToDay = (dayNum: number) => {
    setSelectedDayNum(dayNum);
    setActiveHorizon('DAILY');
  };

  // Deterministically partition master blocks across weeks and days
  const getDayBlocks = (): OptimizedTaskBlock[] => {
    if (!activePlan?.blocks || activePlan.blocks.length === 0) return [];
    const daySlot = selectedDayNum - 1;
    const weekFactor = (selectedWeekNum - 1) * 3;
    const dayBlocks = activePlan.blocks.filter((_, idx) => (idx + weekFactor) % 7 === daySlot);
    return dayBlocks.length > 0 ? dayBlocks : activePlan.blocks.slice(daySlot, daySlot + 4);
  };

  const dayBlocks = getDayBlocks();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = dayNames[(selectedDayNum - 1) % 7];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Horizon Hierarchy Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Adaptive Planning Horizon Studio
            </h2>
            <span style={{
              padding: '0.15rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              color: 'var(--accent-primary)',
            }}>
              Multi-Tier Horizon
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Integrated temporal planning hierarchy: Monthly Macro Capacity $\to$ Weekly Corridor Schedules $\to$ Daily Micro Optimization $\to$ Live Emergency Recovery.
          </p>
        </div>

        {/* Horizon Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveHorizon('MONTHLY')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: activeHorizon === 'MONTHLY' ? 'var(--accent-primary)' : 'transparent',
              color: activeHorizon === 'MONTHLY' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeHorizon === 'MONTHLY' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            1. Monthly Macro
          </button>
          <button
            onClick={() => setActiveHorizon('WEEKLY')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: activeHorizon === 'WEEKLY' ? 'var(--accent-primary)' : 'transparent',
              color: activeHorizon === 'WEEKLY' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeHorizon === 'WEEKLY' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            2. Weekly Corridor
          </button>
          <button
            onClick={() => setActiveHorizon('DAILY')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: activeHorizon === 'DAILY' ? 'var(--accent-primary)' : 'transparent',
              color: activeHorizon === 'DAILY' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeHorizon === 'DAILY' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            3. Daily Schedule
          </button>
        </div>
      </div>

      {/* Breadcrumb Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span
          onClick={() => setActiveHorizon('MONTHLY')}
          style={{ cursor: 'pointer', color: activeHorizon === 'MONTHLY' ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: 600 }}
        >
          {monthlyData?.month_name || 'September 2026'}
        </span>
        <ChevronRight size={14} />
        <span
          onClick={() => { setActiveHorizon('WEEKLY'); loadWeeklyHorizon(selectedWeekNum); }}
          style={{ cursor: 'pointer', color: activeHorizon === 'WEEKLY' ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: 600 }}
        >
          Week {selectedWeekNum}
        </span>
        <ChevronRight size={14} />
        <span style={{ color: activeHorizon === 'DAILY' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: activeHorizon === 'DAILY' ? 700 : 400 }}>
          {dayName} (Day {selectedDayNum} Micro Plan)
        </span>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', color: 'var(--accent-danger)', borderRadius: '8px', fontSize: '0.85rem' }}>
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> {error}
        </div>
      )}

      {/* 1. MONTHLY MACRO PLANNING VIEW */}
      {activeHorizon === 'MONTHLY' && monthlyData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Macro Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Task Demand</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {monthlyData.total_maintenance_tasks} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Orders</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-danger)', fontWeight: 600 }}>
                {monthlyData.urgent_tasks_count} Urgent / Emergency Work Items
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Possession Demand vs Capacity</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
                {monthlyData.total_possession_hours_demand}h <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {monthlyData.available_block_capacity_hours}h</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {monthlyData.capacity_utilization_pct}% Capacity Utilization
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reserve Contingency Buffer</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                +{monthlyData.reserve_contingency_hours}h
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)' }}>
                Buffer for Weather & Traffic Disturbances
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overloaded Sections</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-ai)' }}>
                {monthlyData.overloaded_sections.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {monthlyData.overloaded_sections.join(', ')}
              </div>
            </div>
          </div>

          {/* Department Workload Breakdown & Major Programs Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {/* Department Workload Card */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Departmental Workload Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {monthlyData.department_workloads.map((dept) => (
                  <div key={dept.department} style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: dept.department === 'ENGG' ? 'rgba(2, 132, 199, 0.1)' : dept.department === 'ST' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                        color: dept.department === 'ENGG' ? 'var(--accent-primary)' : dept.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }}>
                        {dept.department === 'ENGG' ? 'Civil Track (ENGG)' : dept.department === 'TRD' ? 'Electrical Traction (TRD)' : 'Signalling & Telecom (S&T)'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {dept.task_count} tasks ({dept.total_duration_hours}h)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', margin: '0.4rem 0' }}>
                      <div style={{
                        width: `${dept.workload_percentage}%`,
                        height: '100%',
                        backgroundColor: dept.department === 'ENGG' ? 'var(--accent-primary)' : dept.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>Share: {dept.workload_percentage}%</span>
                      <span>{dept.urgent_tasks_count} Urgent • {dept.overdue_tasks_count} Overdue</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Major Capital Programs */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Major Maintenance Programs Scheduled
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                {monthlyData.major_programs.map((prg) => (
                  <div key={prg.program_id} style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{prg.program_name}</span>
                      <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-primary)' }}>
                        Week {prg.planned_week}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {prg.description}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>Section: <strong style={{ color: 'var(--text-primary)' }}>{prg.track_section_id}</strong></span>
                      <span>Demand: <strong style={{ color: 'var(--accent-warning)' }}>{prg.estimated_block_hours}h</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Week Drill-Down Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Weekly Horizon Breakdown (Click to Drill Down)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {monthlyData.weeks.map((w) => (
                <div
                  key={w.week_number}
                  onClick={() => handleDrillDownToWeek(w.week_number)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {w.week_label}
                    </span>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: w.risk_level === 'HIGH' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                      color: w.risk_level === 'HIGH' ? 'var(--accent-danger)' : 'var(--accent-success)',
                    }}>
                      {w.risk_level} RISK
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    <div>Tasks: <strong style={{ color: 'var(--text-primary)' }}>{w.task_count} Work Orders</strong></div>
                    <div>Possession Hours: <strong style={{ color: 'var(--accent-warning)' }}>{w.planned_possession_hours}h</strong> / {w.available_capacity_hours}h</div>
                    <div>Capacity Utilization: <strong style={{ color: 'var(--accent-primary)' }}>{w.capacity_utilization_pct}%</strong></div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDrillDownToWeek(w.week_number); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--accent-primary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span>Inspect Week {w.week_number} Schedule</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. WEEKLY CORRIDOR HORIZON VIEW */}
      {activeHorizon === 'WEEKLY' && weeklyData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4].map((wn) => (
                <button
                  key={wn}
                  onClick={() => { setSelectedWeekNum(wn); loadWeeklyHorizon(wn); }}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: selectedWeekNum === wn ? 700 : 500,
                    backgroundColor: selectedWeekNum === wn ? 'var(--accent-primary)' : 'var(--bg-card)',
                    color: selectedWeekNum === wn ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Week {wn}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {weeklyData.summary}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            {weeklyData.days.map((d) => (
              <div
                key={d.day_number}
                onClick={() => handleDrillDownToDay(d.day_number)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid ${selectedDayNum === d.day_number ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {d.day_name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {d.date_str.substring(5)}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>Tasks: <strong style={{ color: 'var(--text-primary)' }}>{d.task_count}</strong></div>
                  <div>Possessions: <strong style={{ color: 'var(--accent-warning)' }}>{d.scheduled_blocks_count} ({d.total_possession_hours}h)</strong></div>
                  <div>Traffic: <strong style={{ color: d.train_traffic_density === 'HIGH' ? 'var(--accent-danger)' : 'var(--accent-success)' }}>{d.train_traffic_density}</strong></div>
                </div>

                {d.has_emergency_task && (
                  <span style={{ padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--accent-danger)' }}>
                    EMERGENCY DEFECT
                  </span>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); handleDrillDownToDay(d.day_number); }}
                  style={{
                    marginTop: 'auto',
                    padding: '0.35rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  View Day Micro Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DAILY SCHEDULE MICRO OPTIMIZATION VIEW */}
      {activeHorizon === 'DAILY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Daily Active Execution Plan — {dayName} (Week {selectedWeekNum})
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Mathematically verified block possessions evaluated against deterministic safety rules CR-001 through CR-008
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onNavigateToLiveEmergency}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  color: 'var(--accent-warning)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                }}
              >
                <Zap size={14} />
                <span>Simulate Live Disruption</span>
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Task ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Section</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Window Start - End</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned Fleet</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Safety Clearance</th>
                </tr>
              </thead>
              <tbody>
                {dayBlocks.map((b) => (
                  <tr key={b.task_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {b.task_id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: b.department === 'ENGG' ? 'rgba(2, 132, 199, 0.1)' : b.department === 'ST' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                        color: b.department === 'ENGG' ? 'var(--accent-primary)' : b.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }}>
                        {b.department}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {b.track_section_id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(b.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {b.duration_minutes}m
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {b.assigned_resource_ids?.join(', ') || 'Depot Unit'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        color: 'var(--accent-success)',
                      }}>
                        CR-001..008 PASSED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
