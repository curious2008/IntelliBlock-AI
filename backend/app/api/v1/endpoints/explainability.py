"""
FastAPI Endpoints for Decision Rationale & Explainability
Phase 9 IntelliBlock AI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import MaintenanceTaskModel, BlockOpportunityModel
from app.schemas.explainability import (
    BlockRationaleResponse, PlanExplanationReportResponse
)
from app.services.explainability.engine import explainability_engine
from app.services.optimizer.service import optimizer_service

router = APIRouter()


@router.post("/explain-active-plan", response_model=PlanExplanationReportResponse)
def explain_active_plan(
    scenario_type: str = "NORMAL",
    db: Session = Depends(get_db)
):
    """
    Generates a full natural-language explainability report and decision reasoning tree
    for the active optimized block schedule.
    """
    tasks = {t.task_id: t for t in db.query(MaintenanceTaskModel).all()}
    opportunities = {o.opportunity_id: o for o in db.query(BlockOpportunityModel).all()}

    plan = optimizer_service.generate_plan_from_db(db, scenario_type=scenario_type)
    explanation = explainability_engine.explain_plan(plan, tasks, opportunities)

    return explanation
