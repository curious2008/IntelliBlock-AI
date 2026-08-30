"""
Automated Test Suite for Explainability & Decision Support — Phase 9 IntelliBlock AI
"""
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.explainability.engine import explainability_engine, ExplainabilityEngine
from app.services.optimizer.solver import block_schedule_solver


@pytest.fixture
def plan_for_explanation():
    now = datetime(2026, 8, 31, 2, 0, tzinfo=timezone.utc)
    tasks = {
        "TSK-EXP-01": {
            "task_id": "TSK-EXP-01",
            "task_type": "TRACK_TAMPING",
            "department": "ENGG",
            "priority_score": 9.2,
            "estimated_duration_mins": 120,
            "minimum_duration_mins": 60,
            "location_section_id": "SEC-01",
            "location_corridor_id": "COR-01",
            "prerequisite_task_ids": []
        }
    }
    opportunities = {
        "OPP-01": {
            "opportunity_id": "OPP-01",
            "corridor_id": "COR-01",
            "track_section_id": "SEC-01",
            "window_start": now,
            "window_end": now + (datetime.fromtimestamp(14400, timezone.utc) - datetime.fromtimestamp(0, timezone.utc)),
            "is_power_block_available": True
        }
    }
    resources = {
        "RES-01": {"resource_id": "RES-01", "department": "ENGG", "capability": "TAMPING"}
    }
    trains = {}
    sections = {"SEC-01": {"section_id": "SEC-01"}}

    plan = block_schedule_solver.solve(tasks, opportunities, resources, trains, sections)
    return plan, tasks, opportunities


class TestExplainabilityUnit:
    def test_explain_plan_generates_comprehensive_report(self, plan_for_explanation):
        plan, tasks, opps = plan_for_explanation
        engine = ExplainabilityEngine()
        report = engine.explain_plan(plan, tasks, opps)

        assert report.plan_id == plan.plan_id
        assert len(report.executive_summary) > 20
        assert len(report.top_decision_priorities) >= 3
        assert len(report.block_rationales) == len(plan.blocks)
        
        first_rationale = report.block_rationales[0]
        assert first_rationale.task_id == "TSK-EXP-01"
        assert len(first_rationale.decision_factors) >= 2
        assert len(first_rationale.rejected_alternatives) >= 1
        assert "Advisory" in first_rationale.human_controller_advisory


class TestExplainabilityAPIEndpoints:
    def test_explain_active_plan_endpoint(self):
        with TestClient(app) as client:
            res = client.post("/api/v1/explainability/explain-active-plan")
            assert res.status_code == 200
            data = res.json()
            assert "plan_id" in data
            assert "executive_summary" in data
            assert "block_rationales" in data
            assert len(data["block_rationales"]) > 0
            assert "decision_factors" in data["block_rationales"][0]
            assert "rejected_alternatives" in data["block_rationales"][0]
