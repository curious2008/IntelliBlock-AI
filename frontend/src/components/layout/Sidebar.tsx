import React from 'react';
import {
  LayoutDashboard, Wrench, Train, MapPin, Calendar,
  Users, Layers, GitFork, BarChart3, ShieldAlert
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'planning'
  | 'maintenance'
  | 'trains'
  | 'corridors'
  | 'opportunities'
  | 'resources'
  | 'plans'
  | 'whatif'
  | 'analytics';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
}

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { id: 'dashboard' as PageId, label: 'Command Center', icon: <LayoutDashboard size={16} /> },
      { id: 'planning' as PageId,  label: 'Adaptive Horizon', icon: <Calendar size={16} /> },
    ],
  },
  {
    label: 'Network & Schedule',
    items: [
      { id: 'plans' as PageId,         label: 'Master Block Plans', icon: <ShieldAlert size={16} /> },
      { id: 'opportunities' as PageId, label: 'Block Opportunities', icon: <Layers size={16} /> },
      { id: 'maintenance' as PageId,   label: 'Maintenance Demands', icon: <Wrench size={16} /> },
      { id: 'trains' as PageId,        label: 'Train Movements', icon: <Train size={16} /> },
      { id: 'corridors' as PageId,     label: 'Corridors & Sections', icon: <MapPin size={16} /> },
      { id: 'resources' as PageId,     label: 'Resource Fleet', icon: <Users size={16} /> },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'whatif' as PageId,    label: 'Risk & Decision Support', icon: <GitFork size={16} /> },
      { id: 'analytics' as PageId, label: 'Analytics & Baseline', icon: <BarChart3 size={16} /> },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  return (
    <aside style={{
      width: '232px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Brand */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '7px',
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', fontWeight: 800, fontSize: '0.9rem',
          flexShrink: 0,
        }}>
          IB
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            IntelliBlock AI
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Decision Support OS
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0.65rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div style={{
              fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-faint)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '0 0.65rem', marginBottom: '0.3rem',
            }}>
              {group.label}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {group.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectPage(item.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: 'none',
                        borderLeft: isActive ? '3px solid var(--sidebar-active-border)' : '3px solid transparent',
                        backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                        color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-inactive-text)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.8rem',
                        transition: 'all 0.12s ease',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--sidebar-inactive-text)';
                        }
                      }}
                    >
                      <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.68rem',
        color: 'var(--text-faint)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>SIH 2024 Finalist</span>
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>v1.0.0</span>
      </div>
    </aside>
  );
};
