import React, { useState } from 'react';
import { GitFork, Play, AlertTriangle, ShieldCheck, ArrowRight, Zap, RefreshCw, Clock, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { WhatIfSimulationResultResponse, DisruptionEventInput } from '../types';
import { useScenario } from '../context/ScenarioContext';

export const WhatIfPage: React.FC = () => {
  const { activeScenario, activePlan, applyReplanToActiveState } = useScenario();

  const [disruptionType, setDisruptionType] = useState<string>('TRAIN_DELAY');
  const [targetId, setTargetId] = useState<string>('12001');
  const [magnitudeMinutes, setMagnitudeMinutes] = useState<number>(45);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<boolean>(false);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      setApplied(false);
      setAppliedMsg(null);

      const disruption: DisruptionEventInput = {
        disruption_type: disruptionType,
        target_id: targetId,
        magnitude_minutes: Number(magnitudeMinutes),
      };

      const res = await apiClient.simulateWhatIf({
        disruption,
        scenario_type: activeScenario?.scenario_type || 'NORMAL',
      });
      setSimulationResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute what-if disturbance simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReplan = () => {
    if (!simulationResult) return;
    applyReplanToActiveState(simulationResult.replan_diff);
    setApplied(true);
    setAppliedMsg(
      `Replan successfully applied to Active Master Plan! ${simulationResult.replan_diff.shifted_tasks.length} task schedule windows updated across Dashboard and Plans center.`
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
            What-If Disruption Simulator & Dynamic Replanning Studio
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
            Sandbox Simulation Mode
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Inject operational disturbances to test schedule robustness, calculate ripple cascade delays, and evaluate AI minimal-disruption schedule recovery.
        </p>
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
            <option value="TRAIN_DELAY">Train Delay (Passenger / Freight)</option>
            <option value="TASK_OVERRUN">Maintenance Task Overrun</option>
            <option value="RESOURCE_BREAKDOWN">Machine / Crew Breakdown</option>
            <option value="EMERGENCY_WORK_ORDER">Emergency Urgent Defect</option>
            <option value="TRACK_RESTRICTION">Speed / Track Restriction</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
            Target Entity ID / Number
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
          onClick={handleSimulate}
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
          <span>{loading ? 'Simulating Cascade...' : 'Simulate Disruption'}</span>
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

      {/* Simulation Side-by-Side Comparison */}
      {simulationResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Passive Unmitigated Cascade */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--accent-danger)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-danger)' }}>
                  Unmitigated Default Cascade
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Without active replanning, local delays ripple across train headways and block possessions.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cumulative Train Delay</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-danger)' }}>
                    {simulationResult.cascade_unmitigated_train_delay_mins} <span style={{ fontSize: '0.9rem' }}>mins</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conflicted Blocks</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-danger)' }}>
                    {simulationResult.conflicted_blocks_count}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Mitigated Dynamic Replan */}
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--accent-success)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                  IntelliBlock AI Dynamic Replan
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Rolling-horizon re-optimizer isolates disturbance and shifts only affected downstream windows.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mitigated Train Delay</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                    {simulationResult.replan_mitigated_train_delay_mins} <span style={{ fontSize: '0.9rem' }}>mins</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delay Saved</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    +{simulationResult.delay_saved_minutes} <span style={{ fontSize: '0.9rem' }}>mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Shifts Breakdown */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Dynamic Replan Schedule Adjustments ({simulationResult.replan_diff.shifted_tasks.length} shifts)
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {simulationResult.replan_diff.summary}
                </p>
              </div>
              <button
                onClick={handleApplyReplan}
                disabled={applied}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: applied ? 'rgba(34, 197, 94, 0.2)' : 'var(--accent-primary)',
                  color: applied ? 'var(--accent-success)' : '#0f172a',
                  border: 'none',
                  cursor: applied ? 'default' : 'pointer',
                }}
              >
                {applied ? <CheckCircle2 size={14} /> : <Zap size={14} />}
                <span>{applied ? 'Replan Applied to Live Master' : 'Apply Dynamic Replan'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {simulationResult.replan_diff.shifted_tasks.map((shift) => (
                <div
                  key={shift.task_id}
                  style={{
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>
                        {shift.task_id}
                      </span>
                      <span style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        color: 'var(--accent-warning)',
                      }}>
                        +{shift.shift_delta_minutes}m SHIFT
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {shift.reason}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <div style={{ color: '#94a3b8', textDecoration: 'line-through' }}>
                      {new Date(shift.previous_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.previous_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <ArrowRight size={14} color="var(--accent-primary)" />
                    <div style={{ color: '#f8fafc', fontWeight: 600 }}>
                      {new Date(shift.new_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.new_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
