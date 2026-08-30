"""
Pydantic Schemas for Optimizer Engine API
Phase 6 IntelliBlock AI
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class OptimizerConfigSchema(BaseModel):
    priority_weight: float = Field(1.0, ge=0.0, le=10.0)
    train_punctuality_weight: float = Field(1.5, ge=0.0, le=10.0)
    overrun_risk_penalty: float = Field(0.8, ge=0.0, le=10.0)
    bundling_bonus_weight: float = Field(1.2, ge=0.0, le=10.0)
    resource_efficiency_weight: float = Field(0.6, ge=0.0, le=10.0)


class GeneratePlanRequest(BaseModel):
    scenario_type: Optional[str] = Field("NORMAL", json_schema_extra={"example": "NORMAL"})
    config: Optional[OptimizerConfigSchema] = None


class OptimizedTaskBlockSchema(BaseModel):
    task_id: str
    task_type: str
    department: str
    corridor_id: str
    track_section_id: str
    scheduled_start: datetime
    scheduled_end: datetime
    duration_minutes: int
    opportunity_id: Optional[str] = None
    assigned_resource_ids: List[str] = Field(default_factory=list)
    predicted_duration_mins: Optional[int] = None
    overrun_probability: Optional[float] = None
    overrun_risk_level: Optional[str] = None
    is_bundled: bool = False
    bundled_with_task_ids: List[str] = Field(default_factory=list)


class PlanKPIScorecardSchema(BaseModel):
    overall_score: float
    tasks_scheduled_count: int
    total_requested_tasks: int
    scheduled_percentage: float
    urgent_tasks_scheduled_percentage: float
    cross_dept_bundled_tasks_count: int
    bundling_efficiency_score: float
    total_block_hours_utilized: float
    train_punctuality_impact_score: float
    avg_overrun_risk_probability: float
    resource_utilization_percentage: float


class OptimizedSchedulePlanResponse(BaseModel):
    plan_id: str
    generated_at: datetime
    scenario_type: str
    is_feasible: bool
    kpi_scorecard: PlanKPIScorecardSchema
    blocks: List[OptimizedTaskBlockSchema]
    unscheduled_task_ids: List[str]
    unscheduled_reasons: Dict[str, str]
    summary: str
