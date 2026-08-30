"""
Constraint Engine Domain Contracts — Phase 5 IntelliBlock AI

Defines structured data contracts for constraint validation, schedule assignments,
individual rule results, and comprehensive feasibility reports.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class ConstraintSeverity(str, Enum):
    HARD = "HARD"         # Must NEVER be violated (physical / safety limits)
    SOFT = "SOFT"         # Optimization trade-off (preferences, balance)
    WARNING = "WARNING"   # Operational advisory (near-threshold condition)


class ConstraintType(str, Enum):
    TIME_WINDOW_VALIDITY = "TIME_WINDOW_VALIDITY"
    BLOCK_OPPORTUNITY_ALIGNMENT = "BLOCK_OPPORTUNITY_ALIGNMENT"
    RESOURCE_NO_OVERLAP = "RESOURCE_NO_OVERLAP"
    RESOURCE_CAPABILITY_MATCH = "RESOURCE_CAPABILITY_MATCH"
    TASK_PREREQUISITES = "TASK_PREREQUISITES"
    TRAIN_MOVEMENT_CONFLICT = "TRAIN_MOVEMENT_CONFLICT"
    POWER_BLOCK_ISOLATION = "POWER_BLOCK_ISOLATION"
    CROSS_DEPT_SAFETY = "CROSS_DEPT_SAFETY"


@dataclass
class ScheduledTaskAssignment:
    """Represents a proposed task assignment to a time window, opportunity, and resource(s)."""
    task_id: str
    scheduled_start: datetime
    scheduled_end: datetime
    opportunity_id: Optional[str] = None
    assigned_resource_ids: List[str] = field(default_factory=list)
    track_section_id: Optional[str] = None
    corridor_id: Optional[str] = None
    requires_power_block: bool = False


@dataclass
class ConstraintViolation:
    """Detailed record of a single constraint violation."""
    constraint_id: str
    constraint_type: ConstraintType
    severity: ConstraintSeverity
    message: str
    affected_entity_ids: List[str]
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ConstraintResult:
    """Evaluation result for a specific rule."""
    rule_id: str
    rule_name: str
    severity: ConstraintSeverity
    passed: bool
    violations: List[ConstraintViolation] = field(default_factory=list)


@dataclass
class FeasibilityReport:
    """Overall schedule feasibility evaluation summary."""
    is_feasible: bool
    hard_violations_count: int
    soft_violations_count: int
    warnings_count: int
    evaluated_rules_count: int
    results: List[ConstraintResult] = field(default_factory=list)
    violations: List[ConstraintViolation] = field(default_factory=list)
    summary: str = ""
