"""
FastAPI Endpoints for Optimization Engine & Adaptive Planning Horizon
Phase 6 & 9 IntelliBlock AI
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.optimizer import (
    GeneratePlanRequest, OptimizedSchedulePlanResponse
)
from app.schemas.decision_support import (
    PlanningHorizonMonthlyResponse, PlanningHorizonWeeklyResponse
)
from app.services.optimizer.models import OptimizerConfig
from app.services.optimizer.service import optimizer_service
from app.services.optimizer.planning_horizon import planning_horizon_engine

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


@router.get("/planning-horizon/monthly", response_model=PlanningHorizonMonthlyResponse)
def get_monthly_planning_horizon(
    month_key: Optional[str] = Query(None, description="Month key in YYYY-MM format"),
    scenario_type: Optional[str] = Query("NORMAL", description="Active scenario type"),
    db: Session = Depends(get_db)
):
    """
    Retrieves the monthly macro-planning horizon with departmental workload breakdown,
    major renewal programs, and 4-week capacity allocations.
    """
    return planning_horizon_engine.get_monthly_plan(
        db=db,
        month_key=month_key,
        scenario_type=scenario_type or "NORMAL"
    )


@router.get("/planning-horizon/weekly", response_model=PlanningHorizonWeeklyResponse)
def get_weekly_planning_horizon(
    week_number: int = Query(1, ge=1, le=4, description="Target week number (1-4)"),
    month_key: Optional[str] = Query(None, description="Month key in YYYY-MM format"),
    scenario_type: Optional[str] = Query("NORMAL", description="Active scenario type"),
    db: Session = Depends(get_db)
):
    """
    Retrieves the 7-day weekly planning horizon with planned possessions,
    available opportunities, and daily schedule allocations.
    """
    return planning_horizon_engine.get_weekly_plan(
        db=db,
        week_number=week_number,
        month_key=month_key,
        scenario_type=scenario_type or "NORMAL"
    )
