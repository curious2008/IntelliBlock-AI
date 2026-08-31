import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../services/api/client';
import {
  ScenarioInfo,
  ScenarioSummary,
  OptimizedSchedulePlanResponse,
  ReplanDiffResponse,
  MaintenanceTask,
  TrainMovement,
  BlockOpportunity,
  Resource,
} from '../types';

export interface GenerationStage {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ScenarioContextType {
  activeScenario: ScenarioSummary | null;
  scenariosList: ScenarioInfo[];
  activePlan: OptimizedSchedulePlanResponse | null;
  appliedReplan: ReplanDiffResponse | null;
  tasks: MaintenanceTask[];
  trains: TrainMovement[];
  opportunities: BlockOpportunity[];
  resources: Resource[];
  loadingAll: boolean;
  generating: boolean;
  generationStages: GenerationStage[];
  lastGeneratedAt: Date | null;
  error: string | null;
  generateScenario: (scenarioType: string, seed: number) => Promise<ScenarioSummary>;
  setPlan: (plan: OptimizedSchedulePlanResponse | null) => void;
  applyReplanToActiveState: (replanDiff: ReplanDiffResponse) => void;
  refreshAllData: () => Promise<void>;
  clearError: () => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioSummary | null>(null);
  const [scenariosList, setScenariosList] = useState<ScenarioInfo[]>([]);
  const [activePlan, setActivePlan] = useState<OptimizedSchedulePlanResponse | null>(null);
  const [appliedReplan, setAppliedReplan] = useState<ReplanDiffResponse | null>(null);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [trains, setTrains] = useState<TrainMovement[]>([]);
  const [opportunities, setOpportunities] = useState<BlockOpportunity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingAll, setLoadingAll] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialStages: GenerationStage[] = [
    { id: 1, label: 'Validating scenario configuration & random seed...', status: 'pending' },
    { id: 2, label: 'Synthesizing corridor topology (7 sections, 64 track assets)...', status: 'pending' },
    { id: 3, label: 'Generating timetable (50 train movements & freight paths)...', status: 'pending' },
    { id: 4, label: 'Formulating multi-department work orders (ENGG, TRD, S&T)...', status: 'pending' },
    { id: 5, label: 'Detecting low-density block opportunities & resource allocations...', status: 'pending' },
    { id: 6, label: 'Committing active railway environment to database...', status: 'pending' },
  ];

  const [generationStages, setGenerationStages] = useState<GenerationStage[]>(initialStages);

  const refreshAllData = useCallback(async () => {
    try {
      setLoadingAll(true);
      setError(null);
      const [scList, sumData, taskData, trainData, oppData, resData] = await Promise.all([
        apiClient.getScenarios(),
        apiClient.getScenarioSummary(),
        apiClient.getMaintenanceTasks(),
        apiClient.getTrains(),
        apiClient.getBlockOpportunities(),
        apiClient.getResources(),
      ]);

      setScenariosList(scList);
      setActiveScenario(sumData);
      setTasks(taskData);
      setTrains(trainData);
      setOpportunities(oppData);
      setResources(resData);
    } catch (err: any) {
      console.error('Failed to load active scenario data:', err);
      setError(err.message || 'Failed to load scenario data from backend');
    } finally {
      setLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const generateScenario = async (scenarioType: string, seed: number): Promise<ScenarioSummary> => {
    setGenerating(true);
    setError(null);

    // Reset stages
    setGenerationStages(initialStages.map((s) => ({ ...s, status: 'pending' })));

    try {
      // Stage 1
      setGenerationStages((prev) =>
        prev.map((s) => (s.id === 1 ? { ...s, status: 'running' } : s))
      );
      await new Promise((r) => setTimeout(r, 200));
      setGenerationStages((prev) =>
        prev.map((s) => (s.id === 1 ? { ...s, status: 'completed' } : s.id === 2 ? { ...s, status: 'running' } : s))
      );

      // Stage 2
      await new Promise((r) => setTimeout(r, 250));
      setGenerationStages((prev) =>
        prev.map((s) => (s.id === 2 ? { ...s, status: 'completed' } : s.id === 3 ? { ...s, status: 'running' } : s))
      );

      // Stage 3 & API Call
      const summary = await apiClient.generateScenario({
        scenario_type: scenarioType,
        seed: Number(seed),
      });

      setGenerationStages((prev) =>
        prev.map((s) => (s.id === 3 ? { ...s, status: 'completed' } : s.id === 4 ? { ...s, status: 'running' } : s))
      );
      await new Promise((r) => setTimeout(r, 200));

      setGenerationStages((prev) =>
        prev.map((s) => (s.id === 4 ? { ...s, status: 'completed' } : s.id === 5 ? { ...s, status: 'running' } : s))
      );
      await new Promise((r) => setTimeout(r, 200));

      setGenerationStages((prev) =>
        prev.map((s) => (s.id === 5 ? { ...s, status: 'completed' } : s.id === 6 ? { ...s, status: 'running' } : s))
      );
      await new Promise((r) => setTimeout(r, 150));

      setGenerationStages((prev) =>
        prev.map((s) => ({ ...s, status: 'completed' }))
      );

      setActiveScenario(summary);
      setLastGeneratedAt(new Date());
      setAppliedReplan(null); // Reset applied replan on new scenario generation

      // Refresh domain data to match new scenario
      await refreshAllData();

      return summary;
    } catch (err: any) {
      setGenerationStages((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'failed' } : s))
      );
      setError(err.message || 'Scenario generation failed');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const applyReplanToActiveState = (replanDiff: ReplanDiffResponse) => {
    setAppliedReplan(replanDiff);
    if (replanDiff.new_plan) {
      setActivePlan(replanDiff.new_plan);
    }
  };

  return (
    <ScenarioContext.Provider
      value={{
        activeScenario,
        scenariosList,
        activePlan,
        appliedReplan,
        tasks,
        trains,
        opportunities,
        resources,
        loadingAll,
        generating,
        generationStages,
        lastGeneratedAt,
        error,
        generateScenario,
        setPlan: setActivePlan,
        applyReplanToActiveState,
        refreshAllData,
        clearError: () => setError(null),
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
