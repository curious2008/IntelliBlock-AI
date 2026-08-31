import React, { useState } from 'react';
import {
  GitFork, Play, AlertTriangle, ShieldCheck, ArrowRight, Zap, RefreshCw,
  Clock, CheckCircle2, ChevronRight, Check, ShieldAlert, Award, FileText, Lock
} from 'lucide-react';
import { apiClient } from '../services/api/client';
import {
  WhatIfSimulationResultResponse,
  DisruptionEventInput,
  DecisionSupportResponse,
  DecisionAlternative
} from '../types';
import { useScenario } from '../context/ScenarioContext';

export const WhatIfPage: React.FC = () => {
  const { activeScenario, activePlan, applyReplanToActiveState } = useScenario();

  const [disruptionType, setDisruptionType] = useState<string>('TRAIN_DELAY');
  const [targetId, setTargetId] = useState<string>('12001');
  const [magnitudeMinutes, setMagnitudeMinutes] = useState<number>(45);
  const [loading, setLoading] = useState<boolean>(false);
  const [decisionSupport, setDecisionSupport] = useState<DecisionSupportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvedOptionId, setApprovedOptionId] = useState<string | null>(null);
  const [applied, setApplied] = useState<boolean>(false);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  // Quick Preset Scenarios
  const handleApplyPreset = (type: string, id: string, mins: number) => {
    setDisruptionType(type);
    setTargetId(id);
    setMagnitudeMinutes(mins);
  };

  const handleRunDecisionSupport = async () => {
    try {
      setLoading(true);
      setError(null);
      setApplied(false);
      setAppliedMsg(null);
      setApprovedOptionId(null);

      const disruption: DisruptionEventInput = {
        disruption_type: disruptionType,
        target_id: targetId,
        magnitude_minutes: Number(magnitudeMinutes),
      };

      const res = await apiClient.getDecisionSupport({
        disruption,
        scenario_type: activeScenario?.scenario_type || 'NORMAL',
      });
      setDecisionSupport(res);
      if (res.recommended_option_id) {
        setApprovedOptionId(res.recommended_option_id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute decision support analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndApply = (option: DecisionAlternative) => {
    if (!option.replan_diff) return;
    applyReplanToActiveState(option.replan_diff);
    setApplied(true);
    setAppliedMsg(
      `Controller Approval Confirmed: Applied ${option.title} to Master Plan. All downstream schedules, dashboard metrics, and daily plans have been synchronized.`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Live Emergency & Risk $\to$ Decision Support Studio
          </h2>
          <span style={{
            padding: '0.15rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--accent-warning)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}>
            Human-in-the-Loop Protocol
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Inject live operational disturbances, diagnose risk drivers, evaluate candidate recovery options against deterministic safety constraints (CR-001..008), and apply controller-approved replans.
        </p>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Presets:</span>
        <button
          onClick={() => handleApplyPreset('TRAIN_DELAY', '12001', 45)}
          style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--bg-card)', color: '#f8fafc', border: '1px solid var(--border-color)' }}
        >
          Train 12001 Delay (+45m)
        </button>
        <button
          onClick={() => handleApplyPreset('TASK_OVERRUN', 'TSK-2026-0001', 60)}
          style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--bg-card)', color: '#f8fafc', border: '1px solid var(--border-color)' }}
        >
          Task Overrun (+60m)
        </button>
        <button
          onClick={() => handleApplyPreset('EMERGENCY_WORK_ORDER', 'TSK-EM-01', 90)}
          style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--bg-card)', color: '#f8fafc', border: '1px solid var(--border-color)' }}
        >
          Emergency Rail Fracture (+90m)
        </button>
        <button
          onClick={() => handleApplyPreset('RESOURCE_BREAKDOWN', 'RES-ENGG-01', 120)}
          style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--bg-card)', color: '#f8fafc', border: '1px solid var(--border-color)' }}
        >
          Tamping Machine Breakdown (+120m)
        </button>
        <button
          onClick={() => handleApplyPreset('TRAIN_DELAY', '12001', 300)}
          style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          Extreme Unsafe Disturbance (+300m)
        </button>
      </div>

      {/* Disruption Parameter Injector */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
        alignItems: 'end',
        gap: '1rem',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
            Disruption Type
          </label>
          <select
            value={disruptionType}
            onChange={(e) => setDisruptionType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          >
            <option value="TRAIN_DELAY">Train Delay (Passenger / Express)</option>
            <option value="TASK_OVERRUN">Maintenance Task Overrun</option>
            <option value="RESOURCE_BREAKDOWN">Machinery / Crew Breakdown</option>
            <option value="EMERGENCY_WORK_ORDER">Emergency Track / OHE Defect</option>
            <option value="TRACK_RESTRICTION">Speed / Track Restriction</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
            Target Entity ID
          </label>
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="e.g. 12001, TSK-2026-0001, RES-01"
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
            Magnitude (Minutes)
          </label>
          <input
            type="number"
            min="5"
            max="360"
            value={magnitudeMinutes}
            onChange={(e) => setMagnitudeMinutes(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <button
          onClick={handleRunDecisionSupport}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            backgroundColor: 'var(--accent-warning)',
            color: '#0f172a',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
          }}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
          <span>{loading ? 'Evaluating Safety Rules...' : 'Run Decision Support'}</span>
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

      {appliedMsg && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          color: 'var(--accent-success)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
        }}>
          <Check size={18} />
          <span>{appliedMsg}</span>
        </div>
      )}

      {/* Decision Support Analysis Output */}
      {decisionSupport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Risk Diagnostic Panel */}
          <div style={{
            backgroundColor: decisionSupport.is_safe_option_available ? 'var(--bg-card)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${decisionSupport.is_safe_option_available ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {decisionSupport.is_safe_option_available ? (
                  <ShieldCheck size={22} color="var(--accent-primary)" />
                ) : (
                  <Lock size={22} color="var(--accent-danger)" />
                )}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {decisionSupport.recommended_action_title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Analysis ID: {decisionSupport.analysis_id} • Generated at {new Date(decisionSupport.generated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: decisionSupport.risk_level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : decisionSupport.risk_level === 'HIGH' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 189, 248, 0.25)',
                  color: decisionSupport.risk_level === 'CRITICAL' ? 'var(--accent-danger)' : decisionSupport.risk_level === 'HIGH' ? 'var(--accent-warning)' : 'var(--accent-primary)',
                  border: '1px solid currentColor',
                }}>
                  {decisionSupport.risk_level} RISK
                </span>

                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: decisionSupport.is_safe_option_available ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: decisionSupport.is_safe_option_available ? 'var(--accent-success)' : 'var(--accent-danger)',
                }}>
                  {decisionSupport.is_safe_option_available ? 'FEASIBLE SAFE OPTION FOUND' : 'NO SAFE AUTOMATIC ACTION'}
                </span>
              </div>
            </div>

            {/* Risk Drivers */}
            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: '0.35rem' }}>
                Operational Risk Diagnosis:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {decisionSupport.risk_drivers.map((driver, idx) => (
                  <li key={idx} style={{ color: '#cbd5e1' }}>{driver}</li>
                ))}
                <li>Unmitigated default delay cascade would propagate to ~<strong>{decisionSupport.cascade_unmitigated_delay_mins} mins</strong> cumulative train delays across {decisionSupport.conflicted_blocks_count} block windows.</li>
              </ul>
            </div>
          </div>

          {/* Feasible Alternatives Comparative Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Evaluated Recovery Alternatives ({decisionSupport.alternatives.length} Options Generated)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evaluated against CR-001 through CR-008 hard safety rules
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {decisionSupport.alternatives.map((opt) => (
                <div
                  key={opt.option_id}
                  style={{
                    backgroundColor: opt.is_recommended ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-card)',
                    border: `2px solid ${opt.is_recommended ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '10px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                      {opt.option_id}: {opt.title}
                    </span>
                    {opt.is_recommended && (
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--accent-primary)',
                        color: '#0f172a',
                      }}>
                        RECOMMENDED
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {opt.description}
                  </p>

                  {/* Impact Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: 'var(--bg-dark)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Passenger Delay: </span>
                      <strong style={{ color: opt.passenger_train_delay_mins <= 45 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                        {opt.passenger_train_delay_mins}m
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Tasks Preserved: </span>
                      <strong style={{ color: 'var(--accent-primary)' }}>
                        {opt.tasks_preserved_percentage.toFixed(0)}%
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Hard Violations: </span>
                      <strong style={{ color: opt.hard_violations_count === 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {opt.hard_violations_count}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Safety: </span>
                      <strong style={{ color: opt.is_feasible ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {opt.is_feasible ? 'CR-001..008 PASS' : 'INFEASIBLE'}
                      </strong>
                    </div>
                  </div>

                  {opt.rejection_reason && (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Rejection factor: {opt.rejection_reason}
                    </div>
                  )}

                  {/* Action Button */}
                  {opt.is_feasible ? (
                    <button
                      onClick={() => handleApproveAndApply(opt)}
                      disabled={applied}
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: opt.is_recommended ? 'var(--accent-primary)' : 'var(--bg-dark)',
                        color: opt.is_recommended ? '#0f172a' : 'var(--text-muted)',
                        border: opt.is_recommended ? 'none' : '1px solid var(--border-color)',
                      }}
                    >
                      {opt.is_recommended ? <Zap size={14} /> : <FileText size={14} />}
                      <span>{opt.is_recommended ? 'Approve & Apply Replan' : 'Simulate Alternative'}</span>
                    </button>
                  ) : (
                    <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-danger)', padding: '0.4rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                      BLOCKED BY HARD SAFETY CONSTRAINT
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explainability Tree Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Why This Recommendation? (Explainable Decision Rationale)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {decisionSupport.why_recommended_rationale.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color="var(--accent-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
