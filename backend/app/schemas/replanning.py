"""
Pydantic Schemas for Dynamic Replanning & What-If Simulation API
Phase 8 IntelliBlock AI
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.optimizer import OptimizedSchedulePlanResponse


class DisruptionEventSchema(BaseModel):
    event_id: Optional[str] = None
    disruption_type: str = Field(..., json_schema_extra={"example": "TRAIN_DELAY"})
    target_id: str = Field(..., json_schema_extra={"example": "12001"})
    magnitude_minutes: int = Field(..., ge=1, le=720, json_schema_extra={"example": 45})
    occurred_at: Optional[datetime] = None
    notes: Optional[str] = None


class DynamicReplanRequest(BaseModel):
    disruptions: List[DisruptionEventSchema]
    scenario_type: Optional[str] = "NORMAL"


class TaskScheduleShiftSchema(BaseModel):
    task_id: str
    previous_start: datetime
    new_start: datetime
    previous_end: datetime
    new_end: datetime
    shift_delta_minutes: int
    reason: str


class ReplanDiffResponse(BaseModel):
    plan_id: str
    original_plan_id: str
    replan_timestamp: datetime
    unchanged_tasks_count: int
    shifted_tasks: List[TaskScheduleShiftSchema]
    cancelled_tasks: List[str]
    inserted_tasks: List[str]
    punctuality_recovery_minutes: int
    new_plan: Optional[OptimizedSchedulePlanResponse] = None
    summary: str


class WhatIfSimulateRequest(BaseModel):
    disruption: DisruptionEventSchema
    scenario_type: Optional[str] = "NORMAL"


class WhatIfSimulationResultResponse(BaseModel):
    simulation_id: str
    disruption: DisruptionEventSchema
    cascade_unmitigated_train_delay_mins: int
    replan_mitigated_train_delay_mins: int
    delay_saved_minutes: int
    conflicted_blocks_count: int
    replan_diff: ReplanDiffResponse
    summary: str
