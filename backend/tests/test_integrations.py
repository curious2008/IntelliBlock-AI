"""
Automated Test Suite for External Railway Integrations & n8n — Phase 11 IntelliBlock AI
"""
from datetime import datetime, timezone
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
        n8n_status = next(s for s in statuses if s.system_type == ExternalSystemType.N8N)
        assert "wf01-block-approved" in n8n_status.endpoint_url

    def test_inbound_webhook_coa_processing(self):
        event = railway_integration_hub.process_inbound_webhook(
            source=ExternalSystemType.COA,
            event_type=WebhookEventType.TRAIN_RUNNING_UPDATE,
            payload={"train_number": "12001", "delay_minutes": 25}
        )
        assert event.acknowledged is True
        assert "12001" in event.action_taken

    def test_inbound_webhook_wf02_disruption_processing(self):
        event = railway_integration_hub.process_inbound_webhook(
            source=ExternalSystemType.N8N,
            event_type=WebhookEventType.DISRUPTION_EVENT,
            payload={
                "event_id": "EVT-N8N-DISRUPT-101",
                "event_version": "1.0.0",
                "occurred_at": datetime.now(timezone.utc).isoformat(),
                "source": "COA_LIVE_FEED",
                "disruption": {
                    "disruption_type": "TRAIN_DELAY",
                    "target_id": "12001",
                    "magnitude_minutes": 45,
                    "section_id": "SEC-DEL-GZB-01",
                    "notes": "Late arrival from interchange"
                }
            }
        )
        assert event.acknowledged is True
        assert event.event_id == "EVT-N8N-DISRUPT-101"
        assert "12001" in event.action_taken
        assert "WF-02 Disruption ingested" in event.action_taken

    def test_outbound_webhook_wf01_n8n_dispatch(self):
        dispatch = railway_integration_hub.dispatch_outbound_webhook(
            target=ExternalSystemType.N8N,
            event_type=WebhookEventType.BLOCK_APPROVED,
            payload={
                "plan": {
                    "plan_id": "PLAN-2026-001",
                    "section_id": "SEC-DEL-GZB-01",
                    "window_start": "2026-08-31T02:00:00Z",
                    "window_end": "2026-08-31T04:00:00Z",
                    "departments": ["ENGG", "TRD"]
                },
                "approval": {
                    "status": "APPROVED",
                    "approved_by": "CHIEF_SECTION_CONTROLLER",
                    "approved_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        assert dispatch.delivered is True
        assert dispatch.payload["event_type"] == "BLOCK_APPROVED"
        assert dispatch.payload["source"] == "INTELLIBLOCK_AI"
        assert dispatch.payload["plan"]["plan_id"] == "PLAN-2026-001"


class TestIntegrationsAPIEndpoints:
    def test_get_adapter_statuses_endpoint(self):
        with TestClient(app) as client:
            res = client.get("/api/v1/integrations/adapters/status")
            assert res.status_code == 200
            data = res.json()
            assert "adapters" in data
            assert len(data["adapters"]) == 4
            assert data["total_connected"] == 4

    def test_inbound_webhook_endpoint_tms(self):
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

    def test_inbound_webhook_endpoint_wf02_disruption(self):
        with TestClient(app) as client:
            payload = {
                "source_system": "N8N",
                "event_type": "DISRUPTION_EVENT",
                "payload": {
                    "event_id": "EVT-N8N-001",
                    "event_version": "1.0.0",
                    "occurred_at": datetime.now(timezone.utc).isoformat(),
                    "source": "COA_LIVE_FEED",
                    "disruption": {
                        "disruption_type": "TRAIN_DELAY",
                        "target_id": "12001",
                        "magnitude_minutes": 30
                    }
                }
            }
            res = client.post("/api/v1/integrations/webhooks/inbound", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["acknowledged"] is True
            assert data["event_id"] == "EVT-N8N-001"
            assert "12001" in data["action_taken"]

    def test_outbound_dispatch_endpoint_wf01(self):
        with TestClient(app) as client:
            payload = {
                "target_system": "N8N",
                "event_type": "BLOCK_APPROVED",
                "payload": {
                    "plan": {
                        "plan_id": "PLAN-2026-001",
                        "section_id": "SEC-DEL-GZB-01",
                        "window_start": "2026-08-31T02:00:00Z",
                        "window_end": "2026-08-31T04:00:00Z",
                        "departments": ["ENGG", "TRD"]
                    }
                }
            }
            res = client.post("/api/v1/integrations/webhooks/dispatch", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["delivered"] is True
            assert data["target_system"] == "N8N"
            assert data["event_type"] == "BLOCK_APPROVED"
