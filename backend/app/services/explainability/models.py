"""
Decision Rationale & Explainability Engine Contracts — Phase 9 IntelliBlock AI
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class RejectedAlternative:
    alternative_window: str
    rejection_reason: str
    constraint_violated: Optional[str] = None
    passenger_delay_penalty_mins: int = 0


@dataclass
class DecisionFactor:
    factor_name: str
    weight_importance: str  # HIGH, MEDIUM, LOW
    description: str
    impact: str             # POSITIVE, NEGATIVE, NEUTRAL


@dataclass
class BlockRationale:
    """Natural language and structured explainability breakdown for an individual scheduled block."""
    task_id: str
    opportunity_id: Optional[str]
    track_section_id: str
    primary_reason: str
    bundling_rationale: Optional[str]
    safety_compliance_summary: str
    decision_factors: List[DecisionFactor] = field(default_factory=list)
    rejected_alternatives: List[RejectedAlternative] = field(default_factory=list)
    human_controller_advisory: str = ""


@dataclass
class PlanExplanationReport:
    """Master natural language executive summary and trade-off audit for a complete schedule plan."""
    plan_id: str
    executive_summary: str
    top_decision_priorities: List[str]
    trade_off_analysis: str
    safety_guarantee_statement: str
    block_rationales: List[BlockRationale] = field(default_factory=list)
