import React from 'react';
import {
  LayoutDashboard, Wrench, Train, MapPin, Calendar,
  Users, Layers, GitFork, BarChart3, ShieldAlert
} from 'lucide-react';

export type PageId =
  | 'dashboard'
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
  const menuItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'maintenance', label: 'Maintenance Demands', icon: <Wrench size={18} /> },
    { id: 'trains', label: 'Train Movements', icon: <Train size={18} /> },
    { id: 'corridors', label: 'Corridors & Sections', icon: <MapPin size={18} /> },
    { id: 'opportunities', label: 'Block Opportunities', icon: <Calendar size={18} /> },
    { id: 'resources', label: 'Resource Management', icon: <Users size={18} /> },
    { id: 'plans', label: 'Block Plans', icon: <Layers size={18} /> },
    { id: 'whatif', label: 'What-If Simulation', icon: <GitFork size={18} /> },
    { id: 'analytics', label: 'Analytics & Baseline', icon: <BarChart3 size={18} /> },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
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
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
        }}>
          IB
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', letterSpacing: '0.02em' }}>
            IntelliBlock AI
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SIH26027 Decision-Support
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          padding: '0.5rem 0.75rem',
          letterSpacing: '0.08em',
        }}>
          Operational Modules
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      }}>
        <ShieldAlert size={14} style={{ color: 'var(--accent-warning)', flexShrink: 0 }} />
        <span>Simulated Indian Railways Division Network</span>
      </div>
    </aside>
  );
};
