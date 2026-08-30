import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine, Base
from data.seed_data import seed_database





def test_health_check():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "intelliblock-api"
        assert "version" in data


def test_get_departments():
    with TestClient(app) as client:
        response = client.get("/api/v1/departments")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3
        dept_codes = [d["department_code"] for d in data]
        assert "ENGG" in dept_codes
        assert "ST" in dept_codes
        assert "TRD" in dept_codes


def test_get_corridors():
    with TestClient(app) as client:
        response = client.get("/api/v1/corridors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "corridor_id" in data[0]


def test_get_maintenance_tasks():
    with TestClient(app) as client:
        response = client.get("/api/v1/maintenance-tasks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        task = data[0]
        assert "task_id" in task
        assert "priority_score" in task


def test_get_trains():
    with TestClient(app) as client:
        response = client.get("/api/v1/trains")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


def test_error_format_not_found():
    with TestClient(app) as client:
        response = client.get("/api/v1/non-existent-endpoint")
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
