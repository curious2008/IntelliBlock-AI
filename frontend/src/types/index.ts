// API Health Status
export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
}

// Department
export interface Department {
  department_code: string;
  department_name: string;
  contact_officer: string | null;
  priority_weight: number;
  created_at: string;
}

// Track Section
export interface TrackSection {
  section_id: string;
  corridor_id: string;
  sequence_order: number;
  name: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  track_configuration: string;
  max_permissible_speed_kmh: number;
  operational_status: string;
  created_at?: string;
}

// Corridor
export interface Corridor {
  corridor_id: string;
  name: string;
  start_location: string;
  end_location: string;
  total_length_km: number;
  track_configuration: string;
  sections_json: TrackSection[];
  operational_status: string;
  created_at: string;
}

// Asset
export interface Asset {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  department: string;
  corridor_id: string;
  track_section_id: string;
  location_km_start: number;
  location_km_end: number;
  criticality_index: number;
  condition_score: number;
  operational_status: string;
  installation_date: string | null;
  last_maintenance_date: string | null;
  next_due_date: string | null;
  created_at: string;
}

// Maintenance Task
export interface MaintenanceTask {
  task_id: string;
  asset_id: string;
  department: string;
  task_type: string;
  description: string | null;
  priority_score: number;
  is_emergency: boolean;
  due_date: string;
  estimated_duration_mins: number;
  minimum_duration_mins: number;
  maximum_duration_mins: number;
  required_resources: string[];
  preferred_time_window: Record<string, string> | null;
  location_corridor_id: string;
  location_section_id: string;
  prerequisite_task_ids: string[];
  compatible_task_types: string[];
  status: string;
  created_at: string;
}

// Train Movement
export interface TrainMovement {
  train_id: string;
  train_number: string;
  train_name: string;
  train_type: string;
  corridor_id: string;
  track_section_id?: string | null;
  direction: string;
  scheduled_entry_time: string;
  scheduled_exit_time: string;
  priority_category: number;
  delay_minutes: number;
  status: string;
  created_at: string;
}

// Resource
export interface Resource {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  department: string;
  capability: string;
  home_depot_location: string;
  current_location_section_id: string;
  available_from: string;
  available_until: string;
  status: string;
  created_at: string;
}

// Block Opportunity
export interface BlockOpportunity {
  opportunity_id: string;
  corridor_id: string;
  track_section_id: string;
  window_start: string;
  window_end: string;
  maximum_duration_mins: number;
  availability_status: string;
  affected_line_direction: string;
  is_power_block_available: boolean;
  restriction_notes: string | null;
  created_at: string;
}

// Freight Forecast
export interface FreightForecast {
  forecast_id: string;
  corridor_id: string;
  track_section_id: string;
  window_start: string;
  window_end: string;
  expected_freight_density: string;
  confidence_level: number;
  notes: string | null;
  created_at: string;
}

// Scenario Types
export interface ScenarioInfo {
  scenario_type: string;
  name: string;
  description: string;
  purpose: string;
  traffic_density: string;
  maintenance_demand: string;
  resource_availability: string;
}

export interface ScenarioSummary {
  run_id: string;
  scenario_type: string;
  scenario_name: string;
  seed: number;
  generated_at: string;
  corridor_count: number;
  track_section_count: number;
  asset_count: number;
  maintenance_task_count: number;
  train_movement_count: number;
  freight_forecast_count: number;
  resource_count: number;
  block_opportunity_count: number;
  overdue_task_count: number;
  emergency_task_count: number;
  overlapping_request_count: number;
  traffic_density_level: string;
  resource_bottleneck_status: string;
}

export interface ScenarioGenerateRequest {
  scenario_type: string;
  seed: number;
}

// AI Interfaces
export interface DurationPredictionRequest {
  task_id: string;
  task_type: string;
  department: string;
  estimated_duration_mins: number;
  minimum_duration_mins: number;
  maximum_duration_mins: number;
  priority_score: number;
  is_emergency: boolean;
  dependency_count: number;
  resource_count: number;
  asset_condition_score: number;
  asset_criticality_index: number;
  asset_age_years: number;
  days_since_last_maintenance: number;
  days_until_due: number;
  crew_available_count: number;
  machine_available_count: number;
  train_density_24h: number;
  freight_density: string;
  best_opportunity_duration_mins: number;
  scenario_type: string;
}

export interface DurationPredictionResponse {
  task_id: string;
  predicted_duration_minutes: number;
  lower_bound_minutes: number;
  upper_bound_minutes: number;
  confidence: number;
  model_name: string;
  model_version: string;
  feature_version: string;
  prediction_basis: string;
}

export interface OverrunRiskRequest {
  task_id: string;
  task_type: string;
  department: string;
  estimated_duration_mins: number;
  minimum_duration_mins: number;
  maximum_duration_mins: number;
  priority_score: number;
  is_emergency: boolean;
  dependency_count: number;
  resource_count: number;
  asset_condition_score: number;
  asset_criticality_index: number;
  asset_age_years: number;
  days_since_last_maintenance: number;
  days_until_due: number;
  crew_available_count: number;
  machine_available_count: number;
  train_density_24h: number;
  freight_density: string;
  best_opportunity_duration_mins: number;
  scenario_type: string;
}

export interface OverrunRiskResponse {
  task_id: string;
  overrun_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  confidence: number;
  model_name: string;
  model_version: string;
  feature_version: string;
  prediction_basis: string;
}

export interface AssetRiskRequest {
  asset_id: string;
  condition_score: number;
  criticality_index: number;
  days_since_last_maintenance: number;
  days_until_due: number;
  open_task_count: number;
  overdue_task_count: number;
}

export interface AssetRiskResponse {
  asset_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  confidence: number;
  score_components: {
    condition_risk: number;
    criticality_weight: number;
    overdue_penalty: number;
  };
  weight_config: Record<string, number>;
  model_name: string;
  model_version: string;
  feature_version: string;
  prediction_basis: string;
}

export interface ModelStatusEntry {
  model_name: string;
  model_version: string;
  status: string;
  feature_version: string;
  record_count: number;
  created_at: string | null;
  metrics: Record<string, any>;
  prediction_basis: string;
}

export interface ModelStatusResponse {
  models: ModelStatusEntry[];
  api_version: string;
  feature_version: string;
}

// Constraint Engine Interfaces
export interface ScheduledTaskAssignmentInput {
  task_id: string;
  scheduled_start: string;
  scheduled_end: string;
  opportunity_id?: string;
  assigned_resource_ids?: string[];
  track_section_id?: string;
  corridor_id?: string;
  requires_power_block?: boolean;
}

export interface ValidateScheduleRequest {
  assignments: ScheduledTaskAssignmentInput[];
}

export interface ConstraintViolation {
  constraint_id: string;
  constraint_type: string;
  severity: 'HARD' | 'SOFT' | 'WARNING' | string;
  message: string;
  affected_entity_ids: string[];
  details: Record<string, any>;
}

export interface ConstraintRuleResult {
  rule_id: string;
  rule_name: string;
  severity: 'HARD' | 'SOFT' | 'WARNING' | string;
  passed: boolean;
  violations: ConstraintViolation[];
}

export interface FeasibilityReportResponse {
  is_feasible: boolean;
  hard_violations_count: number;
  soft_violations_count: number;
  warnings_count: number;
  evaluated_rules_count: number;
  summary: string;
  violations: ConstraintViolation[];
  results: ConstraintRuleResult[];
}

export interface RuleMetadata {
  rule_id: string;
  rule_name: string;
  constraint_type: string;
  severity: string;
}

export interface RuleListResponse {
  rules: RuleMetadata[];
  total_count: number;
}

// Optimizer Interfaces
export interface OptimizerConfigInput {
  priority_weight?: number;
  train_punctuality_weight?: number;
  overrun_risk_penalty?: number;
  bundling_bonus_weight?: number;
  resource_efficiency_weight?: number;
}

export interface GeneratePlanRequest {
  scenario_type?: string;
  config?: OptimizerConfigInput;
}

export interface OptimizedTaskBlock {
  task_id: string;
  task_type: string;
  department: string;
  corridor_id: string;
  track_section_id: string;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  opportunity_id?: string;
  assigned_resource_ids: string[];
  predicted_duration_mins?: number;
  overrun_probability?: number;
  overrun_risk_level?: string;
  is_bundled: boolean;
  bundled_with_task_ids: string[];
}

export interface PlanKPIScorecard {
  overall_score: number;
  tasks_scheduled_count: number;
  total_requested_tasks: number;
  scheduled_percentage: number;
  urgent_tasks_scheduled_percentage: number;
  cross_dept_bundled_tasks_count: number;
  bundling_efficiency_score: number;
  total_block_hours_utilized: number;
  train_punctuality_impact_score: number;
  avg_overrun_risk_probability: number;
  resource_utilization_percentage: number;
}

export interface OptimizedSchedulePlanResponse {
  plan_id: string;
  generated_at: string;
  scenario_type: string;
  is_feasible: boolean;
  kpi_scorecard: PlanKPIScorecard;
  blocks: OptimizedTaskBlock[];
  unscheduled_task_ids: string[];
  unscheduled_reasons: Record<string, string>;
  summary: string;
}

// Bundling Interfaces
export interface BundledTaskItem {
  task_id: string;
  task_type: string;
  department: string;
  description: string;
  estimated_duration_mins: number;
  priority_score: number;
  is_emergency: boolean;
}

export interface BundledPossessionBlock {
  bundle_id: string;
  corridor_id: string;
  track_section_id: string;
  opportunity_id: string | null;
  window_start: string;
  window_end: string;
  total_possession_duration_mins: number;
  participating_departments: string[];
  bundled_tasks: BundledTaskItem[];
  synergy_minutes_saved: number;
  train_delay_reduction_score: number;
  safety_validated: boolean;
}

export interface BundlingSynergyReportResponse {
  total_bundles_count: number;
  total_tasks_bundled: number;
  departments_involved: string[];
  total_line_block_minutes_saved: number;
  estimated_passenger_delay_minutes_avoided: number;
  synergy_index: number;
  bundles: BundledPossessionBlock[];
}

// Replanning & What-If Interfaces
export interface DisruptionEventInput {
  event_id?: string;
  disruption_type: 'TRAIN_DELAY' | 'TASK_OVERRUN' | 'RESOURCE_BREAKDOWN' | 'EMERGENCY_WORK_ORDER' | 'TRACK_RESTRICTION' | string;
  target_id: string;
  magnitude_minutes: number;
  occurred_at?: string;
  notes?: string;
}

export interface TaskScheduleShift {
  task_id: string;
  previous_start: string;
  new_start: string;
  previous_end: string;
  new_end: string;
  shift_delta_minutes: number;
  reason: string;
}

export interface ReplanDiffResponse {
  plan_id: string;
  original_plan_id: string;
  replan_timestamp: string;
  unchanged_tasks_count: number;
  shifted_tasks: TaskScheduleShift[];
  cancelled_tasks: string[];
  inserted_tasks: string[];
  punctuality_recovery_minutes: number;
  new_plan: OptimizedSchedulePlanResponse | null;
  summary: string;
}

export interface WhatIfSimulationResultResponse {
  simulation_id: string;
  disruption: DisruptionEventInput;
  cascade_unmitigated_train_delay_mins: number;
  replan_mitigated_train_delay_mins: number;
  delay_saved_minutes: number;
  conflicted_blocks_count: number;
  replan_diff: ReplanDiffResponse;
  summary: string;
}

// Explainability Interfaces
export interface RejectedAlternative {
  alternative_window: string;
  rejection_reason: string;
  constraint_violated?: string;
  passenger_delay_penalty_mins: number;
}

export interface DecisionFactor {
  factor_name: string;
  weight_importance: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  description: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | string;
}

export interface BlockRationaleResponse {
  task_id: string;
  opportunity_id?: string;
  track_section_id: string;
  primary_reason: string;
  bundling_rationale?: string;
  safety_compliance_summary: string;
  decision_factors: DecisionFactor[];
  rejected_alternatives: RejectedAlternative[];
  human_controller_advisory: string;
}

export interface PlanExplanationReportResponse {
  plan_id: string;
  executive_summary: string;
  top_decision_priorities: string[];
  trade_off_analysis: string;
  safety_guarantee_statement: string;
  block_rationales: BlockRationaleResponse[];
}

// Evaluation & Benchmarking Interfaces
export interface MethodKPIMetrics {
  method_name: string;
  description: string;
  maintenance_throughput_pct: number;
  urgent_tasks_completed_pct: number;
  total_block_hours_required: number;
  passenger_train_delay_minutes: number;
  cross_dept_bundling_efficiency: number;
  overall_kpi_score: number;
  average_solve_time_ms: number;
}

export interface BaselineComparisonReportResponse {
  generated_at: string;
  test_scenario: string;
  total_benchmark_tasks: number;
  intelliblock_ai: MethodKPIMetrics;
  manual_siloed_baseline: MethodKPIMetrics;
  fcfs_greedy_baseline: MethodKPIMetrics;
  static_fixed_block_baseline: MethodKPIMetrics;
  throughput_improvement_pct: number;
  delay_reduction_pct: number;
  block_possession_savings_hours: number;
  summary: string;
}

export interface ScaleBenchmarkTier {
  tier_name: string;
  task_count: number;
  opportunity_count: number;
  train_count: number;
  corridor_count: number;
  solver_duration_ms: number;
  constraint_check_duration_ms: number;
  is_feasible: boolean;
  hard_violations_detected: number;
}

export interface StressTestReportResponse {
  test_timestamp: string;
  tiers: ScaleBenchmarkTier[];
  max_scale_tested_tasks: number;
  all_tiers_feasible: boolean;
  average_latency_ms: number;
  summary: string;
}

// Integrations & n8n Interfaces
export interface AdapterStatusSchema {
  system_type: string;
  system_name: string;
  status: string;
  endpoint_url: string;
  last_sync_timestamp: string;
  active_feed_type: string;
  security_protocol: string;
}

export interface AdapterStatusListResponse {
  adapters: AdapterStatusSchema[];
  total_connected: number;
}

export interface InboundWebhookRequest {
  source_system: string;
  event_type: string;
  payload?: Record<string, any>;
}

export interface InboundWebhookResponse {
  event_id: string;
  source_system: string;
  event_type: string;
  timestamp: string;
  acknowledged: boolean;
  action_taken: string;
}

export interface OutboundWebhookRequest {
  target_system: string;
  event_type: string;
  payload?: Record<string, any>;
}

export interface OutboundWebhookResponse {
  dispatch_id: string;
  target_system: string;
  event_type: string;
  dispatched_at: string;
  status_code: number;
  delivered: boolean;
}

// Standard API Error
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, any>;
  };
}








