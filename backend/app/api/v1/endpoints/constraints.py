"""
FastAPI Endpoints for Railway Constraint Engine
Phase 5 IntelliBlock AI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import (
    MaintenanceTaskModel, ResourceModel, TrainMovementModel,
    BlockOpportunityModel, TrackSectionModel
)
from app.schemas.constraints import (
    ValidateScheduleRequest, FeasibilityReportSchema, RuleListResponse
)
from app.services.constraints.evaluator import constraint_evaluator
from app.services.constraints.models import ScheduledTaskAssignment
from app.services.constraints.registry import constraint_registry

router = APIRouter()


@router.post("/validate-schedule", response_model=FeasibilityReportSchema)
def validate_schedule(
    request: ValidateScheduleRequest,
    db: Session = Depends(get_db)
):
    """
    Validates candidate schedule assignments against all active hard and soft domain constraints.
    Pulls operational context directly from active environment database entities.
    """
    # 1. Fetch domain context from DB
    tasks = {t.task_id: t for t in db.query(MaintenanceTaskModel).all()}
    resources = {r.resource_id: r for r in db.query(ResourceModel).all()}
    trains = {t.train_id: t for t in db.query(TrainMovementModel).all()}
    opportunities = {o.opportunity_id: o for o in db.query(BlockOpportunityModel).all()}
    sections = {s.section_id: s for s in db.query(TrackSectionModel).all()}

    context = {
        "tasks": tasks,
        "resources": resources,
        "trains": trains,
        "opportunities": opportunities,
        "track_sections": sections,
    }

    # 2. Convert schemas to domain assignments
    assignments = [
        ScheduledTaskAssignment(
            task_id=a.task_id,
            scheduled_start=a.scheduled_start,
            scheduled_end=a.scheduled_end,
            opportunity_id=a.opportunity_id,
            assigned_resource_ids=a.assigned_resource_ids,
            track_section_id=a.track_section_id,
            corridor_id=a.corridor_id,
            requires_power_block=a.requires_power_block
        )
        for a in request.assignments
    ]

    # 3. Evaluate with constraint engine
    report = constraint_evaluator.evaluate_schedule(assignments, context)

    # 4. Serialize report to response schema
    return FeasibilityReportSchema(
        is_feasible=report.is_feasible,
        hard_violations_count=report.hard_violations_count,
        soft_violations_count=report.soft_violations_count,
        warnings_count=report.warnings_count,
        evaluated_rules_count=report.evaluated_rules_count,
        summary=report.summary,
        violations=[
            {
                "constraint_id": v.constraint_id,
                "constraint_type": v.constraint_type.value,
                "severity": v.severity.value,
                "message": v.message,
                "affected_entity_ids": v.affected_entity_ids,
                "details": v.details
            }
            for v in report.violations
        ],
        results=[
            {
                "rule_id": r.rule_id,
                "rule_name": r.rule_name,
                "severity": r.severity.value,
                "passed": r.passed,
                "violations": [
                    {
                        "constraint_id": v.constraint_id,
                        "constraint_type": v.constraint_type.value,
                        "severity": v.severity.value,
                        "message": v.message,
                        "affected_entity_ids": v.affected_entity_ids,
                        "details": v.details
                    }
                    for v in r.violations
                ]
            }
            for r in report.results
        ]
    )


@router.get("/rules", response_model=RuleListResponse)
def get_constraint_rules():
    """Returns the list of active deterministic domain constraint rules and their severity levels."""
    rules = constraint_registry.list_rules_metadata()
    return RuleListResponse(
        rules=rules,
        total_count=len(rules)
    )
