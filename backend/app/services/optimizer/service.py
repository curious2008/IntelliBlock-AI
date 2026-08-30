"""
Optimization Orchestrator Service
Phase 6 IntelliBlock AI
"""
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.domain import (
    MaintenanceTaskModel, BlockOpportunityModel, ResourceModel,
    TrainMovementModel, TrackSectionModel, CorridorModel
)
from app.services.optimizer.models import (
    OptimizedSchedulePlan, OptimizerConfig
)
from app.services.optimizer.solver import block_schedule_solver, BlockScheduleSolver


class OptimizerService:
    """Orchestrator pulling database context, running optimization, and computing KPIs."""

    def __init__(self, solver: Optional[BlockScheduleSolver] = None):
        self.solver = solver or block_schedule_solver

    def generate_plan_from_db(
        self,
        db: Session,
        config: Optional[OptimizerConfig] = None,
        scenario_type: str = "NORMAL"
    ) -> OptimizedSchedulePlan:
        # 1. Fetch domain context from database
        tasks = {t.task_id: t for t in db.query(MaintenanceTaskModel).all()}
        opportunities = {o.opportunity_id: o for o in db.query(BlockOpportunityModel).all()}
        resources = {r.resource_id: r for r in db.query(ResourceModel).all()}
        trains = {t.train_id: t for t in db.query(TrainMovementModel).all()}
        track_sections = {s.section_id: s for s in db.query(TrackSectionModel).all()}

        # 2. Run solver
        plan = self.solver.solve(
            tasks=tasks,
            opportunities=opportunities,
            resources=resources,
            trains=trains,
            track_sections=track_sections,
            config=config,
            scenario_type=scenario_type
        )

        return plan


# Singleton instance
optimizer_service = OptimizerService()
