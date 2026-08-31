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

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const menuItems: { id: PageId; label: string; icon: React.ReactNode; category: 'core' | 'schedule' | 'intel' }[] = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={17} />, category: 'core' },
    { id: 'planning', label: 'Adaptive Horizon', icon: <Calendar size={17} />, category: 'core' },
    { id: 'plans', label: 'Master Block Plans', icon: <ShieldAlert size={17} />, category: 'schedule' },
    { id: 'opportunities', label: 'Block Opportunities', icon: <Layers size={17} />, category: 'schedule' },
    { id: 'maintenance', label: 'Maintenance Demands', icon: <Wrench size={17} />, category: 'schedule' },
    { id: 'trains', label: 'Train Movements', icon: <Train size={17} />, category: 'schedule' },
    { id: 'corridors', label: 'Corridors & Sections', icon: <MapPin size={17} />, category: 'schedule' },
    { id: 'resources', label: 'Resource Fleet', icon: <Users size={17} />, category: 'schedule' },
    { id: 'whatif', label: 'Risk & Decision Support', icon: <GitFork size={17} />, category: 'intel' },
    { id: 'analytics', label: 'Analytics & Baseline', icon: <BarChart3 size={17} />, category: 'intel' },
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Brand Logo */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1rem',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
        }}>
          IB
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            IntelliBlock AI
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Decision Support OS
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.65rem', overflowY: 'auto' }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          padding: '0.35rem 0.75rem',
          letterSpacing: '0.08em',
        }}>
          Operations Menu
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem' }}>
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectPage(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.83rem',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
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
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span style={{ color: isActive ? '#ffffff' : 'var(--accent-primary)' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Status Footer */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>SIH 2024 Finalist</span>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>v1.0.0</span>
      </div>
    </aside>
  );
};
