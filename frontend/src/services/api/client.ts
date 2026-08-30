/// <reference types="vite/client" />
import {
  HealthStatus, Department, Corridor, Asset,
  MaintenanceTask, TrainMovement, Resource, BlockOpportunity, FreightForecast,
  ScenarioInfo, ScenarioSummary, ScenarioGenerateRequest, ApiErrorResponse
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  code: string;
  details: Record<string, any>;
  status: number;

  constructor(code: string, message: string, details: Record<string, any> = {}, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      throw new ApiError(
        errorData.error?.code || 'HTTP_ERROR',
        errorData.error?.message || `HTTP Request failed with status ${response.status}`,
        errorData.error?.details || {},
        response.status
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      'NETWORK_ERROR',
      err.message || 'Failed to communicate with IntelliBlock API backend',
      { originalError: err.toString() },
      0
    );
  }
}

export const apiClient = {
  // Health
  getHealth: () => request<HealthStatus>('/health'),

  // Scenarios
  getScenarios: () => request<ScenarioInfo[]>('/scenarios'),
  getScenarioSummary: () => request<ScenarioSummary>('/scenarios/summary'),
  generateScenario: (payload: ScenarioGenerateRequest) => request<ScenarioSummary>('/scenarios/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Departments
  getDepartments: () => request<Department[]>('/departments'),

  // Corridors
  getCorridors: () => request<Corridor[]>('/corridors'),

  // Assets
  getAssets: (department?: string) => {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return request<Asset[]>(`/assets${query}`);
  },

  // Maintenance Tasks
  getMaintenanceTasks: (department?: string, status?: string) => {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<MaintenanceTask[]>(`/maintenance-tasks${query}`);
  },

  // Trains
  getTrains: (corridorId?: string) => {
    const query = corridorId ? `?corridor_id=${encodeURIComponent(corridorId)}` : '';
    return request<TrainMovement[]>(`/trains${query}`);
  },

  // Freight Forecasts
  getFreightForecasts: (corridorId?: string) => {
    const query = corridorId ? `?corridor_id=${encodeURIComponent(corridorId)}` : '';
    return request<FreightForecast[]>(`/freight-forecasts${query}`);
  },

  // Resources
  getResources: (department?: string) => {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return request<Resource[]>(`/resources${query}`);
  },

  // Block Opportunities
  getBlockOpportunities: (corridorId?: string) => {
    const query = corridorId ? `?corridor_id=${encodeURIComponent(corridorId)}` : '';
    return request<BlockOpportunity[]>(`/block-opportunities${query}`);
  },

  // AI Intelligence Services
  predictDuration: (payload: import('../../types').DurationPredictionRequest) =>
    request<import('../../types').DurationPredictionResponse>('/ai/predict-duration', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  predictOverrunRisk: (payload: import('../../types').OverrunRiskRequest) =>
    request<import('../../types').OverrunRiskResponse>('/ai/predict-overrun-risk', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  assessMaintenanceRisk: (payload: import('../../types').AssetRiskRequest) =>
    request<import('../../types').AssetRiskResponse>('/ai/assess-maintenance-risk', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAIModelStatus: () =>
    request<import('../../types').ModelStatusResponse>('/ai/model-status'),

  // Constraint Engine
  validateSchedule: (payload: import('../../types').ValidateScheduleRequest) =>
    request<import('../../types').FeasibilityReportResponse>('/constraints/validate-schedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getConstraintRules: () =>
    request<import('../../types').RuleListResponse>('/constraints/rules'),

  // Optimization Engine
  generatePlan: (payload?: import('../../types').GeneratePlanRequest) =>
    request<import('../../types').OptimizedSchedulePlanResponse>('/optimizer/generate-plan', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  // Task Bundling Engine
  coordinateBundles: () =>
    request<import('../../types').BundlingSynergyReportResponse>('/bundling/coordinate-bundles', {
      method: 'POST',
    }),

  // Dynamic Replanning & What-If Simulator
  executeDynamicReplan: (payload: { disruptions: import('../../types').DisruptionEventInput[]; scenario_type?: string }) =>
    request<import('../../types').ReplanDiffResponse>('/replanning/dynamic-replan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  simulateWhatIf: (payload: { disruption: import('../../types').DisruptionEventInput; scenario_type?: string }) =>
    request<import('../../types').WhatIfSimulationResultResponse>('/replanning/simulate-whatif', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Explainability & Decision Support Engine
  explainActivePlan: (scenarioType: string = 'NORMAL') =>
    request<import('../../types').PlanExplanationReportResponse>(`/explainability/explain-active-plan?scenario_type=${encodeURIComponent(scenarioType)}`, {
      method: 'POST',
    }),

  // Evaluation & Benchmarking Engine
  benchmarkBaselines: (scenarioType: string = 'NORMAL') =>
    request<import('../../types').BaselineComparisonReportResponse>(`/evaluation/benchmark-baselines?scenario_type=${encodeURIComponent(scenarioType)}`, {
      method: 'POST',
    }),

  runStressTest: () =>
    request<import('../../types').StressTestReportResponse>('/evaluation/run-stress-test', {
      method: 'POST',
    }),

  // External Railway Adapters & n8n
  getAdapterStatuses: () =>
    request<import('../../types').AdapterStatusListResponse>('/integrations/adapters/status'),

  sendInboundWebhook: (payload: import('../../types').InboundWebhookRequest) =>
    request<import('../../types').InboundWebhookResponse>('/integrations/webhooks/inbound', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  dispatchOutboundWebhook: (payload: import('../../types').OutboundWebhookRequest) =>
    request<import('../../types').OutboundWebhookResponse>('/integrations/webhooks/dispatch', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};








