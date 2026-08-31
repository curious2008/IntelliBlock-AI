import React from 'react';
import { Activity, Radio, AlertCircle, Layers, Sun, Moon, Monitor, Zap } from 'lucide-react';
import { HealthStatus } from '../../types';
import { useScenario } from '../../context/ScenarioContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { activeScenario, generating, appliedReplan } = useScenario();
  const { theme, setTheme } = useTheme();

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-header)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Indian Railways Intelligent Maintenance Decision Support Platform
        </p>
      </div>

      {/* Connection, Scenario Context & Theme Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {appliedReplan && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            color: 'var(--accent-success)',
            border: '1px solid rgba(22, 163, 74, 0.25)',
          }}>
            <Zap size={13} />
            <span>Replan Active ({appliedReplan.shifted_tasks.length} shifts)</span>
          </div>
        )}

        {activeScenario && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--accent-primary)',
          }}>
            <Layers size={13} />
            <span>
              {generating ? 'Synthesizing...' : `${activeScenario.scenario_name} (Seed: ${activeScenario.seed})`}
            </span>
          </div>
        )}

        {/* Theme Mode Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '8px',
          padding: '0.2rem',
          border: '1px solid var(--border-color)',
        }}>
          <button
            onClick={() => setTheme('light')}
            title="Light Theme"
            style={{
              padding: '0.3rem 0.45rem',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: theme === 'light' ? 'var(--bg-card)' : 'transparent',
              color: theme === 'light' ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sun size={14} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            title="Dark Theme"
            style={{
              padding: '0.3rem 0.45rem',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
              color: theme === 'dark' ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: theme === 'dark' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Moon size={14} />
          </button>
          <button
            onClick={() => setTheme('system')}
            title="System Theme"
            style={{
              padding: '0.3rem 0.45rem',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: theme === 'system' ? 'var(--bg-card)' : 'transparent',
              color: theme === 'system' ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: theme === 'system' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Monitor size={14} />
          </button>
        </div>

        {/* Backend Heartbeat */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: healthError
            ? 'rgba(220, 38, 38, 0.1)'
            : health
            ? 'rgba(22, 163, 74, 0.1)'
            : 'rgba(217, 119, 6, 0.1)',
          border: `1px solid ${
            healthError
              ? 'rgba(220, 38, 38, 0.25)'
              : health
              ? 'rgba(22, 163, 74, 0.25)'
              : 'rgba(217, 119, 6, 0.25)'
          }`,
          color: healthError
            ? 'var(--accent-danger)'
            : health
            ? 'var(--accent-success)'
            : 'var(--accent-warning)',
        }}>
          {healthError ? (
            <>
              <AlertCircle size={13} />
              <span>Offline</span>
            </>
          ) : healthLoading ? (
            <>
              <Activity size={13} className="animate-spin" />
              <span>Connecting</span>
            </>
          ) : (
            <>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-success)',
                display: 'inline-block',
              }} />
              <span>Connected</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
