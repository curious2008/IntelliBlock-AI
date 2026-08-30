"""
Block Planning & Cross-Department Bundling Contracts — Phase 7 IntelliBlock AI

Defines structured data contracts for opportunity discovery, multi-department bundled
possessions, and operational synergy scorecards.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class BundledTaskItem:
    task_id: str
    task_type: str
    department: str
    description: str
    estimated_duration_mins: int
    priority_score: float
    is_emergency: bool


@dataclass
class BundledPossessionBlock:
    """Represents a unified possession window containing multiple coordinated tasks."""
    bundle_id: str
    corridor_id: str
    track_section_id: str
    opportunity_id: Optional[str]
    window_start: datetime
    window_end: datetime
    total_possession_duration_mins: int
    participating_departments: List[str]
    bundled_tasks: List[BundledTaskItem] = field(default_factory=list)
    synergy_minutes_saved: int = 0
    train_delay_reduction_score: float = 0.0
    safety_validated: bool = True


@dataclass
class BundlingSynergyReport:
    """Overall summary of cross-department bundling gains across a schedule."""
    total_bundles_count: int
    total_tasks_bundled: int
    departments_involved: List[str]
    total_line_block_minutes_saved: int
    estimated_passenger_delay_minutes_avoided: int
    synergy_index: float  # [0.0 - 100.0]
    bundles: List[BundledPossessionBlock] = field(default_factory=list)
