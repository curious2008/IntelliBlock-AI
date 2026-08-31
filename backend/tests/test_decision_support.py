"""
Unit and API Integration Tests for Decision Support Engine
"""
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.services.replanning.models import DisruptionEvent, DisruptionType
from app.services.replanning.decision_support import decision_support_engine
from app.services.optimizer.service import optimizer_service
from app.models.domain import (
    MaintenanceTaskModel, BlockOpportunityModel, ResourceModel,
    TrainMovementModel, TrackSectionModel
)


class TestDecisionSupportUnit:
    """Test Decision Support Engine alternatives, constraints and ranking."""

    def test_decision_support_generates_three_ranked_alternatives(self):
        db = SessionLocal()
        try:
            tasks = {t.task_id: t for t in db.query(MaintenanceTaskModel).all()}
            opportunities = {o.opportunity_id: o for o in db.query(BlockOpportunityModel).all()}
            resources = {r.resource_id: r for r in db.query(ResourceModel).all()}
            trains = {t.train_id: t for t in db.query(TrainMovementModel).all()}
            sections = {s.section_id: s for s in db.query(TrackSectionModel).all()}

            current_plan = optimizer_service.generate_plan_from_db(db, scenario_type="NORMAL")

            disruption = DisruptionEvent(
                event_id="TEST-EVT-01",
                disruption_type=DisruptionType.TRAIN_DELAY,
                target_id="12001",
                magnitude_minutes=45,
                occurred_at=datetime.now(timezone.utc)
            )

            response = decision_support_engine.analyze_and_recommend(
                disruption=disruption,
                current_plan=current_plan,
                all_tasks=tasks,
                opportunities=opportunities,
                resources=resources,
                trains=trains,
                track_sections=sections,
                scenario_type="NORMAL"
            )

            assert response.analysis_id.startswith("DSA-")
            assert response.is_dangerous_situation is True
            assert len(response.alternatives) == 3
            assert response.is_safe_option_available is True
            assert response.recommended_option_id is not None
            assert len(response.why_recommended_rationale) > 0
            assert response.human_approval_required is True

            strategies = [a.strategy_type for a in response.alternatives]
            assert "DYNAMIC_WINDOW_SHIFT" in strategies
            assert "ROUTINE_TASK_DEFERRAL" in strategies
            assert "POSSESSION_SEGMENTATION" in strategies
        finally:
            db.close()

    def test_decision_support_impossible_disruption_returns_critical_risk(self):
        db = SessionLocal()
        try:
            tasks = {t.task_id: t for t in db.query(MaintenanceTaskModel).all()}
            opportunities = {o.opportunity_id: o for o in db.query(BlockOpportunityModel).all()}
            resources = {r.resource_id: r for r in db.query(ResourceModel).all()}
            trains = {t.train_id: t for t in db.query(TrainMovementModel).all()}
            sections = {s.section_id: s for s in db.query(TrackSectionModel).all()}

            current_plan = optimizer_service.generate_plan_from_db(db, scenario_type="NORMAL")

            disruption = DisruptionEvent(
                event_id="TEST-EVT-UNSAFE",
                disruption_type=DisruptionType.TRAIN_DELAY,
                target_id="12001",
                magnitude_minutes=300,
                occurred_at=datetime.now(timezone.utc)
            )

            response = decision_support_engine.analyze_and_recommend(
                disruption=disruption,
                current_plan=current_plan,
                all_tasks=tasks,
                opportunities=opportunities,
                resources=resources,
                trains=trains,
                track_sections=sections,
                scenario_type="NORMAL"
            )

            assert response.analysis_id.startswith("DSA-")
            assert response.risk_level == "CRITICAL"
        finally:
            db.close()


class TestDecisionSupportAPI:
    """Test FastAPI endpoint for Decision Support."""

    def test_decision_support_api_endpoint(self):
        with TestClient(app) as client:
            payload = {
                "disruption": {
                    "disruption_type": "TRAIN_DELAY",
                    "target_id": "12001",
                    "magnitude_minutes": 45,
                    "notes": "Test disruption"
                },
                "scenario_type": "NORMAL"
            }
            res = client.post("/api/v1/replanning/decision-support", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert "analysis_id" in data
            assert "alternatives" in data
            assert len(data["alternatives"]) == 3
            assert "recommended_action_title" in data
            assert data["human_approval_required"] is True
