"""
Pydantic Schemas for Constraint Engine API
Phase 5 IntelliBlock AI
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ScheduledTaskAssignmentSchema(BaseModel):
    task_id: str = Field(..., json_schema_extra={"example": "TSK-2026-0001"})
    scheduled_start: datetime = Field(..., json_schema_extra={"example": "2026-08-31T01:00:00Z"})
    scheduled_end: datetime = Field(..., json_schema_extra={"example": "2026-08-31T03:30:00Z"})
    opportunity_id: Optional[str] = Field(None, json_schema_extra={"example": "OPP-001"})
    assigned_resource_ids: List[str] = Field(default_factory=list, json_schema_extra={"example": ["RES-001", "RES-002"]})
    track_section_id: Optional[str] = Field(None, json_schema_extra={"example": "SEC-DEL-01"})
    corridor_id: Optional[str] = Field(None, json_schema_extra={"example": "COR-DEL-KNP"})
    requires_power_block: bool = Field(False)


class ValidateScheduleRequest(BaseModel):
    assignments: List[ScheduledTaskAssignmentSchema]


class ConstraintViolationSchema(BaseModel):
    constraint_id: str
    constraint_type: str
    severity: str
    message: str
    affected_entity_ids: List[str]
    details: Dict[str, Any] = Field(default_factory=dict)


class ConstraintResultSchema(BaseModel):
    rule_id: str
    rule_name: str
    severity: str
    passed: bool
    violations: List[ConstraintViolationSchema] = Field(default_factory=list)


class FeasibilityReportSchema(BaseModel):
    is_feasible: bool
    hard_violations_count: int
    soft_violations_count: int
    warnings_count: int
    evaluated_rules_count: int
    summary: str
    violations: List[ConstraintViolationSchema]
    results: List[ConstraintResultSchema]


class RuleMetadataSchema(BaseModel):
    rule_id: str
    rule_name: str
    constraint_type: str
    severity: str


class RuleListResponse(BaseModel):
    rules: List[RuleMetadataSchema]
    total_count: int
