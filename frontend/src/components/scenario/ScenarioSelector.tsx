import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, Layers, Activity, Check, CheckCircle2, Clock, Hash } from 'lucide-react';
import { useScenario } from '../../context/ScenarioContext';

export const ScenarioSelector: React.FC = () => {
  const {
    activeScenario,
    scenariosList,
    generating,
    generationStages,
    lastGeneratedAt,
    error,
    generateScenario,
    clearError,
  } = useScenario();

  const [selectedType, setSelectedType] = useState<string>(activeScenario?.scenario_type || 'NORMAL');
  const [seed, setSeed] = useState<number>(activeScenario?.seed || 42);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      clearError();
      setSuccessBanner(null);
      const summary = await generateScenario(selectedType, seed);
      setSuccessBanner(
        `Generated scenario "${summary.scenario_name}" with Seed ${summary.seed} (Run ID: ${summary.run_id}). All downstream modules synchronized.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    }}>
      {/* Title & Controller Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Synthetic Railway Environment & Scenario Engine
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            State-driven deterministic environment generator for SIH26027 multi-department block planning
          </p>
        </div>

        {/* Seed Input & Generate Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px'
          }}>
            <Hash size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Seed:</span>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              style={{
                width: '60px',
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
              }}
              title="Change seed to generate unique deterministic scenario variants"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: 'var(--accent-primary)',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.85rem',
              opacity: generating ? 0.7 : 1,
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
            }}
          >
            {generating ? (
              <RotateCcw size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            <span>{generating ? 'Generating Scenario...' : 'Generate Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Generation Stage Progress Indicator */}
      {generating && (
        <div style={{
          backgroundColor: 'var(--bg-dark)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
            Scenario Synthesis in Progress (Deterministic Seed: {seed}):
          </div>
          {generationStages.map((stage) => (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              {stage.status === 'completed' && <CheckCircle2 size={14} style={{ color: 'var(--accent-success)' }} />}
              {stage.status === 'running' && <RotateCcw size={14} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />}
              {stage.status === 'pending' && <Clock size={14} style={{ color: 'var(--text-muted)' }} />}
              {stage.status === 'failed' && <AlertTriangle size={14} style={{ color: 'var(--accent-danger)' }} />}
              <span style={{
                color: stage.status === 'running' ? 'var(--accent-primary)' : stage.status === 'completed' ? '#f8fafc' : 'var(--text-muted)',
                fontWeight: stage.status === 'running' ? 600 : 400,
              }}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--accent-danger)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {successBanner && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: 'var(--accent-success)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Check size={16} /> {successBanner}
        </div>
      )}

      {/* 8 Benchmark Scenario Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {scenariosList.map((sc) => {
          const isSelected = selectedType === sc.scenario_type;
          return (
            <div
              key={sc.scenario_type}
              onClick={() => setSelectedType(sc.scenario_type)}
              style={{
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-dark)',
                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                padding: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {sc.scenario_type}
                </span>
                {isSelected && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.35rem' }}>
                {sc.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                {sc.description.length > 75 ? `${sc.description.substring(0, 75)}...` : sc.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Scenario Summary Card */}
      {activeScenario && (
        <div style={{
          backgroundColor: 'var(--bg-dark)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} style={{ color: 'var(--accent-success)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Active Environment: {activeScenario.scenario_name} (Deterministic Seed: {activeScenario.seed})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {lastGeneratedAt && (
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
                  Updated: {lastGeneratedAt.toLocaleTimeString()}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Run ID: {activeScenario.run_id}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Corridors / Sections</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {activeScenario.corridor_count} / {activeScenario.track_section_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Track Assets</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {activeScenario.asset_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Work Orders (Tasks)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                {activeScenario.maintenance_task_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Monitored Trains</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                {activeScenario.train_movement_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Freight Forecasts</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>
                {activeScenario.freight_forecast_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Candidate Opportunities</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {activeScenario.block_opportunity_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Overdue / Emergency</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-danger)' }}>
                {activeScenario.overdue_task_count} / {activeScenario.emergency_task_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Co-location Clusters</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                {activeScenario.overlapping_request_count}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
