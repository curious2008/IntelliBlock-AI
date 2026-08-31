"""
Pydantic Schemas for Adaptive Planning Horizon and Risk-to-Decision Support
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.replanning import DisruptionEventSchema, ReplanDiffResponse, TaskScheduleShiftSchema
from app.schemas.optimizer import OptimizedSchedulePlanResponse
from app.schemas.constraints import FeasibilityReportSchema


# ==========================================
# 1. Planning Horizon Schemas
# ==========================================

class DepartmentWorkloadItem(BaseModel):
    department: str
    task_count: int = 0
    total_duration_hours: float
    urgent_tasks_count: int
    overdue_tasks_count: int
    workload_percentage: float


class MajorProgramItem(BaseModel):
    program_id: str
    program_name: str
    department: str
    track_section_id: str
    estimated_block_hours: float
    priority_level: str
    planned_week: int
    description: str


class WeekBreakdownItem(BaseModel):
    week_number: int
    week_label: str
    start_date: str
    end_date: str
    task_count: int
    planned_possession_hours: float
    available_capacity_hours: float
    capacity_utilization_pct: float
    urgent_tasks_count: int
    risk_level: str
    status: str


class DayBreakdownItem(BaseModel):
    day_number: int
    day_name: str
    date_str: str
    task_count: int
    scheduled_blocks_count: int
    available_opportunities_count: int
    total_possession_hours: float
    train_traffic_density: str
    has_emergency_task: bool
    status: str


class PlanningHorizonMonthlyResponse(BaseModel):
    month_key: str
    month_name: str
    scenario_type: str
    seed: int
    generated_at: str
    total_maintenance_tasks: int
    urgent_tasks_count: int
    overdue_tasks_count: int
    total_possession_hours_demand: float
    available_block_capacity_hours: float
    capacity_utilization_pct: float
    reserve_contingency_hours: float
    department_workloads: List[DepartmentWorkloadItem]
    major_programs: List[MajorProgramItem]
    overloaded_sections: List[str]
    weeks: List[WeekBreakdownItem]
    summary: str


class PlanningHorizonWeeklyResponse(BaseModel):
    week_number: int
    week_label: str
    month_key: str
    scenario_type: str
    total_tasks_count: int
    planned_possessions_count: int
    available_opportunities_count: int
    total_possession_hours: float
    resource_fleet_available_count: int
    traffic_density_index: str
    carried_over_tasks_count: int
    high_priority_work_count: int
    days: List[DayBreakdownItem]
    summary: str


# ==========================================
# 2. Risk -> Decision Support Schemas
# ==========================================

class DecisionAlternative(BaseModel):
    option_id: str
    title: str
    strategy_type: str  # e.g., "DYNAMIC_WINDOW_SHIFT", "ROUTINE_TASK_DEFERRAL", "POSSESSION_SEGMENTATION"
    description: str
    is_recommended: bool
    is_feasible: bool
    hard_violations_count: int
    soft_violations_count: int
    passenger_train_delay_mins: int
    tasks_preserved_count: int
    tasks_preserved_percentage: float
    resource_conflicts_count: int
    feasibility_report: FeasibilityReportSchema
    replan_diff: Optional[ReplanDiffResponse] = None
    rank_score: float
    rejection_reason: Optional[str] = None


class DecisionSupportRequest(BaseModel):
    disruption: DisruptionEventSchema
    scenario_type: Optional[str] = "NORMAL"


class DecisionSupportResponse(BaseModel):
    analysis_id: str
    generated_at: str
    scenario_type: str
    disruption: DisruptionEventSchema
    is_dangerous_situation: bool
    risk_level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    risk_drivers: List[str]
    cascade_unmitigated_delay_mins: int
    conflicted_blocks_count: int
    is_safe_option_available: bool
    recommended_option_id: Optional[str] = None
    recommended_action_title: str
    executive_recommendation_summary: str
    why_recommended_rationale: List[str]
    alternatives: List[DecisionAlternative]
    controller_advisory_note: str
    human_approval_required: bool = True
