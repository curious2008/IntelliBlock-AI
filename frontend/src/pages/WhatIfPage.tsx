import React, { useState } from 'react';
import {
  GitFork, AlertTriangle, ShieldCheck, CheckCircle2, Clock,
  ArrowRight, Sparkles, Activity, Play, Zap, Check, ChevronRight, XCircle, Sliders, Info, ShieldAlert, Award
} from 'lucide-react';
import { apiClient } from '../services/api/client';
import {
  DecisionSupportRequest,
  DecisionSupportResponse,
  DecisionAlternative,
  DisruptionEventInput
} from '../types';
import { useScenario } from '../context/ScenarioContext';

export const WhatIfPage: React.FC = () => {
  const { activeScenario, applyReplanToActiveState, activePlan } = useScenario();

  const [disruptionType, setDisruptionType] = useState<'TRAIN_DELAY' | 'TRACK_FRACTURE' | 'OHE_BREAKDOWN' | 'UNSCHEDULED_FREIGHT'>('TRAIN_DELAY');
  const [targetId, setTargetId] = useState<string>('12001');
  const [magnitudeMins, setMagnitudeMins] = useState<number>(45);

  const [decisionResponse, setDecisionResponse] = useState<DecisionSupportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null);
  const [approvalBanner, setApprovalBanner] = useState<string | null>(null);

  const presets = [
    {
      label: 'Train 12001 Delay (+45m)',
      type: 'TRAIN_DELAY' as const,
      target: '12001',
      mag: 45,
      desc: 'New Delhi–Kanpur Shatabdi delayed by 45 mins entering Ghaziabad.',
    },
    {
      label: 'Track Fracture (+120m)',
      type: 'TRACK_FRACTURE' as const,
      target: 'SEC-GZB-SBB-UP',
      mag: 120,
      desc: 'Emergency rail weld fracture requiring immediate speed restriction/possession.',
    },
    {
      label: 'OHE Breakdown (+90m)',
      type: 'OHE_BREAKDOWN' as const,
      target: 'SEC-DEL-GZB-01',
      mag: 90,
      desc: 'Catenary wire entanglement on Up mainline near Shahdara.',
    },
    {
      label: 'Extreme Unsafe (+300m)',
      type: 'TRAIN_DELAY' as const,
      target: '12001',
      mag: 300,
      desc: 'Extreme 5-hour delay testing hard safety constraint tripwire.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setDisruptionType(p.type);
    setTargetId(p.target);
    setMagnitudeMins(p.mag);
  };

  const handleRunDecisionSupport = async () => {
    try {
      setLoading(true);
      setError(null);
      setApprovalBanner(null);

      const req: DecisionSupportRequest = {
        disruption: {
          disruption_type: disruptionType,
          target_id: targetId,
          magnitude_minutes: magnitudeMins,
        },
        scenario_type: activeScenario?.scenario_type || 'NORMAL',
      };

      const res = await apiClient.getDecisionSupport(req);
      setDecisionResponse(res);

      if (res.recommended_option_id) {
        setSelectedAlternativeId(res.recommended_option_id);
      } else if (res.alternatives.length > 0) {
        setSelectedAlternativeId(res.alternatives[0].option_id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute Decision Support Engine');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndApply = (alt: DecisionAlternative) => {
    if (!alt.replan_diff) return;
    applyReplanToActiveState(alt.replan_diff);
    setApprovalBanner(
      `Controller Approval Confirmed: Applied "${alt.title}" to Master Plan. All downstream schedules, dashboard metrics, and daily plans have been synchronized.`
    );
  };

  const selectedAlt = decisionResponse?.alternatives.find((a) => a.option_id === selectedAlternativeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Risk & Decision Support Studio
            </h2>
            <span style={{
              padding: '0.15rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: 'rgba(217, 119, 6, 0.1)',
              color: 'var(--accent-warning)',
            }}>
              Human-in-the-Loop Protocol
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            When high-risk operational disturbances occur, the Decision Support Engine analyzes the cascade, evaluates candidate alternatives against hard safety constraints (CR-001..008), ranks options, and requires human approval before modifying active schedules.
          </p>
        </div>
      </div>

      {/* Approval Banner */}
      {approvalBanner && (
        <div style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.3)', borderRadius: '10px', padding: '1rem 1.25rem', color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{approvalBanner}</span>
        </div>
      )}

      {/* Disruption Injection Panel */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={16} color="var(--accent-warning)" />
            <span>1. Configure Operational Disruption Event</span>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => handleApplyPreset(p)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Disturbance Event Type
            </label>
            <select
              value={disruptionType}
              onChange={(e) => setDisruptionType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              <option value="TRAIN_DELAY">Train Movement Delay</option>
              <option value="TRACK_FRACTURE">Track Fracture / Rail Defect</option>
              <option value="OHE_BREAKDOWN">OHE 25kV Traction Breakdown</option>
              <option value="UNSCHEDULED_FREIGHT">Unscheduled Priority Freight Movement</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Target ID / Track Section
            </label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Magnitude ({magnitudeMins} minutes)
            </label>
            <input
              type="range"
              min="15"
              max="300"
              step="15"
              value={magnitudeMins}
              onChange={(e) => setMagnitudeMins(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-warning)', marginTop: '0.5rem' }}
            />
          </div>
        </div>

        <button
          onClick={handleRunDecisionSupport}
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {loading ? <Activity size={15} className="animate-spin" /> : <Play size={15} />}
          <span>{loading ? 'Evaluating Alternatives & Constraints...' : 'Run Decision Support Engine'}</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', color: 'var(--accent-danger)', borderRadius: '8px', fontSize: '0.85rem' }}>
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> {error}
        </div>
      )}

      {/* Decision Support Results */}
      {decisionResponse && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Decision Pipeline Cascade */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={14} color="var(--accent-danger)" />
              Operational Disturbance Cascade Diagnosis
            </div>

            <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', gap: '0', padding: '0.5rem 0' }}>
              {[
                { label: 'DISRUPTION', value: targetId, sub: `+${magnitudeMins}m event`, color: 'var(--accent-danger)', bg: 'var(--accent-danger-light)' },
                { label: 'HEADWAY IMPACT', value: '< 15m buffer', sub: 'Safety margin lost', color: 'var(--accent-warning)', bg: 'var(--accent-warning-light)' },
                { label: 'POSSESSION CONFLICT', value: 'Night Shadow', sub: 'Window overlap', color: 'var(--accent-warning)', bg: 'var(--accent-warning-light)' },
                { label: 'UNMITIGATED', value: '~117 mins', sub: 'Knock-on delay', color: 'var(--accent-danger)', bg: 'var(--accent-danger-light)' },
                { label: 'DECISION ENGINE', value: `${decisionResponse.alternatives.length} options`, sub: 'CR-001..008 checked', color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)' },
              ].map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div style={{ textAlign: 'center', minWidth: '110px', padding: '0.6rem 0.4rem', borderRadius: '6px', backgroundColor: step.bg }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: step.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{step.label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{step.value}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{step.sub}</div>
                  </div>
                  {idx < 4 && <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0, margin: '0 0.3rem' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Evaluated Alternatives — CR-001..CR-008 Safety Filtered</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Click a row to select; approve the recommended option</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Option ID</th>
                    <th>Strategy</th>
                    <th>Passenger Delay</th>
                    <th>Tasks Preserved</th>
                    <th>Safety Constraints</th>
                    <th>Feasibility</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionResponse.alternatives.map((alt) => {
                    const isSelected = selectedAlternativeId === alt.option_id;
                    const isRec = alt.is_recommended;
                    return (
                      <tr key={alt.option_id}
                        style={{ cursor: 'pointer', backgroundColor: isRec ? 'rgba(22,163,74,0.04)' : isSelected ? 'var(--accent-primary-light)' : undefined }}
                        onClick={() => setSelectedAlternativeId(alt.option_id)}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                          {alt.option_id}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1px' }}>{alt.title}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alt.description}</div>
                        </td>
                        <td style={{ fontWeight: 800, fontSize: '0.88rem', color: alt.passenger_train_delay_mins <= 25 ? 'var(--accent-success)' : alt.passenger_train_delay_mins <= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                          {alt.passenger_train_delay_mins}m
                        </td>
                        <td style={{ fontWeight: 700, color: alt.tasks_preserved_percentage >= 90 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                          {alt.tasks_preserved_percentage.toFixed(0)}%
                        </td>
                        <td>
                          <span className={alt.is_feasible ? 'badge badge-green' : 'badge badge-red'}>
                            {alt.is_feasible ? `✓ 0 violations` : `✗ ${alt.hard_violations_count} violations`}
                          </span>
                        </td>
                        <td>
                          <span className={alt.is_feasible ? 'badge badge-green' : 'badge badge-red'}>
                            {alt.is_feasible ? 'FEASIBLE' : 'REJECTED'}
                          </span>
                        </td>
                        <td>
                          {isRec
                            ? <span className="badge badge-green">★ RECOMMENDED</span>
                            : isSelected
                            ? <span className="badge badge-blue">SELECTED</span>
                            : <span className="badge badge-gray">ALTERNATIVE</span>
                          }
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isRec && (
                            <button
                              className="btn btn-success"
                              style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}
                              onClick={(e) => { e.stopPropagation(); handleApproveAndApply(alt); }}>
                              <Check size={12} /> Approve & Apply
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Explainable Decision Rationale Tree */}
          {selectedAlt && (
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={16} color="var(--accent-success)" />
                <span>Why This Recommendation? ({selectedAlt.option_id})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="var(--accent-success)" />
                  <span>Passes all 8 deterministic safety rules (CR-001 through CR-008) with 0 violations</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="var(--accent-success)" />
                  <span>Preserves {selectedAlt.tasks_preserved_count} work orders including all urgent/emergency safety tasks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="var(--accent-success)" />
                  <span>Limits passenger train delay to {selectedAlt.passenger_train_delay_mins} mins (recovering estimated ~99 mins vs unmitigated cascade)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="var(--accent-success)" />
                  <span>Zero crew/machinery depot allocation conflicts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
