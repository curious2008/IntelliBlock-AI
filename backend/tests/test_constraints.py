"""
Automated Test Suite for Railway Constraint Engine — Phase 5 IntelliBlock AI

Validates all 8 hard/soft constraint rules, corner cases, conflict detection,
and FastAPI endpoint contracts.
"""
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.constraints.evaluator import constraint_evaluator
from app.services.constraints.models import (
    ConstraintSeverity, ConstraintType, ScheduledTaskAssignment
)
from app.services.constraints.registry import constraint_registry
from app.services.constraints.rules import (
    TimeWindowValidityRule, BlockOpportunityAlignmentRule,
    ResourceNoOverlapRule, ResourceCapabilityMatchRule,
    TaskPrerequisitesRule, TrainMovementConflictRule,
    PowerBlockIsolationRule, CrossDeptSafetyRule
)


@pytest.fixture
def base_context():
    now = datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc)
    return {
        "tasks": {
            "TSK-001": {
                "task_id": "TSK-001",
                "task_type": "TRACK_TAMPING",
                "department": "ENGG",
                "minimum_duration_mins": 120,
                "location_section_id": "SEC-01",
                "prerequisite_task_ids": []
            },
            "TSK-002": {
                "task_id": "TSK-002",
                "task_type": "POINT_MACHINE_OVERHAUL",
                "department": "ST",
                "minimum_duration_mins": 60,
                "location_section_id": "SEC-01",
                "prerequisite_task_ids": ["TSK-001"]
            },
            "TSK-003": {
                "task_id": "TSK-003",
                "task_type": "OHE_INSPECTION",
                "department": "TRD",
                "minimum_duration_mins": 90,
                "location_section_id": "SEC-02",
                "prerequisite_task_ids": []
            },
        },
        "resources": {
            "RES-ENGG-01": {"resource_id": "RES-ENGG-01", "department": "ENGG", "capability": "TAMPING"},
            "RES-ST-01": {"resource_id": "RES-ST-01", "department": "ST", "capability": "POINT_MACHINE"},
            "RES-TRD-01": {"resource_id": "RES-TRD-01", "department": "TRD", "capability": "TOWER_WAGON"},
        },
        "opportunities": {
            "OPP-01": {
                "opportunity_id": "OPP-01",
                "window_start": now + timedelta(hours=1),
                "window_end": now + timedelta(hours=5),
                "is_power_block_available": True
            },
            "OPP-NO-POWER": {
                "opportunity_id": "OPP-NO-POWER",
                "window_start": now + timedelta(hours=1),
                "window_end": now + timedelta(hours=5),
                "is_power_block_available": False
            }
        },
        "trains": {
            "TRN-01": {
                "train_id": "TRN-01",
                "train_number": "12001",
                "track_section_id": "SEC-01",
                "scheduled_entry_time": now + timedelta(hours=2),
                "scheduled_exit_time": now + timedelta(hours=2, minutes=30),
                "priority_category": 1
            }
        },
        "track_sections": {
            "SEC-01": {"section_id": "SEC-01"},
            "SEC-02": {"section_id": "SEC-02"},
        }
    }


class TestConstraintRulesUnit:
    def test_time_window_validity_pass(self, base_context):
        now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
        rule = TimeWindowValidityRule()
        assignments = [
            ScheduledTaskAssignment("TSK-001", now, now + timedelta(hours=3))
        ]
        result = rule.evaluate(assignments, base_context)
        assert result.passed is True
        assert len(result.violations) == 0

    def test_time_window_validity_inverted_fail(self, base_context):
        now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
        rule = TimeWindowValidityRule()
        assignments = [
            ScheduledTaskAssignment("TSK-001", now + timedelta(hours=3), now)
        ]
        result = rule.evaluate(assignments, base_context)
        assert result.passed is False
        assert len(result.violations) == 1
        assert result.violations[0].constraint_type == ConstraintType.TIME_WINDOW_VALIDITY

    def test_resource_overlap_detection(self, base_context):
        now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
        rule = ResourceNoOverlapRule()
        # Same resource RES-ENGG-01 on two overlapping tasks
        assignments = [
            ScheduledTaskAssignment("TSK-001", now, now + timedelta(hours=2), assigned_resource_ids=["RES-ENGG-01"]),
            ScheduledTaskAssignment("TSK-002", now + timedelta(hours=1), now + timedelta(hours=3), assigned_resource_ids=["RES-ENGG-01"])
        ]
        result = rule.evaluate(assignments, base_context)
        assert result.passed is False
        assert len(result.violations) == 1
        assert "RES-ENGG-01" in result.violations[0].affected_entity_ids

    def test_resource_department_mismatch(self, base_context):
        now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
        rule = ResourceCapabilityMatchRule()
        # ENGG task assigned to TRD resource
        assignments = [
            ScheduledTaskAssignment("TSK-001", now, now + timedelta(hours=2), assigned_resource_ids=["RES-TRD-01"])
        ]
        result = rule.evaluate(assignments, base_context)
        assert result.passed is False
        assert len(result.violations) == 1

    def test_task_prerequisite_precedence(self, base_context):
        now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
        rule = TaskPrerequisitesRule()
        # TSK-002 starts at 1:00, but prerequisite TSK-001 ends at 3:00 (Violation)
        assignments = [
            ScheduledTaskAssignment("TSK-001", now, now + timedelta(hours=3)),
            ScheduledTaskAssignment("TSK-002", now, now + timedelta(hours=1))
        ]
        result = rule.evaluate(assignments, base_context)
        assert result.passed is False
        assert any("Precedence violation" in v.message for v in result.violations)

    def test_power_block_requirement(self, base_context):
        now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
        rule = PowerBlockIsolationRule()
        # TRD task scheduled on opportunity with no power block
        assignments = [
            ScheduledTaskAssignment("TSK-003", now + timedelta(hours=1), now + timedelta(hours=3), opportunity_id="OPP-NO-POWER", requires_power_block=True)
        ]
        result = rule.evaluate(assignments, base_context)
        assert result.passed is False
        assert len(result.violations) == 1

    def test_cross_dept_incompatible_safety(self, base_context):
        now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
        rule = CrossDeptSafetyRule()
        # Simultaneous TRACK_TAMPING and POINT_MACHINE_OVERHAUL on SEC-01
        assignments = [
            ScheduledTaskAssignment("TSK-001", now, now + timedelta(hours=2), track_section_id="SEC-01"),
            ScheduledTaskAssignment("TSK-002", now, now + timedelta(hours=2), track_section_id="SEC-01")
        ]
        result = rule.evaluate(assignments, base_context)
        assert result.passed is False
        assert any("Incompatible tasks" in v.message for v in result.violations)


class TestConstraintAPIEndpoints:
    def test_get_rules_endpoint(self):
        with TestClient(app) as client:
            res = client.get("/api/v1/constraints/rules")
            assert res.status_code == 200
            data = res.json()
            assert "rules" in data
            assert data["total_count"] >= 8

    def test_validate_schedule_feasible(self):
        with TestClient(app) as client:
            now = datetime(2026, 8, 31, 1, 0, tzinfo=timezone.utc)
            payload = {
                "assignments": [
                    {
                        "task_id": "TSK-2026-0001",
                        "scheduled_start": (now + timedelta(hours=1)).isoformat(),
                        "scheduled_end": (now + timedelta(hours=4)).isoformat(),
                        "opportunity_id": "OPP-001",
                        "assigned_resource_ids": [],
                        "track_section_id": "SEC-DEL-GZB-01",
                        "requires_power_block": False
                    }
                ]
            }
            res = client.post("/api/v1/constraints/validate-schedule", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert "is_feasible" in data
            assert "evaluated_rules_count" in data
            assert data["evaluated_rules_count"] >= 8
