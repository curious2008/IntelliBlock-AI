import React, { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { PageId } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PlanningHorizonPage } from './pages/PlanningHorizonPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { TrainsPage } from './pages/TrainsPage';
import { CorridorsPage } from './pages/CorridorsPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PlansPage } from './pages/PlansPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { apiClient } from './services/api/client';
import { HealthStatus } from './types';
import { ScenarioProvider } from './context/ScenarioContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        setHealthLoading(true);
        const res = await apiClient.getHealth();
        setHealth(res);
        setHealthError(null);
      } catch (err: any) {
        setHealthError(err.message || 'API Offline');
        setHealth(null);
      } finally {
        setHealthLoading(false);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (page: PageId): string => {
    switch (page) {
      case 'dashboard': return 'Operations Command Center';
      case 'planning': return 'Adaptive Planning Horizon';
      case 'maintenance': return 'Multi-Department Maintenance Demands';
      case 'trains': return 'Train Movement Timetables & Headways';
      case 'corridors': return 'Railway Corridors & Track Sections';
      case 'opportunities': return 'Discovered Block Opportunities';
      case 'resources': return 'Resource & Heavy Machinery Fleet';
      case 'plans': return 'Master Block Optimization Plans';
      case 'whatif': return 'Live Emergency & Decision Support Studio';
      case 'analytics': return 'Analytics & Baseline Evaluation';
      default: return 'IntelliBlock AI';
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onNavigateToPage={setCurrentPage} />;
      case 'planning': return <PlanningHorizonPage onNavigateToLiveEmergency={() => setCurrentPage('whatif')} />;
      case 'maintenance': return <MaintenancePage />;
      case 'trains': return <TrainsPage />;
      case 'corridors': return <CorridorsPage />;
      case 'opportunities': return <OpportunitiesPage />;
      case 'resources': return <ResourcesPage />;
      case 'plans': return <PlansPage />;
      case 'whatif': return <WhatIfPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <DashboardPage onNavigateToPage={setCurrentPage} />;
    }
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onSelectPage={setCurrentPage}
      pageTitle={getPageTitle(currentPage)}
      health={health}
      healthLoading={healthLoading}
      healthError={healthError}
    >
      {renderPageContent()}
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ScenarioProvider>
        <AppContent />
      </ScenarioProvider>
    </ThemeProvider>
  );
};

export default App;
