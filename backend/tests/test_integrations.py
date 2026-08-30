"""
Automated Test Suite for External Railway Integrations & n8n — Phase 11 IntelliBlock AI
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.integrations.models import ExternalSystemType, WebhookEventType
from app.services.integrations.adapters import railway_integration_hub


class TestIntegrationsUnit:
    def test_adapter_statuses(self):
        statuses = railway_integration_hub.get_all_adapter_statuses()
        assert len(statuses) == 4
        systems = [s.system_type for s in statuses]
        assert ExternalSystemType.COA in systems
        assert ExternalSystemType.TMS in systems
        assert ExternalSystemType.FOIS in systems
        assert ExternalSystemType.N8N in systems

    def test_inbound_webhook_coa_processing(self):
        event = railway_integration_hub.process_inbound_webhook(
            source=ExternalSystemType.COA,
            event_type=WebhookEventType.TRAIN_RUNNING_UPDATE,
            payload={"train_number": "12001", "delay_minutes": 25}
        )
        assert event.acknowledged is True
        assert "12001" in event.action_taken

    def test_outbound_webhook_n8n_dispatch(self):
        dispatch = railway_integration_hub.dispatch_outbound_webhook(
            target=ExternalSystemType.N8N,
            event_type=WebhookEventType.BLOCK_APPROVED,
            payload={"block_id": "BLK-001", "status": "APPROVED"}
        )
        assert dispatch.delivered is True
        assert dispatch.status_code == 200


class TestIntegrationsAPIEndpoints:
    def test_get_adapter_statuses_endpoint(self):
        with TestClient(app) as client:
            res = client.get("/api/v1/integrations/adapters/status")
            assert res.status_code == 200
            data = res.json()
            assert "adapters" in data
            assert len(data["adapters"]) == 4
            assert data["total_connected"] == 4

    def test_inbound_webhook_endpoint(self):
        with TestClient(app) as client:
            payload = {
                "source_system": "TMS",
                "event_type": "EMERGENCY_DEFECT_ALERT",
                "payload": {"section_id": "SEC-DEL-01", "defect_type": "RAIL_FRACTURE"}
            }
            res = client.post("/api/v1/integrations/webhooks/inbound", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["acknowledged"] is True
            assert "SEC-DEL-01" in data["action_taken"]

    def test_outbound_dispatch_endpoint(self):
        with TestClient(app) as client:
            payload = {
                "target_system": "N8N",
                "event_type": "BLOCK_APPROVED",
                "payload": {"plan_id": "PLAN-2026-001"}
            }
            res = client.post("/api/v1/integrations/webhooks/dispatch", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["delivered"] is True
