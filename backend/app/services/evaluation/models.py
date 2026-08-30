"""
Evaluation, Benchmarks & Stress Testing Contracts — Phase 10 IntelliBlock AI
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class MethodKPIMetrics:
    method_name: str
    description: str
    maintenance_throughput_pct: float
    urgent_tasks_completed_pct: float
    total_block_hours_required: float
    passenger_train_delay_minutes: int
    cross_dept_bundling_efficiency: float
    overall_kpi_score: float
    average_solve_time_ms: float


@dataclass
class BaselineComparisonReport:
    """Rigorous comparison between IntelliBlock AI and traditional railway baselines."""
    generated_at: datetime
    test_scenario: str
    total_benchmark_tasks: int
    intelliblock_ai: MethodKPIMetrics
    manual_siloed_baseline: MethodKPIMetrics
    fcfs_greedy_baseline: MethodKPIMetrics
    static_fixed_block_baseline: MethodKPIMetrics
    throughput_improvement_pct: float
    delay_reduction_pct: float
    block_possession_savings_hours: float
    summary: str


@dataclass
class ScaleBenchmarkTier:
    tier_name: str
    task_count: int
    opportunity_count: int
    train_count: int
    corridor_count: int
    solver_duration_ms: float
    constraint_check_duration_ms: float
    is_feasible: bool
    hard_violations_detected: int


@dataclass
class StressTestReport:
    """Stress test performance report verifying scalability and latency under heavy load."""
    test_timestamp: datetime
    tiers: List[ScaleBenchmarkTier] = field(default_factory=list)
    max_scale_tested_tasks: int = 500
    all_tiers_feasible: bool = True
    average_latency_ms: float = 0.0
    summary: str = ""
