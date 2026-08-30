"""
Pydantic Schemas for Bundling API
Phase 7 IntelliBlock AI
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class BundledTaskItemSchema(BaseModel):
    task_id: str
    task_type: str
    department: str
    description: str
    estimated_duration_mins: int
    priority_score: float
    is_emergency: bool


class BundledPossessionBlockSchema(BaseModel):
    bundle_id: str
    corridor_id: str
    track_section_id: str
    opportunity_id: Optional[str] = None
    window_start: datetime
    window_end: datetime
    total_possession_duration_mins: int
    participating_departments: List[str]
    bundled_tasks: List[BundledTaskItemSchema]
    synergy_minutes_saved: int
    train_delay_reduction_score: float
    safety_validated: bool


class BundlingSynergyReportResponse(BaseModel):
    total_bundles_count: int
    total_tasks_bundled: int
    departments_involved: List[str]
    total_line_block_minutes_saved: int
    estimated_passenger_delay_minutes_avoided: int
    synergy_index: float
    bundles: List[BundledPossessionBlockSchema]
