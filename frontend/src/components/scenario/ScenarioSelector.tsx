import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, AlertTriangle, Layers, Activity, Check } from 'lucide-react';
import { apiClient } from '../../services/api/client';
import { ScenarioInfo, ScenarioSummary } from '../../types';

interface ScenarioSelectorProps {
  onScenarioGenerated?: () => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onScenarioGenerated }) => {
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [activeSummary, setActiveSummary] = useState<ScenarioSummary | null>(null);
  const [selectedType, setSelectedType] = useState<string>('NORMAL');
  const [seed, setSeed] = useState<number>(42);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadScenarios() {
      try {
        setLoading(true);
        const [scList, sumData] = await Promise.all([
          apiClient.getScenarios(),
          apiClient.getScenarioSummary(),
        ]);
        setScenarios(scList);
        setActiveSummary(sumData);
        setSelectedType(sumData.scenario_type);
        setSeed(sumData.seed);
      } catch (err: any) {
        setError(err.message || 'Failed to load scenarios metadata');
      } finally {
        setLoading(false);
      }
    }
    loadScenarios();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      setSuccessMsg(null);
      const newSummary = await apiClient.generateScenario({
        scenario_type: selectedType,
        seed: Number(seed),
      });
      setActiveSummary(newSummary);
      setSuccessMsg(`Generated ${newSummary.scenario_name} (Seed: ${newSummary.seed}) successfully!`);
      if (onScenarioGenerated) onScenarioGenerated();
    } catch (err: any) {
      setError(err.message || 'Failed to generate scenario');
    } finally {
      setGenerating(false);
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
            Reproducible scenario generator for SIH26027 multi-department block planning evaluation
          </p>
        </div>

        {/* Seed Input & Generate Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
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
            {generating ? <RotateCcw size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Play size={16} />}
            <span>{generating ? 'Generating Data...' : 'Generate Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-danger)', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--accent-success)', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} /> {successMsg}
        </div>
      )}

      {/* 8 Benchmark Scenario Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {scenarios.map((sc) => {
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
      {activeSummary && (
        <div style={{
          backgroundColor: 'var(--bg-dark)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} style={{ color: 'var(--accent-success)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Active Environment: {activeSummary.scenario_name} (Seed: {activeSummary.seed})
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ID: {activeSummary.run_id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Corridors / Sections</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {activeSummary.corridor_count} / {activeSummary.track_section_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Track Assets</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {activeSummary.asset_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Work Orders (Tasks)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                {activeSummary.maintenance_task_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Monitored Trains</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                {activeSummary.train_movement_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Freight Forecasts</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>
                {activeSummary.freight_forecast_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Candidate Opportunities</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {activeSummary.block_opportunity_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Overdue / Emergency</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-danger)' }}>
                {activeSummary.overdue_task_count} / {activeSummary.emergency_task_count}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Co-location Clusters</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                {activeSummary.overlapping_request_count}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
