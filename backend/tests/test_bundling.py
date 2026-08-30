"""
Automated Test Suite for Cross-Department Task Bundling Engine — Phase 7 IntelliBlock AI
"""
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.bundling.engine import bundling_coordinator, BundlingCoordinator


@pytest.fixture
def sample_bundling_data():
    now = datetime(2026, 8, 31, 2, 0, tzinfo=timezone.utc)
    tasks = [
        {
            "task_id": "TSK-BND-01",
            "task_type": "TRACK_TAMPING",
            "department": "ENGG",
            "location_section_id": "SEC-DEL-01",
            "location_corridor_id": "COR-DEL-KNP",
            "description": "Routine track tamping",
            "estimated_duration_mins": 120,
            "priority_score": 8.5,
            "is_emergency": False
        },
        {
            "task_id": "TSK-BND-02",
            "task_type": "OHE_INSPECTION",
            "department": "TRD",
            "location_section_id": "SEC-DEL-01",
            "location_corridor_id": "COR-DEL-KNP",
            "description": "Overhead traction inspection",
            "estimated_duration_mins": 90,
            "priority_score": 7.0,
            "is_emergency": False
        }
    ]
    opportunities = [
        {
            "opportunity_id": "OPP-BND-01",
            "track_section_id": "SEC-DEL-01",
            "corridor_id": "COR-DEL-KNP",
            "window_start": now,
            "window_end": now + timedelta(hours=4),
            "is_power_block_available": True
        }
    ]
    return tasks, opportunities


class TestBundlingUnit:
    def test_bundling_creates_unified_possession(self, sample_bundling_data):
        tasks, opps = sample_bundling_data
        coordinator = BundlingCoordinator()
        report = coordinator.coordinate_bundles(tasks, opps)

        assert report.total_bundles_count == 1
        assert report.total_tasks_bundled == 2
        assert "ENGG" in report.departments_involved
        assert "TRD" in report.departments_involved
        # Max of 120 and 90 is 120. Sum is 210. Saved is 90 mins!
        assert report.total_line_block_minutes_saved == 90
        assert report.synergy_index > 0.0

    def test_incompatible_safety_tasks_not_bundled(self):
        now = datetime(2026, 8, 31, 2, 0, tzinfo=timezone.utc)
        # Incompatible pair: TRACK_TAMPING and POINT_MACHINE_OVERHAUL
        tasks = [
            {
                "task_id": "TSK-INC-01",
                "task_type": "TRACK_TAMPING",
                "department": "ENGG",
                "location_section_id": "SEC-01",
                "estimated_duration_mins": 120,
                "priority_score": 8.0,
                "is_emergency": False
            },
            {
                "task_id": "TSK-INC-02",
                "task_type": "POINT_MACHINE_OVERHAUL",
                "department": "ST",
                "location_section_id": "SEC-01",
                "estimated_duration_mins": 60,
                "priority_score": 7.0,
                "is_emergency": False
            }
        ]
        coordinator = BundlingCoordinator()
        report = coordinator.coordinate_bundles(tasks, [])
        # Should not bundle incompatible pair together
        assert report.total_bundles_count == 0


class TestBundlingAPIEndpoints:
    def test_coordinate_bundles_endpoint(self):
        with TestClient(app) as client:
            res = client.post("/api/v1/bundling/coordinate-bundles")
            assert res.status_code == 200
            data = res.json()
            assert "total_bundles_count" in data
            assert "total_tasks_bundled" in data
            assert "total_line_block_minutes_saved" in data
            assert "bundles" in data
