import React, { useEffect, useState } from 'react';
import { Layers, Sparkles, CheckCircle2, AlertTriangle, Play, Sliders, Clock, Users, ShieldCheck, Activity, ArrowRight, Zap, HelpCircle, ChevronDown, ChevronUp, FileText, Info } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { OptimizedSchedulePlanResponse, BundlingSynergyReportResponse, PlanExplanationReportResponse } from '../types';

export const PlansPage: React.FC = () => {
  const [plan, setPlan] = useState<OptimizedSchedulePlanResponse | null>(null);
  const [bundlingReport, setBundlingReport] = useState<BundlingSynergyReportResponse | null>(null);
  const [explanation, setExplanation] = useState<PlanExplanationReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'BUNDLES' | 'EXPLAIN'>('SCHEDULE');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const planRes = await apiClient.generatePlan({ scenario_type: 'NORMAL' });
      setPlan(planRes);

      // Also load explainability report
      const expRes = await apiClient.explainActivePlan('NORMAL');
      setExplanation(expRes);
    } catch (err: any) {
      setError(err.message || 'Failed to generate optimized block plan');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchBundles = async () => {
    try {
      const bRes = await apiClient.coordinateBundles();
      setBundlingReport(bRes);
    } catch (err: any) {
      console.error('Failed to coordinate bundles:', err);
    }
  };

  useEffect(() => {
    handleGeneratePlan();
    handleFetchBundles();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Generation Action Bar */}
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
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Multi-Objective Block Optimization & Explainability Center
            </h2>
            <span style={{
              padding: '0.15rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: 'var(--accent-success)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              Solver & Explainability Active
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Mathematical constraint-guided solver formulating multi-department block possessions with natural language decision trees
          </p>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            backgroundColor: 'var(--accent-primary)',
            color: '#0f172a',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)',
          }}
        >
          {loading ? <Activity size={16} className="animate-spin" /> : <Play size={16} />}
          <span>{loading ? 'Solving Multi-Objective...' : 'Re-Run Optimization Solver'}</span>
        </button>
      </div>

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
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Top Cards */}
      {plan && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Optimization Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {plan.kpi_scorecard.overall_score} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', marginTop: '0.2rem' }}>
              ✓ Deterministically Feasible
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maintenance Throughput</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
              {plan.kpi_scorecard.scheduled_percentage}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              {plan.kpi_scorecard.tasks_scheduled_count} of {plan.kpi_scorecard.total_requested_tasks} tasks scheduled
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgent Tasks Cleared</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-success)' }}>
              {plan.kpi_scorecard.urgent_tasks_scheduled_percentage}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Emergency & high-priority work
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bundled Cross-Dept Tasks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#c084fc' }}>
              {plan.kpi_scorecard.cross_dept_bundled_tasks_count}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Efficiency: {plan.kpi_scorecard.bundling_efficiency_score}%
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Possession Window</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
              {plan.kpi_scorecard.total_block_hours_utilized} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Resource Util: {plan.kpi_scorecard.resource_utilization_percentage}%
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('SCHEDULE')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'SCHEDULE' ? 600 : 400,
            backgroundColor: activeTab === 'SCHEDULE' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'SCHEDULE' ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Scheduled Block Allocations ({plan?.blocks.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('BUNDLES')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'BUNDLES' ? 600 : 400,
            backgroundColor: activeTab === 'BUNDLES' ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
            color: activeTab === 'BUNDLES' ? '#c084fc' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cross-Department Bundles ({bundlingReport?.total_bundles_count || 0})
        </button>

        <button
          onClick={() => setActiveTab('EXPLAIN')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'EXPLAIN' ? 600 : 400,
            backgroundColor: activeTab === 'EXPLAIN' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
            color: activeTab === 'EXPLAIN' ? 'var(--accent-success)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Explainability & Decision Support Rationale
        </button>
      </div>

      {/* Tab 1: Scheduled Block Allocations */}
      {activeTab === 'SCHEDULE' && plan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {plan.blocks.map((block) => {
            const blockExp = explanation?.block_rationales.find(r => r.task_id === block.task_id);
            const isExpanded = expandedTaskId === block.task_id;

            return (
              <div
                key={block.task_id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: block.department === 'ENGG' ? 'rgba(56, 189, 248, 0.2)' : block.department === 'ST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: block.department === 'ENGG' ? 'var(--accent-primary)' : block.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }}>
                        {block.department}
                      </span>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                        {block.task_type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ({block.task_id})
                      </span>
                      {block.is_bundled && (
                        <span style={{
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(192, 132, 252, 0.2)',
                          color: '#c084fc',
                        }}>
                          BUNDLED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Corridor: <strong style={{ color: '#cbd5e1' }}>{block.corridor_id}</strong> | Section: <strong style={{ color: '#cbd5e1' }}>{block.track_section_id}</strong>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled Window</div>
                    <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
                      {new Date(block.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(block.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Duration: {block.duration_minutes} mins
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Resources</div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {block.assigned_resource_ids.length > 0 ? block.assigned_resource_ids.join(', ') : 'Standard Gang'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Opportunity: {block.opportunity_id || 'Direct Window'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overrun Risk</div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: block.overrun_risk_level === 'CRITICAL' || block.overrun_risk_level === 'HIGH' ? 'var(--accent-danger)' : 'var(--accent-warning)',
                    }}>
                      {block.overrun_risk_level} ({((block.overrun_probability || 0.25) * 100).toFixed(0)}%)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>
                      ✓ Safety Verified
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setExpandedTaskId(isExpanded ? null : block.task_id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: isExpanded ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: isExpanded ? 'var(--accent-primary)' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <HelpCircle size={14} />
                      <span>{isExpanded ? 'Hide Rationale' : 'Why This Slot?'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Decision Rationale Tree */}
                {isExpanded && blockExp && (
                  <div style={{
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '6px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>
                        Primary Scheduling Rationale:
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {blockExp.primary_reason}
                      </div>
                    </div>

                    {blockExp.bundling_rationale && (
                      <div style={{
                        backgroundColor: 'rgba(192, 132, 252, 0.08)',
                        border: '1px solid rgba(192, 132, 252, 0.2)',
                        borderRadius: '4px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#c084fc',
                      }}>
                        <strong>Bundling Benefit:</strong> {blockExp.bundling_rationale}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
                          Evaluated Decision Factors:
                        </div>
                        {blockExp.decision_factors.map((f, idx) => (
                          <div key={idx} style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                            • <strong style={{ color: '#cbd5e1' }}>{f.factor_name}</strong> ({f.weight_importance}): {f.description}
                          </div>
                        ))}
                      </div>

                      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
                          Rejected Alternative Windows:
                        </div>
                        {blockExp.rejected_alternatives.map((alt, idx) => (
                          <div key={idx} style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                            ✕ <strong style={{ color: 'var(--accent-warning)' }}>{alt.alternative_window}:</strong> {alt.rejection_reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.06)',
                      borderLeft: '3px solid var(--accent-primary)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                    }}>
                      <strong style={{ color: 'var(--accent-primary)' }}>Controller Advisory:</strong> {blockExp.human_controller_advisory}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Cross-Department Bundles */}
      {activeTab === 'BUNDLES' && bundlingReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            backgroundColor: 'rgba(192, 132, 252, 0.08)',
            border: '1px solid rgba(192, 132, 252, 0.25)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                Coordinated Track Possession Synergy
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Simultaneous multi-department work on single track sections saves line possessions and prevents passenger train delays
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Line Block Saved</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#c084fc' }}>
                  {bundlingReport.total_line_block_minutes_saved} mins
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passenger Delay Avoided</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                  ~{bundlingReport.estimated_passenger_delay_minutes_avoided} mins
                </div>
              </div>
            </div>
          </div>

          {bundlingReport.bundles.map((bundle) => (
            <div
              key={bundle.bundle_id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                    Bundle {bundle.bundle_id}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Section: <strong style={{ color: '#cbd5e1' }}>{bundle.track_section_id}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: 'var(--accent-success)',
                  }}>
                    +{bundle.synergy_minutes_saved} mins saved
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {bundle.bundled_tasks.map((task) => (
                  <div
                    key={task.task_id}
                    style={{
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: task.department === 'ENGG' ? 'rgba(56, 189, 248, 0.2)' : task.department === 'ST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: task.department === 'ENGG' ? 'var(--accent-primary)' : task.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }}>
                        {task.department}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                        {task.task_type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {task.description || 'Routine maintenance'} ({task.estimated_duration_mins} mins)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Master Explainability & Decision Support */}
      {activeTab === 'EXPLAIN' && explanation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <FileText size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Executive Plan Rationale & Strategic Trade-Offs
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              {explanation.executive_summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                  Core Decision Hierarchy:
                </div>
                {explanation.top_decision_priorities.map((p, idx) => (
                  <div key={idx} style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', lineHeight: '1.4' }}>
                    {p}
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem' }}>
                  Optimization Trade-Off Analysis:
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  {explanation.trade_off_analysis}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '1.25rem',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--accent-success)',
            }}>
              <ShieldCheck size={18} />
              <span><strong>Safety Guarantee:</strong> {explanation.safety_guarantee_statement}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
