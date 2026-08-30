"""
Multi-Objective Evaluation Function & KPI Calculator
Phase 6 IntelliBlock AI
"""
from typing import Any, Dict, List
from app.services.optimizer.models import (
    OptimizedTaskBlock, PlanKPIScorecard, OptimizerConfig
)


def compute_kpi_scorecard(
    blocks: List[OptimizedTaskBlock],
    all_tasks: Dict[str, Any],
    all_resources: Dict[str, Any],
    config: OptimizerConfig
) -> PlanKPIScorecard:
    total_requested = len(all_tasks)
    scheduled_count = len(blocks)
    
    if total_requested == 0:
        return PlanKPIScorecard(
            overall_score=100.0,
            tasks_scheduled_count=0,
            total_requested_tasks=0,
            scheduled_percentage=100.0,
            urgent_tasks_scheduled_percentage=100.0,
            cross_dept_bundled_tasks_count=0,
            bundling_efficiency_score=100.0,
            total_block_hours_utilized=0.0,
            train_punctuality_impact_score=0.0,
            avg_overrun_risk_probability=0.0,
            resource_utilization_percentage=0.0
        )

    scheduled_pct = (scheduled_count / total_requested) * 100.0

    # Urgent / Emergency task breakdown
    urgent_tasks = [t for t in all_tasks.values() if (getattr(t, "priority_score", 0) or (t.get("priority_score", 0) if isinstance(t, dict) else 0)) >= 8.0 or (getattr(t, "is_emergency", False) or (t.get("is_emergency", False) if isinstance(t, dict) else False))]
    scheduled_task_ids = {b.task_id for b in blocks}
    scheduled_urgent_count = sum(1 for t in urgent_tasks if (getattr(t, "task_id", None) or (t.get("task_id") if isinstance(t, dict) else None)) in scheduled_task_ids)
    urgent_pct = (scheduled_urgent_count / max(1, len(urgent_tasks))) * 100.0

    # Bundling metrics
    bundled_blocks = [b for b in blocks if b.is_bundled]
    bundled_count = len(bundled_blocks)
    bundling_score = min(100.0, (bundled_count / max(1, scheduled_count)) * 150.0)

    # Block hours
    total_duration_mins = sum(b.duration_minutes for b in blocks)
    total_block_hours = round(total_duration_mins / 60.0, 2)

    # Overrun risk exposure
    overrun_probs = [b.overrun_probability for b in blocks if b.overrun_probability is not None]
    avg_overrun_prob = sum(overrun_probs) / max(1, len(overrun_probs)) if overrun_probs else 0.25

    # Resource utilization
    used_resources = set()
    for b in blocks:
        for r_id in b.assigned_resource_ids:
            used_resources.add(r_id)
    resource_pct = (len(used_resources) / max(1, len(all_resources))) * 100.0

    # Weighted Overall Objective Score (0 - 100 scale)
    # Objective = + Throughput + UrgentCompletion + Bundling - OverrunRiskPenalty
    throughput_subscore = (scheduled_pct * 0.35)
    urgent_subscore = (urgent_pct * 0.30)
    bundling_subscore = (bundling_score * 0.20)
    risk_penalty = (avg_overrun_prob * 100.0 * 0.15)
    resource_subscore = (resource_pct * 0.15)

    overall = max(0.0, min(100.0, throughput_subscore + urgent_subscore + bundling_subscore + resource_subscore - risk_penalty))

    return PlanKPIScorecard(
        overall_score=round(overall, 1),
        tasks_scheduled_count=scheduled_count,
        total_requested_tasks=total_requested,
        scheduled_percentage=round(scheduled_pct, 1),
        urgent_tasks_scheduled_percentage=round(urgent_pct, 1),
        cross_dept_bundled_tasks_count=bundled_count,
        bundling_efficiency_score=round(bundling_score, 1),
        total_block_hours_utilized=total_block_hours,
        train_punctuality_impact_score=round(risk_penalty, 2),
        avg_overrun_risk_probability=round(avg_overrun_prob, 3),
        resource_utilization_percentage=round(resource_pct, 1)
    )
