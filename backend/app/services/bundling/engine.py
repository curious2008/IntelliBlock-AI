"""
Intelligent Cross-Department Task Bundling Engine — Phase 7 IntelliBlock AI
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set
import uuid

from app.services.bundling.models import (
    BundledPossessionBlock, BundledTaskItem, BundlingSynergyReport
)
from app.services.constraints.rules import CrossDeptSafetyRule


def _g(obj: Any, key: str, default: Any = None) -> Any:
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


class BundlingCoordinator:
    """Coordinates multi-department task bundling and opportunity synergy analysis."""

    def __init__(self):
        self.incompatible_pairs = CrossDeptSafetyRule.INCOMPATIBLE_PAIRS

    def coordinate_bundles(
        self,
        tasks: List[Any],
        opportunities: List[Any]
    ) -> BundlingSynergyReport:
        # 1. Group tasks by section
        section_tasks: Dict[str, List[Any]] = {}
        for t in tasks:
            sec = _g(t, "location_section_id") or "UNKNOWN"
            section_tasks.setdefault(sec, []).append(t)

        bundles: List[BundledPossessionBlock] = []
        all_departments: Set[str] = set()
        total_minutes_saved = 0

        # 2. Iterate through sections with multiple tasks
        for sec, t_list in section_tasks.items():
            if len(t_list) < 2:
                continue

            # Group complementary tasks across different departments
            by_dept: Dict[str, List[Any]] = {}
            for t in t_list:
                dept = _g(t, "department", "GEN")
                all_departments.add(dept)
                by_dept.setdefault(dept, []).append(t)

            # If multi-department tasks exist on this section
            if len(by_dept) > 1:
                # Select one task per department to form a synchronized bundle
                bundle_items: List[BundledTaskItem] = []
                selected_task_types: List[str] = []
                is_safe = True

                for dept, d_tasks in by_dept.items():
                    for t in d_tasks[:2]: # At most 2 per dept in a single window
                        t_type = _g(t, "task_type", "")
                        
                        # Check compatibility with already selected types in this bundle
                        conflict = False
                        for existing_type in selected_task_types:
                            if (t_type, existing_type) in self.incompatible_pairs or (existing_type, t_type) in self.incompatible_pairs:
                                conflict = True
                                break

                        if not conflict:
                            selected_task_types.append(t_type)
                            bundle_items.append(BundledTaskItem(
                                task_id=_g(t, "task_id", ""),
                                task_type=t_type,
                                department=dept,
                                description=_g(t, "description", ""),
                                estimated_duration_mins=_g(t, "estimated_duration_mins", 60),
                                priority_score=float(_g(t, "priority_score", 5.0) or 5.0),
                                is_emergency=bool(_g(t, "is_emergency", False))
                            ))

                if len(bundle_items) >= 2:
                    # Find matching opportunity
                    matched_opp = None
                    for o in opportunities:
                        if _g(o, "track_section_id") == sec:
                            matched_opp = o
                            break

                    now = datetime.now(timezone.utc)
                    start_time = _g(matched_opp, "window_start") if matched_opp else (now + timedelta(hours=2))
                    if isinstance(start_time, str):
                        start_time = datetime.fromisoformat(start_time.replace("Z", "+00:00"))

                    durations = [item.estimated_duration_mins for item in bundle_items]
                    sum_durations = sum(durations)
                    max_duration = max(durations)
                    saved = sum_durations - max_duration
                    total_minutes_saved += saved

                    end_time = start_time + timedelta(minutes=max_duration)
                    depts_in_bundle = list({item.department for item in bundle_items})

                    bundle_block = BundledPossessionBlock(
                        bundle_id=f"BND-{sec}-{uuid.uuid4().hex[:4].upper()}",
                        corridor_id=_g(bundle_items[0], "location_corridor_id", "COR-DEL-KNP"),
                        track_section_id=sec,
                        opportunity_id=_g(matched_opp, "opportunity_id") if matched_opp else None,
                        window_start=start_time,
                        window_end=end_time,
                        total_possession_duration_mins=max_duration,
                        participating_departments=depts_in_bundle,
                        bundled_tasks=bundle_items,
                        synergy_minutes_saved=saved,
                        train_delay_reduction_score=round(saved * 1.8, 1),
                        safety_validated=True
                    )
                    bundles.append(bundle_block)

        total_tasks_bundled = sum(len(b.bundled_tasks) for b in bundles)
        synergy_index = min(100.0, (total_tasks_bundled / max(1, len(tasks))) * 120.0) if tasks else 0.0
        avoided_delay = int(total_minutes_saved * 2.5)

        return BundlingSynergyReport(
            total_bundles_count=len(bundles),
            total_tasks_bundled=total_tasks_bundled,
            departments_involved=sorted(list(all_departments)),
            total_line_block_minutes_saved=total_minutes_saved,
            estimated_passenger_delay_minutes_avoided=avoided_delay,
            synergy_index=round(synergy_index, 1),
            bundles=bundles
        )


# Singleton instance
bundling_coordinator = BundlingCoordinator()
