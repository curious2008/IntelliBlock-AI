"""
FastAPI Endpoints for Task Bundling Engine
Phase 7 IntelliBlock AI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import MaintenanceTaskModel, BlockOpportunityModel
from app.schemas.bundling import BundlingSynergyReportResponse
from app.services.bundling.engine import bundling_coordinator

router = APIRouter()


@router.post("/coordinate-bundles", response_model=BundlingSynergyReportResponse)
def coordinate_cross_department_bundles(
    db: Session = Depends(get_db)
):
    """
    Analyzes active tasks across Civil (ENGG), Signal & Telecom (ST), and Electrical (TRD)
    to discover coordinated multi-department bundled possessions with quantified synergy gains.
    """
    tasks = db.query(MaintenanceTaskModel).all()
    opportunities = db.query(BlockOpportunityModel).all()

    report = bundling_coordinator.coordinate_bundles(tasks, opportunities)

    return report
