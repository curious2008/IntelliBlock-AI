"""
Pydantic Schemas for Explainability API
Phase 9 IntelliBlock AI
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class RejectedAlternativeSchema(BaseModel):
    alternative_window: str
    rejection_reason: str
    constraint_violated: Optional[str] = None
    passenger_delay_penalty_mins: int = 0


class DecisionFactorSchema(BaseModel):
    factor_name: str
    weight_importance: str
    description: str
    impact: str


class BlockRationaleResponse(BaseModel):
    task_id: str
    opportunity_id: Optional[str] = None
    track_section_id: str
    primary_reason: str
    bundling_rationale: Optional[str] = None
    safety_compliance_summary: str
    decision_factors: List[DecisionFactorSchema]
    rejected_alternatives: List[RejectedAlternativeSchema]
    human_controller_advisory: str


class PlanExplanationReportResponse(BaseModel):
    plan_id: str
    executive_summary: str
    top_decision_priorities: List[str]
    trade_off_analysis: str
    safety_guarantee_statement: str
    block_rationales: List[BlockRationaleResponse]
