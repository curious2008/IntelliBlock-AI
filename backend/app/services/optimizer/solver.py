"""
Deterministic Constraint-Guided Heuristic Optimization Solver
Phase 6 IntelliBlock AI
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set, Tuple
import uuid

from app.services.constraints.evaluator import constraint_evaluator, ConstraintEvaluator
from app.services.constraints.models import ScheduledTaskAssignment
from app.services.optimizer.models import (
    OptimizedSchedulePlan, OptimizedTaskBlock, OptimizerConfig
)
from app.services.optimizer.objectives import compute_kpi_scorecard


def _get_v(obj: Any, key: str, default: Any = None) -> Any:
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


class BlockScheduleSolver:
    """Heuristic Optimization Solver that generates constraint-compliant multi-department block plans."""

    def __init__(self, evaluator: Optional[ConstraintEvaluator] = None):
        self.evaluator = evaluator or constraint_evaluator

    def solve(
        self,
        tasks: Dict[str, Any],
        opportunities: Dict[str, Any],
        resources: Dict[str, Any],
        trains: Dict[str, Any],
        track_sections: Dict[str, Any],
        config: Optional[OptimizerConfig] = None,
        scenario_type: str = "NORMAL"
    ) -> OptimizedSchedulePlan:
        config = config or OptimizerConfig()
        plan_id = f"PLAN-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:6].upper()}"

        # 1. Sort tasks by operational urgency (Emergency > Priority Score > Due Date)
        task_list = list(tasks.values())
        task_list.sort(
            key=lambda t: (
                1 if _get_v(t, "is_emergency") else 0,
                float(_get_v(t, "priority_score", 0.0) or 0.0),
                -_get_v(t, "estimated_duration_mins", 60)
            ),
            reverse=True
        )

        scheduled_blocks: List[OptimizedTaskBlock] = []
        assigned_constraints: List[ScheduledTaskAssignment] = []
        unscheduled_reasons: Dict[str, str] = {}

        # Track resource assignments to avoid conflicts
        resource_busy_windows: Dict[str, List[Tuple[datetime, datetime]]] = {
            r_id: [] for r_id in resources
        }

        # Spatial-temporal opportunity possession map: (opportunity_id) -> list of tasks scheduled
        opportunity_occupancy: Dict[str, List[OptimizedTaskBlock]] = {
            o_id: [] for o_id in opportunities
        }

        context = {
            "tasks": tasks,
            "resources": resources,
            "trains": trains,
            "opportunities": opportunities,
            "track_sections": track_sections,
        }

        # 2. Iterate and allocate tasks to feasible opportunities & resources
        for task in task_list:
            t_id = _get_v(task, "task_id")
            t_type = _get_v(task, "task_type")
            t_dept = _get_v(task, "department")
            t_sec = _get_v(task, "location_section_id")
            t_corridor = _get_v(task, "location_corridor_id")
            t_est_dur = _get_v(task, "estimated_duration_mins", 120)
            t_min_dur = _get_v(task, "minimum_duration_mins", 60)
            t_req_power = (t_dept == "TRD")

            # Candidate opportunities matching section or corridor
            candidate_opps = []
            for o_id, opp in opportunities.items():
                opp_sec = _get_v(opp, "track_section_id")
                opp_corridor = _get_v(opp, "corridor_id")
                if opp_sec == t_sec or opp_corridor == t_corridor:
                    candidate_opps.append(opp)

            if not candidate_opps:
                # Fallback: any available opportunity in horizon
                candidate_opps = list(opportunities.values())

            scheduled = False

            # Try candidate opportunities
            for opp in candidate_opps:
                o_id = _get_v(opp, "opportunity_id")
                opp_start = _get_v(opp, "window_start")
                opp_end = _get_v(opp, "window_end")

                if isinstance(opp_start, str):
                    opp_start = datetime.fromisoformat(opp_start.replace("Z", "+00:00"))
                if isinstance(opp_end, str):
                    opp_end = datetime.fromisoformat(opp_end.replace("Z", "+00:00"))

                if not opp_start or not opp_end:
                    continue

                opp_dur_mins = (opp_end - opp_start).total_seconds() / 60.0
                if opp_dur_mins < t_min_dur:
                    continue

                alloc_duration = min(t_est_dur, int(opp_dur_mins))
                task_start = opp_start
                task_end = task_start + timedelta(minutes=alloc_duration)

                # Check if existing tasks in this opportunity can be bundled
                existing_in_opp = opportunity_occupancy.get(o_id, [])
                is_bundle_candidate = len(existing_in_opp) > 0
                bundled_task_ids = [b.task_id for b in existing_in_opp]

                # Find available resources matching department
                candidate_res = [
                    r_id for r_id, r in resources.items()
                    if _get_v(r, "department") == t_dept
                ]

                # Select available resources without time overlap
                selected_resources = []
                for r_id in candidate_res:
                    busy_list = resource_busy_windows.get(r_id, [])
                    has_conflict = False
                    for b_start, b_end in busy_list:
                        if (task_start < b_end) and (task_end > b_start):
                            has_conflict = True
                            break
                    if not has_conflict:
                        selected_resources.append(r_id)
                        if len(selected_resources) >= 2:
                            break

                # Formulate candidate assignment
                candidate_assignment = ScheduledTaskAssignment(
                    task_id=t_id,
                    scheduled_start=task_start,
                    scheduled_end=task_end,
                    opportunity_id=o_id,
                    assigned_resource_ids=selected_resources,
                    track_section_id=t_sec,
                    corridor_id=t_corridor,
                    requires_power_block=t_req_power
                )

                # Test constraint feasibility with the new candidate addition
                test_schedule = assigned_constraints + [candidate_assignment]
                feasibility = self.evaluator.evaluate_schedule(test_schedule, context)

                if feasibility.is_feasible:
                    # Accept assignment
                    assigned_constraints.append(candidate_assignment)
                    for r_id in selected_resources:
                        resource_busy_windows[r_id].append((task_start, task_end))

                    block = OptimizedTaskBlock(
                        task_id=t_id,
                        task_type=t_type,
                        department=t_dept,
                        corridor_id=t_corridor or "",
                        track_section_id=t_sec or "",
                        scheduled_start=task_start,
                        scheduled_end=task_end,
                        duration_minutes=alloc_duration,
                        opportunity_id=o_id,
                        assigned_resource_ids=selected_resources,
                        predicted_duration_mins=alloc_duration,
                        overrun_probability=0.25 if t_dept != "ENGG" else 0.35,
                        overrun_risk_level="MEDIUM",
                        is_bundled=is_bundle_candidate,
                        bundled_with_task_ids=bundled_task_ids
                    )
                    scheduled_blocks.append(block)
                    opportunity_occupancy[o_id].append(block)

                    # Update bundle pointers for already scheduled items in same block
                    for prev_b in existing_in_opp:
                        prev_b.is_bundled = True
                        if t_id not in prev_b.bundled_with_task_ids:
                            prev_b.bundled_with_task_ids.append(t_id)

                    scheduled = True
                    break

            if not scheduled:
                unscheduled_reasons[t_id] = "No feasible constraint-compliant block window or matching resource available."

        # 3. Compute KPI Scorecard
        kpi = compute_kpi_scorecard(scheduled_blocks, tasks, resources, config)
        unscheduled_ids = list(unscheduled_reasons.keys())

        summary = (
            f"Optimization generated {len(scheduled_blocks)} scheduled block possession(s) "
            f"({kpi.scheduled_percentage:.1f}% throughput, Overall KPI Score: {kpi.overall_score:.1f}/100). "
            f"{kpi.cross_dept_bundled_tasks_count} tasks bundled across departments. "
            f"{len(unscheduled_ids)} unscheduled task(s)."
        )

        return OptimizedSchedulePlan(
            plan_id=plan_id,
            generated_at=datetime.now(timezone.utc),
            scenario_type=scenario_type,
            is_feasible=True,
            kpi_scorecard=kpi,
            blocks=scheduled_blocks,
            unscheduled_task_ids=unscheduled_ids,
            unscheduled_reasons=unscheduled_reasons,
            summary=summary
        )


# Singleton instance
block_schedule_solver = BlockScheduleSolver()
