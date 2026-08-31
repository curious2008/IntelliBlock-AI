"""
Unit and API Integration Tests for Adaptive Planning Horizon
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.services.optimizer.planning_horizon import planning_horizon_engine


class TestPlanningHorizonUnit:
    """Test Planning Horizon Engine monthly and weekly aggregations."""

    def test_monthly_plan_aggregation(self):
        db = SessionLocal()
        try:
            res = planning_horizon_engine.get_monthly_plan(db=db, month_key="2026-09", scenario_type="NORMAL")
            assert res.month_key == "2026-09"
            assert res.total_maintenance_tasks > 0
            assert len(res.department_workloads) == 3
            assert len(res.weeks) == 4
            assert len(res.major_programs) > 0
            assert res.capacity_utilization_pct > 0
        finally:
            db.close()

    def test_weekly_plan_aggregation(self):
        db = SessionLocal()
        try:
            res = planning_horizon_engine.get_weekly_plan(db=db, week_number=1, scenario_type="NORMAL")
            assert res.week_number == 1
            assert len(res.days) == 7
            assert res.total_tasks_count > 0
            assert res.planned_possessions_count > 0
        finally:
            db.close()


class TestPlanningHorizonAPI:
    """Test FastAPI endpoints for Planning Horizon."""

    def test_get_monthly_horizon_api(self):
        with TestClient(app) as client:
            res = client.get("/api/v1/optimizer/planning-horizon/monthly?month_key=2026-09&scenario_type=NORMAL")
            assert res.status_code == 200
            data = res.json()
            assert data["month_key"] == "2026-09"
            assert len(data["weeks"]) == 4
            assert len(data["department_workloads"]) == 3

    def test_get_weekly_horizon_api(self):
        with TestClient(app) as client:
            res = client.get("/api/v1/optimizer/planning-horizon/weekly?week_number=2&scenario_type=NORMAL")
            assert res.status_code == 200
            data = res.json()
            assert data["week_number"] == 2
            assert len(data["days"]) == 7
