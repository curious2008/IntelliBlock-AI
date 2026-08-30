"""
Optimization Engine Domain Models & Contracts — Phase 6 IntelliBlock AI

Defines structured data contracts for optimization objectives, schedule generation requests,
optimized block assignments, and multi-objective KPI scorecards.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class OptimizerConfig:
    """Configurable weights for multi-objective optimization."""
    priority_weight: float = 1.0        # Weight for clearing high priority / emergency tasks
    train_punctuality_weight: float = 1.5 # Weight for avoiding train delay / conflict
    overrun_risk_penalty: float = 0.8    # Penalty for scheduling high overrun risk tasks
    bundling_bonus_weight: float = 1.2   # Reward for co-locating cross-dept tasks in same block
    resource_efficiency_weight: float = 0.6
    max_iterations: int = 100
    allow_partial_schedule: bool = True  # If true, schedule highest priority feasible tasks if capacity full


@dataclass
class OptimizedTaskBlock:
    """An individual scheduled task assigned within a block possession."""
    task_id: str
    task_type: str
    department: str
    corridor_id: str
    track_section_id: str
    scheduled_start: datetime
    scheduled_end: datetime
    duration_minutes: int
    opportunity_id: Optional[str] = None
    assigned_resource_ids: List[str] = field(default_factory=list)
    predicted_duration_mins: Optional[int] = None
    overrun_probability: Optional[float] = None
    overrun_risk_level: Optional[str] = None
    is_bundled: bool = False
    bundled_with_task_ids: List[str] = field(default_factory=list)


@dataclass
class PlanKPIScorecard:
    """Multi-objective KPI score metrics for an optimized block plan."""
    overall_score: float                # Normalized score [0.0 - 100.0]
    tasks_scheduled_count: int
    total_requested_tasks: int
    scheduled_percentage: float
    urgent_tasks_scheduled_percentage: float
    cross_dept_bundled_tasks_count: int
    bundling_efficiency_score: float    # [0.0 - 100.0]
    total_block_hours_utilized: float
    train_punctuality_impact_score: float # Lower is better disruption penalty
    avg_overrun_risk_probability: float
    resource_utilization_percentage: float


@dataclass
class OptimizedSchedulePlan:
    """The master optimized block maintenance plan output."""
    plan_id: str
    generated_at: datetime
    scenario_type: str
    is_feasible: bool
    kpi_scorecard: PlanKPIScorecard
    blocks: List[OptimizedTaskBlock] = field(default_factory=list)
    unscheduled_task_ids: List[str] = field(default_factory=list)
    unscheduled_reasons: Dict[str, str] = field(default_factory=dict)
    summary: str = ""
