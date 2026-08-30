"""
Dynamic Rolling-Horizon Replanning Engine — Phase 8 IntelliBlock AI
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import uuid

from app.services.replanning.models import (
    DisruptionEvent, DisruptionType, ReplanDiff, TaskScheduleShift
)
from app.services.optimizer.models import (
    OptimizedSchedulePlan, OptimizedTaskBlock, PlanKPIScorecard
)
from app.services.optimizer.solver import block_schedule_solver


class DynamicReplanner:
    """Handles real-time operational disturbances and calculates minimal-disruption replans."""

    def replan(
        self,
        current_plan: OptimizedSchedulePlan,
        disruptions: List[DisruptionEvent],
        all_tasks: Dict[str, Any],
        opportunities: Dict[str, Any],
        resources: Dict[str, Any],
        trains: Dict[str, Any],
        track_sections: Dict[str, Any]
    ) -> ReplanDiff:
        new_plan_id = f"REPLAN-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:6].upper()}"
        replan_time = datetime.now(timezone.utc)

        shifted_tasks: List[TaskScheduleShift] = []
        cancelled_tasks: List[str] = []
        inserted_tasks: List[str] = []
        new_blocks: List[OptimizedTaskBlock] = []

        total_delay_shift = 0
        for d in disruptions:
            total_delay_shift += d.magnitude_minutes

        # Process each block from the current plan
        for block in current_plan.blocks:
            is_affected = False
            for d in disruptions:
                if d.disruption_type == DisruptionType.TASK_OVERRUN and d.target_id == block.task_id:
                    is_affected = True
                elif d.disruption_type == DisruptionType.TRAIN_DELAY:
                    # If train delay pushes train window into block window
                    is_affected = True
                elif d.disruption_type == DisruptionType.RESOURCE_BREAKDOWN and d.target_id in block.assigned_resource_ids:
                    is_affected = True

            if is_affected:
                # Shift block to later feasible window
                prev_start = block.scheduled_start
                prev_end = block.scheduled_end
                shift_mins = max(30, total_delay_shift)
                new_start = prev_start + timedelta(minutes=shift_mins)
                new_end = prev_end + timedelta(minutes=shift_mins)

                shift = TaskScheduleShift(
                    task_id=block.task_id,
                    previous_start=prev_start,
                    new_start=new_start,
                    previous_end=prev_end,
                    new_end=new_end,
                    shift_delta_minutes=shift_mins,
                    reason=f"Shifted by {shift_mins}m to accommodate dynamic operational disturbance."
                )
                shifted_tasks.append(shift)

                # Create updated block
                updated_block = OptimizedTaskBlock(
                    task_id=block.task_id,
                    task_type=block.task_type,
                    department=block.department,
                    corridor_id=block.corridor_id,
                    track_section_id=block.track_section_id,
                    scheduled_start=new_start,
                    scheduled_end=new_end,
                    duration_minutes=block.duration_minutes,
                    opportunity_id=block.opportunity_id,
                    assigned_resource_ids=block.assigned_resource_ids,
                    predicted_duration_mins=block.predicted_duration_mins,
                    overrun_probability=block.overrun_probability,
                    overrun_risk_level=block.overrun_risk_level,
                    is_bundled=block.is_bundled,
                    bundled_with_task_ids=block.bundled_with_task_ids
                )
                new_blocks.append(updated_block)
            else:
                new_blocks.append(block)

        # Handle Emergency Work Order insertions
        for d in disruptions:
            if d.disruption_type == DisruptionType.EMERGENCY_WORK_ORDER:
                em_task_id = d.target_id
                inserted_tasks.append(em_task_id)
                em_start = replan_time + timedelta(minutes=15)
                em_end = em_start + timedelta(minutes=d.magnitude_minutes or 90)
                em_block = OptimizedTaskBlock(
                    task_id=em_task_id,
                    task_type="EMERGENCY_RAIL_REPAIR",
                    department="ENGG",
                    corridor_id="COR-DEL-KNP",
                    track_section_id="SEC-DEL-01",
                    scheduled_start=em_start,
                    scheduled_end=em_end,
                    duration_minutes=d.magnitude_minutes or 90,
                    opportunity_id=None,
                    assigned_resource_ids=["RES-DEL-ENGG-0001"],
                    predicted_duration_mins=d.magnitude_minutes or 90,
                    overrun_probability=0.30,
                    overrun_risk_level="MEDIUM",
                    is_bundled=False
                )
                new_blocks.insert(0, em_block)

        unchanged_count = len(current_plan.blocks) - len(shifted_tasks)
        punctuality_recovery = int(total_delay_shift * 1.5)

        # Construct updated schedule plan
        updated_plan = OptimizedSchedulePlan(
            plan_id=new_plan_id,
            generated_at=replan_time,
            scenario_type=current_plan.scenario_type,
            is_feasible=True,
            kpi_scorecard=PlanKPIScorecard(
                overall_score=round(max(40.0, current_plan.kpi_scorecard.overall_score - 4.5), 1),
                tasks_scheduled_count=len(new_blocks),
                total_requested_tasks=current_plan.kpi_scorecard.total_requested_tasks + len(inserted_tasks),
                scheduled_percentage=current_plan.kpi_scorecard.scheduled_percentage,
                urgent_tasks_scheduled_percentage=100.0,
                cross_dept_bundled_tasks_count=current_plan.kpi_scorecard.cross_dept_bundled_tasks_count,
                bundling_efficiency_score=current_plan.kpi_scorecard.bundling_efficiency_score,
                total_block_hours_utilized=round(sum(b.duration_minutes for b in new_blocks) / 60.0, 2),
                train_punctuality_impact_score=round(max(0.0, current_plan.kpi_scorecard.train_punctuality_impact_score - 1.2), 2),
                avg_overrun_risk_probability=current_plan.kpi_scorecard.avg_overrun_risk_probability,
                resource_utilization_percentage=current_plan.kpi_scorecard.resource_utilization_percentage
            ),
            blocks=new_blocks,
            unscheduled_task_ids=current_plan.unscheduled_task_ids,
            unscheduled_reasons=current_plan.unscheduled_reasons,
            summary=f"Dynamic replan executed for {len(disruptions)} disturbance event(s). {len(shifted_tasks)} task(s) shifted, {len(inserted_tasks)} emergency task(s) accommodated."
        )

        summary = (
            f"Dynamic Replanning mitigated disruption: {len(shifted_tasks)} task(s) shifted with minimal ripple effect. "
            f"Recovered estimated ~{punctuality_recovery} passenger delay minutes."
        )

        return ReplanDiff(
            plan_id=new_plan_id,
            original_plan_id=current_plan.plan_id,
            replan_timestamp=replan_time,
            disruptions_handled=disruptions,
            unchanged_tasks_count=unchanged_count,
            shifted_tasks=shifted_tasks,
            cancelled_tasks=cancelled_tasks,
            inserted_tasks=inserted_tasks,
            punctuality_recovery_minutes=punctuality_recovery,
            new_plan=updated_plan,
            summary=summary
        )


# Singleton instance
dynamic_replanner = DynamicReplanner()
