import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, Layers, Activity, Check, CheckCircle2, Clock, Hash, ChevronDown } from 'lucide-react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedScenario = scenariosList.find(s => s.scenario_type === selectedType);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    try {
      clearError();
      setSuccessBanner(null);
      setDropdownOpen(false);
      const summary = await generateScenario(selectedType, seed);
      setSuccessBanner(`"${summary.scenario_name}" (Seed ${summary.seed}) generated — ${summary.maintenance_task_count} tasks, ${summary.train_movement_count} trains, ${summary.block_opportunity_count} block windows.`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Control Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
          <Layers size={15} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Scenario Environment
          </span>
        </div>

        {/* Scenario Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.83rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>{selectedScenario?.name || selectedType}</span>
            <ChevronDown size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </button>

          {/* Dropdown Panel */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '280px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 500,
              padding: '0.35rem',
              animation: 'fadeIn 0.1s ease-out',
            }}>
              {scenariosList.map((sc) => {
                const isSelected = selectedType === sc.scenario_type;
                return (
                  <button
                    key={sc.scenario_type}
                    onClick={() => { setSelectedType(sc.scenario_type); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '5px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--accent-primary-light)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span style={{
                      width: '16px', height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                      backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-primary)' }}>
                        {sc.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sc.description.length > 60 ? `${sc.description.slice(0, 60)}…` : sc.description}
                      </div>
                    </div>
                    {isSelected && <Check size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Seed */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.45rem 0.7rem',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-subtle)',
        }}>
          <Hash size={13} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Seed</span>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            style={{
              width: '55px',
              background: 'none', border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.83rem', fontWeight: 700,
              outline: 'none',
            }}
          />
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn btn-primary"
        >
          {generating
            ? <RotateCcw size={14} className="animate-spin" />
            : <Play size={14} />
          }
          <span>{generating ? 'Generating…' : 'Generate Scenario'}</span>
        </button>
      </div>

      {/* Generation Progress */}
      {generating && (
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.15rem' }}>
            Synthesizing scenario (Seed: {seed})…
          </div>
          {generationStages.map((stage) => (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.73rem' }}>
              {stage.status === 'completed' && <CheckCircle2 size={13} color="var(--accent-success)" />}
              {stage.status === 'running'   && <RotateCcw size={13} className="animate-spin" color="var(--accent-primary)" />}
              {stage.status === 'pending'   && <Clock size={13} color="var(--text-faint)" />}
              {stage.status === 'failed'    && <AlertTriangle size={13} color="var(--accent-danger)" />}
              <span style={{
                color: stage.status === 'completed'
                  ? 'var(--text-secondary)'
                  : stage.status === 'running'
                  ? 'var(--accent-primary)'
                  : 'var(--text-muted)',
                fontWeight: stage.status === 'running' ? 600 : 400,
              }}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '0.6rem 0.85rem',
          backgroundColor: 'var(--accent-danger-subtle)',
          border: '1px solid rgba(220,38,38,0.2)',
          color: 'var(--accent-danger-text)',
          borderRadius: '6px',
          fontSize: '0.78rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Success */}
      {successBanner && !generating && (
        <div style={{
          padding: '0.6rem 0.85rem',
          backgroundColor: 'var(--accent-success-subtle)',
          border: '1px solid rgba(22,163,74,0.2)',
          color: 'var(--accent-success-text)',
          borderRadius: '6px',
          fontSize: '0.78rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Check size={14} /> {successBanner}
        </div>
      )}

      {/* Active Scenario Metrics Strip */}
      {activeScenario && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0', flexWrap: 'wrap',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
          marginTop: '0.1rem',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Activity size={12} color="var(--accent-success)" />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Active:</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{activeScenario.scenario_name}</span>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>#{activeScenario.seed}</span>
          </span>

          {[
            { label: 'Sections', value: activeScenario.track_section_count, color: 'var(--text-primary)' },
            { label: 'Tasks', value: activeScenario.maintenance_task_count, color: 'var(--accent-warning-text)' },
            { label: 'Trains', value: activeScenario.train_movement_count, color: 'var(--accent-primary)' },
            { label: 'Opportunities', value: activeScenario.block_opportunity_count, color: 'var(--accent-success-text)' },
            { label: 'Overdue/Emergency', value: `${activeScenario.overdue_task_count}/${activeScenario.emergency_task_count}`, color: 'var(--accent-danger-text)' },
            { label: 'Co-location Clusters', value: activeScenario.overlapping_request_count, color: 'var(--accent-primary)' },
          ].map((m, i) => (
            <React.Fragment key={m.label}>
              {i > 0 && <span style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.65rem' }} />}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {m.label}:
                <span style={{ fontWeight: 700, color: m.color }}>{m.value}</span>
              </span>
            </React.Fragment>
          ))}

          {lastGeneratedAt && (
            <>
              <span style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.65rem' }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                Updated {lastGeneratedAt.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
