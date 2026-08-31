import React from 'react';
import { Activity, Radio, AlertCircle, Layers } from 'lucide-react';
import { HealthStatus } from '../../types';
import { useScenario } from '../../context/ScenarioContext';

interface HeaderProps {
  title: string;
  health: HealthStatus | null;
  healthLoading: boolean;
  healthError: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  health,
  healthLoading,
  healthError,
}) => {
  const { activeScenario, generating } = useScenario();

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Indian Railways Intelligent Block Planning Assistant
        </p>
      </div>

      {/* Connection & Active Scenario Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {activeScenario && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            color: 'var(--accent-primary)',
          }}>
            <Layers size={13} />
            <span>
              {generating ? 'Synthesizing Scenario...' : `${activeScenario.scenario_name} (Seed: ${activeScenario.seed})`}
            </span>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 500,
          backgroundColor: healthError
            ? 'rgba(239, 68, 68, 0.15)'
            : health
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(245, 158, 11, 0.15)',
          border: `1px solid ${
            healthError
              ? 'rgba(239, 68, 68, 0.3)'
              : health
              ? 'rgba(34, 197, 94, 0.3)'
              : 'rgba(245, 158, 11, 0.3)'
          }`,
          color: healthError
            ? 'var(--accent-danger)'
            : health
            ? 'var(--accent-success)'
            : 'var(--accent-warning)',
        }}>
          {healthError ? (
            <>
              <AlertCircle size={14} />
              <span>Backend Offline</span>
            </>
          ) : healthLoading ? (
            <>
              <Activity size={14} className="animate-spin" />
              <span>Checking API...</span>
            </>
          ) : (
            <>
              <Radio size={14} />
              <span>API Online v{health?.version || '0.1.0'}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
