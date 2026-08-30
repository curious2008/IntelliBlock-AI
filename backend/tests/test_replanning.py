"""
Automated Test Suite for Dynamic Replanning & What-If Simulator — Phase 8 IntelliBlock AI
"""
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.replanning.models import DisruptionEvent, DisruptionType
from app.services.replanning.engine import dynamic_replanner
from app.services.replanning.simulator import what_if_simulator
from app.services.optimizer.solver import block_schedule_solver


@pytest.fixture
def baseline_plan_context():
    now = datetime(2026, 8, 31, 2, 0, tzinfo=timezone.utc)
    tasks = {
        "TSK-001": {
            "task_id": "TSK-001",
            "task_type": "TRACK_TAMPING",
            "department": "ENGG",
            "priority_score": 9.0,
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
    return plan, tasks, opportunities, resources, trains, sections


class TestReplanningUnit:
    def test_dynamic_replan_shifts_tasks(self, baseline_plan_context):
        plan, tasks, opps, res, trains, sections = baseline_plan_context
        disruption = DisruptionEvent(
            event_id="EVT-01",
            disruption_type=DisruptionType.TRAIN_DELAY,
            target_id="TRN-12001",
            magnitude_minutes=45,
            occurred_at=datetime.now(timezone.utc)
        )

        diff = dynamic_replanner.replan(
            current_plan=plan,
            disruptions=[disruption],
            all_tasks=tasks,
            opportunities=opps,
            resources=res,
            trains=trains,
            track_sections=sections
        )

        assert diff.plan_id != plan.plan_id
        assert len(diff.shifted_tasks) > 0
        assert diff.shifted_tasks[0].shift_delta_minutes >= 45
        assert diff.punctuality_recovery_minutes > 0

    def test_whatif_simulator_compares_cascade(self, baseline_plan_context):
        plan, tasks, opps, res, trains, sections = baseline_plan_context
        disruption = DisruptionEvent(
            event_id="EVT-02",
            disruption_type=DisruptionType.TASK_OVERRUN,
            target_id="TSK-001",
            magnitude_minutes=60,
            occurred_at=datetime.now(timezone.utc)
        )

        sim = what_if_simulator.simulate(
            current_plan=plan,
            disruption=disruption,
            all_tasks=tasks,
            opportunities=opps,
            resources=res,
            trains=trains,
            track_sections=sections
        )

        assert sim.cascade_unmitigated_train_delay_mins > sim.replan_mitigated_train_delay_mins
        assert sim.delay_saved_minutes > 0


class TestReplanningAPIEndpoints:
    def test_dynamic_replan_endpoint(self):
        with TestClient(app) as client:
            payload = {
                "disruptions": [
                    {
                        "disruption_type": "TRAIN_DELAY",
                        "target_id": "12001",
                        "magnitude_minutes": 30
                    }
                ]
            }
            res = client.post("/api/v1/replanning/dynamic-replan", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert "plan_id" in data
            assert "shifted_tasks" in data
            assert "punctuality_recovery_minutes" in data

    def test_simulate_whatif_endpoint(self):
        with TestClient(app) as client:
            payload = {
                "disruption": {
                    "disruption_type": "TASK_OVERRUN",
                    "target_id": "TSK-2026-0001",
                    "magnitude_minutes": 45
                }
            }
            res = client.post("/api/v1/replanning/simulate-whatif", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert "cascade_unmitigated_train_delay_mins" in data
            assert "replan_mitigated_train_delay_mins" in data
            assert "delay_saved_minutes" in data
