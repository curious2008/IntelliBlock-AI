"""
Pydantic Schemas for Evaluation & Benchmarking API
Phase 10 IntelliBlock AI
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class MethodKPIMetricsSchema(BaseModel):
    method_name: str
    description: str
    maintenance_throughput_pct: float
    urgent_tasks_completed_pct: float
    total_block_hours_required: float
    passenger_train_delay_minutes: int
    cross_dept_bundling_efficiency: float
    overall_kpi_score: float
    average_solve_time_ms: float


class BaselineComparisonReportResponse(BaseModel):
    generated_at: datetime
    test_scenario: str
    total_benchmark_tasks: int
    intelliblock_ai: MethodKPIMetricsSchema
    manual_siloed_baseline: MethodKPIMetricsSchema
    fcfs_greedy_baseline: MethodKPIMetricsSchema
    static_fixed_block_baseline: MethodKPIMetricsSchema
    throughput_improvement_pct: float
    delay_reduction_pct: float
    block_possession_savings_hours: float
    summary: str


class ScaleBenchmarkTierSchema(BaseModel):
    tier_name: str
    task_count: int
    opportunity_count: int
    train_count: int
    corridor_count: int
    solver_duration_ms: float
    constraint_check_duration_ms: float
    is_feasible: bool
    hard_violations_detected: int


class StressTestReportResponse(BaseModel):
    test_timestamp: datetime
    tiers: List[ScaleBenchmarkTierSchema]
    max_scale_tested_tasks: int
    all_tiers_feasible: bool
    average_latency_ms: float
    summary: str
