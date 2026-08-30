"""
Dynamic Replanning & What-If Simulation Contracts — Phase 8 IntelliBlock AI
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from app.services.optimizer.models import OptimizedSchedulePlan, OptimizedTaskBlock, PlanKPIScorecard


class DisruptionType(str, Enum):
    TRAIN_DELAY = "TRAIN_DELAY"
    TASK_OVERRUN = "TASK_OVERRUN"
    RESOURCE_BREAKDOWN = "RESOURCE_BREAKDOWN"
    EMERGENCY_WORK_ORDER = "EMERGENCY_WORK_ORDER"
    TRACK_RESTRICTION = "TRACK_RESTRICTION"


@dataclass
class DisruptionEvent:
    event_id: str
    disruption_type: DisruptionType
    target_id: str            # train_id, task_id, or resource_id
    magnitude_minutes: int    # delay/overrun minutes
    occurred_at: datetime
    notes: Optional[str] = None


@dataclass
class TaskScheduleShift:
    task_id: str
    previous_start: datetime
    new_start: datetime
    previous_end: datetime
    new_end: datetime
    shift_delta_minutes: int
    reason: str


@dataclass
class ReplanDiff:
    """Detailed diff between original schedule and dynamic re-optimized schedule."""
    plan_id: str
    original_plan_id: str
    replan_timestamp: datetime
    disruptions_handled: List[DisruptionEvent]
    unchanged_tasks_count: int
    shifted_tasks: List[TaskScheduleShift] = field(default_factory=list)
    cancelled_tasks: List[str] = field(default_factory=list)
    inserted_tasks: List[str] = field(default_factory=list)
    punctuality_recovery_minutes: int = 0
    new_plan: Optional[OptimizedSchedulePlan] = None
    summary: str = ""


@dataclass
class WhatIfSimulationResult:
    """Comparison report between passive default cascade vs active AI dynamic replanning."""
    simulation_id: str
    disruption: DisruptionEvent
    cascade_unmitigated_train_delay_mins: int
    replan_mitigated_train_delay_mins: int
    delay_saved_minutes: int
    conflicted_blocks_count: int
    replan_diff: ReplanDiff
    summary: str
