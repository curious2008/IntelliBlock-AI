import React from 'react';
import { Sidebar, PageId } from './Sidebar';
import { Header } from './Header';
import { HealthStatus } from '../../types';

interface MainLayoutProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  pageTitle: string;
  health: HealthStatus | null;
  healthLoading: boolean;
  healthError: string | null;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  onSelectPage,
  pageTitle,
  health,
  healthLoading,
  healthError,
  children,
}) => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar currentPage={currentPage} onSelectPage={onSelectPage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header
          title={pageTitle}
          health={health}
          healthLoading={healthLoading}
          healthError={healthError}
        />
        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', backgroundColor: 'var(--bg-dark)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
