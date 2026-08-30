"""
FastAPI Endpoints for Dynamic Replanning & What-If Simulation
Phase 8 IntelliBlock AI
"""
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import (
    MaintenanceTaskModel, BlockOpportunityModel, ResourceModel,
    TrainMovementModel, TrackSectionModel
)
from app.schemas.replanning import (
    DynamicReplanRequest, ReplanDiffResponse,
    WhatIfSimulateRequest, WhatIfSimulationResultResponse
)
from app.services.replanning.models import DisruptionEvent, DisruptionType
from app.services.replanning.engine import dynamic_replanner
from app.services.replanning.simulator import what_if_simulator
from app.services.optimizer.service import optimizer_service

router = APIRouter()


@router.post("/dynamic-replan", response_model=ReplanDiffResponse)
def execute_dynamic_replan(
    request: DynamicReplanRequest,
    db: Session = Depends(get_db)
):
    """
    Executes dynamic rolling-horizon replanning in response to operational disturbances.
    """
    # 1. Fetch domain context
    tasks = {t.task_id: t for t in db.query(MaintenanceTaskModel).all()}
    opportunities = {o.opportunity_id: o for o in db.query(BlockOpportunityModel).all()}
    resources = {r.resource_id: r for r in db.query(ResourceModel).all()}
    trains = {t.train_id: t for t in db.query(TrainMovementModel).all()}
    sections = {s.section_id: s for s in db.query(TrackSectionModel).all()}

    # 2. Get active baseline plan
    current_plan = optimizer_service.generate_plan_from_db(db, scenario_type=request.scenario_type or "NORMAL")

    # 3. Convert schemas to domain disruption events
    disruptions = [
        DisruptionEvent(
            event_id=d.event_id or f"EVT-{uuid.uuid4().hex[:4].upper()}",
            disruption_type=DisruptionType(d.disruption_type),
            target_id=d.target_id,
            magnitude_minutes=d.magnitude_minutes,
            occurred_at=d.occurred_at or datetime.now(timezone.utc),
            notes=d.notes
        )
        for d in request.disruptions
    ]

    # 4. Run replanner
    diff = dynamic_replanner.replan(
        current_plan=current_plan,
        disruptions=disruptions,
        all_tasks=tasks,
        opportunities=opportunities,
        resources=resources,
        trains=trains,
        track_sections=sections
    )

    return diff


@router.post("/simulate-whatif", response_model=WhatIfSimulationResultResponse)
def simulate_whatif(
    request: WhatIfSimulateRequest,
    db: Session = Depends(get_db)
):
    """
    Simulates a hypothetical operational disruption, showing ripple cascade vs AI dynamic mitigation.
    """
    tasks = {t.task_id: t for t in db.query(MaintenanceTaskModel).all()}
    opportunities = {o.opportunity_id: o for o in db.query(BlockOpportunityModel).all()}
    resources = {r.resource_id: r for r in db.query(ResourceModel).all()}
    trains = {t.train_id: t for t in db.query(TrainMovementModel).all()}
    sections = {s.section_id: s for s in db.query(TrackSectionModel).all()}

    current_plan = optimizer_service.generate_plan_from_db(db, scenario_type=request.scenario_type or "NORMAL")

    d = request.disruption
    disruption = DisruptionEvent(
        event_id=d.event_id or f"EVT-{uuid.uuid4().hex[:4].upper()}",
        disruption_type=DisruptionType(d.disruption_type),
        target_id=d.target_id,
        magnitude_minutes=d.magnitude_minutes,
        occurred_at=d.occurred_at or datetime.now(timezone.utc),
        notes=d.notes
    )

    result = what_if_simulator.simulate(
        current_plan=current_plan,
        disruption=disruption,
        all_tasks=tasks,
        opportunities=opportunities,
        resources=resources,
        trains=trains,
        track_sections=sections
    )

    return result
