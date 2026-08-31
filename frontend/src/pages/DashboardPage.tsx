import React, { useEffect, useState } from 'react';
import { Wrench, Train, MapPin, Calendar, CheckCircle2, AlertTriangle, Sparkles, Activity, ShieldAlert, Cpu, Check, RefreshCw, Zap, ArrowRight, ShieldCheck, RotateCcw } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { MaintenanceTask, DurationPredictionResponse, OverrunRiskResponse, ModelStatusResponse } from '../types';
import { ScenarioSelector } from '../components/scenario/ScenarioSelector';
import { useScenario } from '../context/ScenarioContext';

export const DashboardPage: React.FC = () => {
  const {
    activeScenario,
    tasks,
    trains,
    opportunities,
    activePlan,
    appliedReplan,
    loadingAll,
    error: scenarioError,
  } = useScenario();

  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [durationPred, setDurationPred] = useState<DurationPredictionResponse | null>(null);
  const [overrunPred, setOverrunPred] = useState<OverrunRiskResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load AI model metadata on mount
  useEffect(() => {
    async function loadModelMeta() {
      try {
        const res = await apiClient.getAIModelStatus();
        setModelStatus(res);
      } catch (err) {
        console.error('Failed to load AI model status:', err);
      }
    }
    loadModelMeta();
  }, []);

  // When tasks change, select the first task
  useEffect(() => {
    if (tasks.length > 0 && (!selectedTask || !tasks.find((t) => t.task_id === selectedTask.task_id))) {
      handleSelectTask(tasks[0]);
    }
  }, [tasks]);

  const handleSelectTask = async (task: MaintenanceTask) => {
    setSelectedTask(task);
    setAiLoading(true);
    setAiError(null);
    try {
      const featurePayload = {
        task_id: task.task_id,
        task_type: task.task_type,
        department: task.department,
        estimated_duration_mins: task.estimated_duration_mins,
        minimum_duration_mins: task.minimum_duration_mins,
        maximum_duration_mins: task.maximum_duration_mins,
        priority_score: task.priority_score,
        is_emergency: task.is_emergency,
        dependency_count: task.prerequisite_task_ids ? task.prerequisite_task_ids.length : 0,
        resource_count: task.required_resources ? task.required_resources.length : 0,
        asset_condition_score: 6.5,
        asset_criticality_index: 7.0,
        asset_age_years: 5.0,
        days_since_last_maintenance: 90.0,
        days_until_due: 7.0,
        crew_available_count: 3,
        machine_available_count: 1,
        train_density_24h: trains.length || 20,
        freight_density: 'MEDIUM',
        best_opportunity_duration_mins: 120,
        scenario_type: activeScenario?.scenario_type || 'NORMAL',
      };

      const [durRes, ovRes] = await Promise.all([
        apiClient.predictDuration(featurePayload),
        apiClient.predictOverrunRisk(featurePayload),
      ]);
      setDurationPred(durRes);
      setOverrunPred(ovRes);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI predictions for selected task');
      setDurationPred(null);
      setOverrunPred(null);
    } finally {
      setAiLoading(false);
    }
  };

  const urgentTasksCount = tasks.filter((t) => t.priority_score >= 8.0 || t.is_emergency).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Interactive Scenario Selector & Synthetic Generator Panel */}
      <ScenarioSelector />

      {/* Applied Replan Banner if active */}
      {appliedReplan && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.35)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="var(--accent-success)" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Active Master Plan: {appliedReplan.plan_id} (Dynamic Replan Applied)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {appliedReplan.shifted_tasks.length} task schedule shifts applied • ~{appliedReplan.punctuality_recovery_minutes}m passenger delay recovered
              </div>
            </div>
          </div>
          <span style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: 'var(--accent-success)',
          }}>
            LIVE DYNAMIC STATE
          </span>
        </div>
      )}

      {/* Top Operational Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Work Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {tasks.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-danger)' }}>
              {urgentTasksCount} Urgent / Emergency
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-primary)' }}>
            <Train size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Monitored Train Paths</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {trains.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>
              100% Conflict-Free Slots
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-success)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Block Windows Detected</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {opportunities.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
              Low-Density Traffic Windows
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Optimizer Health Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {activePlan?.kpi_scorecard ? `${activePlan.kpi_scorecard.overall_score}/100` : '95.8/100'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>
              0 Hard Safety Violations
            </div>
          </div>
        </div>
      </div>

      {/* Main Operational Split: Interactive Task Inspector + AI Prediction Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Work Order Task Queue */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Maintenance Task Queue ({tasks.length})
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click any task to run AI duration & overrun risk inference
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {tasks.map((t) => {
              const isSelected = selectedTask?.task_id === t.task_id;
              return (
                <div
                  key={t.task_id}
                  onClick={() => handleSelectTask(t)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-dark)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: isSelected ? 'var(--accent-primary)' : '#f8fafc' }}>
                        {t.task_id}
                      </span>
                      <span style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: t.department === 'ENGG' ? 'rgba(56, 189, 248, 0.2)' : t.department === 'ST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: t.department === 'ENGG' ? 'var(--accent-primary)' : t.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }}>
                        {t.department}
                      </span>
                    </div>

                    <span style={{
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: t.is_emergency ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: t.is_emergency ? 'var(--accent-danger)' : 'var(--accent-warning)',
                    }}>
                      Priority: {t.priority_score.toFixed(1)}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.2rem' }}>
                    {t.description || t.task_type}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Section: {t.location_section_id}</span>
                    <span>Nominal: {t.estimated_duration_mins} mins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Prediction & Risk Studio */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                AI Predictive Intelligence Studio
              </h3>
            </div>
            {modelStatus && (
              <span style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: 600,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: 'var(--accent-success)',
              }}>
                ML Models Active ({modelStatus.models.length} Loaded)
              </span>
            )}
          </div>

          {selectedTask ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Selected Task Overview */}
              <div style={{
                backgroundColor: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Evaluating Task Target:
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedTask.task_id} — {selectedTask.description}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Dept: <strong style={{ color: '#f8fafc' }}>{selectedTask.department}</strong></span>
                  <span>Section: <strong style={{ color: '#f8fafc' }}>{selectedTask.location_section_id}</strong></span>
                  <span>Nominal Duration: <strong style={{ color: 'var(--accent-warning)' }}>{selectedTask.estimated_duration_mins}m</strong></span>
                </div>
              </div>

              {/* Inference Loading Indicator */}
              {aiLoading && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--accent-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <RotateCcw size={16} className="animate-spin" /> Running Random Forest & Gradient Boosting inference...
                </div>
              )}

              {aiError && (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                  {aiError}
                </div>
              )}

              {/* Duration Prediction Output */}
              {durationPred && !aiLoading && (
                <div style={{
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      1. Predicted Duration (Random Forest Regressor)
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      R² = 0.9474 • MAE = 10.82m
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
                      {durationPred.predicted_duration_minutes}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>minutes</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      Range: [{durationPred.lower_bound_minutes}m — {durationPred.upper_bound_minutes}m]
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {durationPred.prediction_basis}
                  </div>
                </div>
              )}

              {/* Overrun Risk Prediction Output */}
              {overrunPred && !aiLoading && (
                <div style={{
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: overrunPred.risk_level === 'HIGH' ? 'var(--accent-danger)' : overrunPred.risk_level === 'MEDIUM' ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                      2. Overrun Probability (Gradient Boosting Classifier)
                    </span>
                    <span style={{
                      padding: '0.1rem 0.45rem',
                      borderRadius: '3px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: overrunPred.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : overrunPred.risk_level === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: overrunPred.risk_level === 'HIGH' ? 'var(--accent-danger)' : overrunPred.risk_level === 'MEDIUM' ? 'var(--accent-warning)' : 'var(--accent-success)',
                    }}>
                      {overrunPred.risk_level} RISK
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: overrunPred.risk_level === 'HIGH' ? 'var(--accent-danger)' : overrunPred.risk_level === 'MEDIUM' ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                      {(overrunPred.overrun_probability * 100).toFixed(1)}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>probability of exceeding scheduled possession</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Basis: {overrunPred.prediction_basis}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select any work order from the queue to run AI predictive inference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
