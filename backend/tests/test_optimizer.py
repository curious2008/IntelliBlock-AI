"""
Automated Test Suite for Optimization Engine — Phase 6 IntelliBlock AI

Validates multi-objective solver, KPI scorecard computation, cross-department bundling,
and API plan generation.
"""
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.optimizer.solver import block_schedule_solver, BlockScheduleSolver
from app.services.optimizer.models import OptimizerConfig, OptimizedTaskBlock
from app.services.optimizer.objectives import compute_kpi_scorecard


@pytest.fixture
def mock_optimizer_data():
    now = datetime(2026, 8, 31, 2, 0, tzinfo=timezone.utc)
    tasks = {
        "TSK-OPT-01": {
            "task_id": "TSK-OPT-01",
            "task_type": "TRACK_TAMPING",
            "department": "ENGG",
            "priority_score": 9.0,
            "is_emergency": True,
            "estimated_duration_mins": 120,
            "minimum_duration_mins": 60,
            "location_section_id": "SEC-01",
            "location_corridor_id": "COR-01",
            "prerequisite_task_ids": []
        },
        "TSK-OPT-02": {
            "task_id": "TSK-OPT-02",
            "task_type": "POINT_MACHINE_OVERHAUL",
            "department": "ST",
            "priority_score": 6.5,
            "is_emergency": False,
            "estimated_duration_mins": 90,
            "minimum_duration_mins": 45,
            "location_section_id": "SEC-02",
            "location_corridor_id": "COR-01",
            "prerequisite_task_ids": []
        },
        "TSK-OPT-03": {
            "task_id": "TSK-OPT-03",
            "task_type": "OHE_INSPECTION",
            "department": "TRD",
            "priority_score": 7.0,
            "is_emergency": False,
            "estimated_duration_mins": 90,
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
            "window_end": now + timedelta(hours=4),
            "is_power_block_available": True
        },
        "OPP-02": {
            "opportunity_id": "OPP-02",
            "corridor_id": "COR-01",
            "track_section_id": "SEC-02",
            "window_start": now + timedelta(hours=1),
            "window_end": now + timedelta(hours=5),
            "is_power_block_available": True
        }
    }
    resources = {
        "RES-E1": {"resource_id": "RES-E1", "department": "ENGG", "capability": "TAMPING"},
        "RES-S1": {"resource_id": "RES-S1", "department": "ST", "capability": "POINT_MACHINE"},
        "RES-T1": {"resource_id": "RES-T1", "department": "TRD", "capability": "TOWER_WAGON"},
    }
    trains = {}
    sections = {
        "SEC-01": {"section_id": "SEC-01"},
        "SEC-02": {"section_id": "SEC-02"},
    }
    return tasks, opportunities, resources, trains, sections


class TestOptimizerUnit:
    def test_solver_produces_feasible_plan(self, mock_optimizer_data):
        tasks, opps, res, trains, sections = mock_optimizer_data
        solver = BlockScheduleSolver()
        plan = solver.solve(tasks, opps, res, trains, sections)

        assert plan.is_feasible is True
        assert len(plan.blocks) > 0
        assert plan.kpi_scorecard.overall_score >= 50.0
        assert plan.kpi_scorecard.urgent_tasks_scheduled_percentage == 100.0

    def test_kpi_calculator_metrics(self, mock_optimizer_data):
        tasks, opps, res, trains, sections = mock_optimizer_data
        now = datetime(2026, 8, 31, 2, 0, tzinfo=timezone.utc)
        blocks = [
            OptimizedTaskBlock(
                task_id="TSK-OPT-01",
                task_type="TRACK_TAMPING",
                department="ENGG",
                corridor_id="COR-01",
                track_section_id="SEC-01",
                scheduled_start=now,
                scheduled_end=now + timedelta(hours=2),
                duration_minutes=120,
                opportunity_id="OPP-01",
                assigned_resource_ids=["RES-E1"],
                overrun_probability=0.20,
                is_bundled=False
            )
        ]
        kpi = compute_kpi_scorecard(blocks, tasks, res, OptimizerConfig())
        assert kpi.tasks_scheduled_count == 1
        assert kpi.total_requested_tasks == 3
        assert kpi.scheduled_percentage == pytest.approx(33.3, 0.1)
        assert kpi.overall_score > 0.0


class TestOptimizerAPIEndpoints:
    def test_generate_plan_endpoint(self):
        with TestClient(app) as client:
            res = client.post("/api/v1/optimizer/generate-plan", json={"scenario_type": "NORMAL"})
            assert res.status_code == 200
            data = res.json()
            assert "plan_id" in data
            assert data["is_feasible"] is True
            assert "kpi_scorecard" in data
            assert "blocks" in data
            assert len(data["blocks"]) > 0
            assert data["kpi_scorecard"]["overall_score"] > 0
