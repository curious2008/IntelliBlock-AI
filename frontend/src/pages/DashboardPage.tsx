import React, { useEffect, useState } from 'react';
import { Wrench, Train, MapPin, Calendar, CheckCircle2, AlertTriangle, Sparkles, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { Department, MaintenanceTask, TrainMovement, BlockOpportunity, DurationPredictionResponse, OverrunRiskResponse, ModelStatusResponse } from '../types';
import { ScenarioSelector } from '../components/scenario/ScenarioSelector';

export const DashboardPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [trains, setTrains] = useState<TrainMovement[]>([]);
  const [opportunities, setOpportunities] = useState<BlockOpportunity[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [durationPred, setDurationPred] = useState<DurationPredictionResponse | null>(null);
  const [overrunPred, setOverrunPred] = useState<OverrunRiskResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptData, taskData, trainData, oppData, aiStatus] = await Promise.all([
        apiClient.getDepartments(),
        apiClient.getMaintenanceTasks(),
        apiClient.getTrains(),
        apiClient.getBlockOpportunities(),
        apiClient.getAIModelStatus().catch(() => null),
      ]);
      setDepartments(deptData);
      setTasks(taskData);
      setTrains(trainData);
      setOpportunities(oppData);
      if (aiStatus) setModelStatus(aiStatus);
      if (taskData.length > 0) {
        handleSelectTask(taskData[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
        scenario_type: 'NORMAL',
      };

      const [durRes, ovRes] = await Promise.all([
        apiClient.predictDuration(featurePayload),
        apiClient.predictOverrunRisk(featurePayload),
      ]);
      setDurationPred(durRes);
      setOverrunPred(ovRes);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI predictions');
      setDurationPred(null);
      setOverrunPred(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Interactive Scenario Selector & Synthetic Generator Panel */}
      <ScenarioSelector onScenarioGenerated={loadData} />

      {/* Top Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Wrench size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Work Orders (Tasks)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {loading ? '...' : tasks.length}
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
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: 'var(--accent-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Train size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monitored Trains</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {loading ? '...' : trains.length}
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
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--accent-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Candidate Opportunities</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {loading ? '...' : opportunities.length}
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
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Engineering Depts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              {loading ? '...' : departments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          color: 'var(--accent-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* AI Intelligence & Decision-Support Panel */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '10px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
                AI Prototype Planning Insights
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Predictive estimation assisting human block planners (Synthetic Model Registry v1.0)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {modelStatus?.models.map((m) => (
              <span key={m.model_name} style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}>
                <Cpu size={12} style={{ color: 'var(--accent-primary)' }} />
                <span>{m.model_name} (v{m.model_version})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Selected Task AI Analysis Card */}
        {selectedTask ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1.25rem',
          }}>
            {/* Task Scope Column */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Focus Task</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: selectedTask.department === 'ENGG' ? 'rgba(56, 189, 248, 0.2)' : selectedTask.department === 'ST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: selectedTask.department === 'ENGG' ? 'var(--accent-primary)' : selectedTask.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                }}>
                  {selectedTask.department}
                </span>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{selectedTask.task_type}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>({selectedTask.task_id})</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                {selectedTask.description || 'No description provided'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Nominal planned duration: <strong style={{ color: '#f8fafc' }}>{selectedTask.estimated_duration_mins} mins</strong> (range {selectedTask.minimum_duration_mins}–{selectedTask.maximum_duration_mins} mins)
              </div>
            </div>

            {/* AI Duration Prediction Card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Activity size={14} style={{ color: 'var(--accent-primary)' }} />
                  Predicted Duration
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Random Forest v1.0</span>
              </div>

              {aiLoading ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inferring duration...</div>
              ) : durationPred ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                      {durationPred.predicted_duration_minutes}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>mins</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Indicative range: <strong style={{ color: '#cbd5e1' }}>{durationPred.lower_bound_minutes}–{durationPred.upper_bound_minutes} mins</strong> (confidence {(durationPred.confidence * 100).toFixed(0)}%)
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-danger)' }}>{aiError || 'Unavailable'}</div>
              )}
            </div>

            {/* AI Overrun Risk Prediction Card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldAlert size={14} style={{ color: 'var(--accent-warning)' }} />
                  Overrun Risk Probability
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Gradient Boosting v1.0</span>
              </div>

              {aiLoading ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assessing overrun risk...</div>
              ) : overrunPred ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: overrunPred.risk_level === 'CRITICAL' || overrunPred.risk_level === 'HIGH' ? 'var(--accent-danger)' : overrunPred.risk_level === 'MEDIUM' ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                      {(overrunPred.overrun_probability * 100).toFixed(1)}%
                    </span>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: overrunPred.risk_level === 'CRITICAL' || overrunPred.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : overrunPred.risk_level === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: overrunPred.risk_level === 'CRITICAL' || overrunPred.risk_level === 'HIGH' ? 'var(--accent-danger)' : overrunPred.risk_level === 'MEDIUM' ? 'var(--accent-warning)' : 'var(--accent-success)',
                    }}>
                      {overrunPred.risk_level}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Confidence: <strong style={{ color: '#cbd5e1' }}>{(overrunPred.confidence * 100).toFixed(0)}%</strong>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-danger)' }}>{aiError || 'Unavailable'}</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a work order below to evaluate AI duration and overrun risk.</div>
        )}

        <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.5rem' }}>
          * Notice: AI insights are prototype decision-support estimations derived from synthetic multi-factor simulations. Final block schedules are validated by hard deterministic constraints and approved by human planners.
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Department Tasks Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
              Active Environment Work Orders
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click task to evaluate AI insights</span>
          </div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading work orders...</p>
          ) : tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No maintenance tasks found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.slice(0, 8).map((task) => (
                <div
                  key={task.task_id}
                  onClick={() => handleSelectTask(task)}
                  style={{
                    backgroundColor: selectedTask?.task_id === task.task_id ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-dark)',
                    border: `1px solid ${selectedTask?.task_id === task.task_id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: task.department === 'ENGG' ? 'rgba(56, 189, 248, 0.2)' : task.department === 'ST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: task.department === 'ENGG' ? 'var(--accent-primary)' : task.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      }}>
                        {task.department}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                        {task.task_type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ({task.task_id})
                      </span>
                      {task.is_emergency && (
                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)' }}>
                          EMERGENCY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {task.description}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: task.priority_score >= 8.0 ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                      Priority {task.priority_score.toFixed(1)}/10
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {task.estimated_duration_mins} mins
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Railway System Integration Readiness Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            System Integration Contracts
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Adapter interfaces prepared for Indian Railways domain models:
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {['TMS (Train Management System)', 'SMMS (Signal Maintenance)', 'TDMS (Traction Distribution)', 'COA (Control Office Automation)', 'BDMS (Block Decision Management)'].map((sys) => (
              <li key={sys} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#cbd5e1',
              }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-success)' }} />
                <span>{sys} Mock Adapter</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
