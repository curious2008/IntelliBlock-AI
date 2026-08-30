"""
FastAPI Endpoints for Optimization Engine
Phase 6 IntelliBlock AI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.optimizer import (
    GeneratePlanRequest, OptimizedSchedulePlanResponse
)
from app.services.optimizer.models import OptimizerConfig
from app.services.optimizer.service import optimizer_service

router = APIRouter()


@router.post("/generate-plan", response_model=OptimizedSchedulePlanResponse)
def generate_optimized_plan(
    request: GeneratePlanRequest = GeneratePlanRequest(),
    db: Session = Depends(get_db)
):
    """
    Generates a constraint-compliant multi-department optimized block maintenance plan
    for the active operational scenario.
    """
    opt_config = None
    if request.config:
        opt_config = OptimizerConfig(
            priority_weight=request.config.priority_weight,
            train_punctuality_weight=request.config.train_punctuality_weight,
            overrun_risk_penalty=request.config.overrun_risk_penalty,
            bundling_bonus_weight=request.config.bundling_bonus_weight,
            resource_efficiency_weight=request.config.resource_efficiency_weight
        )

    plan = optimizer_service.generate_plan_from_db(
        db=db,
        config=opt_config,
        scenario_type=request.scenario_type or "NORMAL"
    )

    return plan
