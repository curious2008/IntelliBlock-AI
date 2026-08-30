"""
FastAPI Endpoints for External Integrations & n8n
Phase 11 IntelliBlock AI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.integrations import (
    AdapterStatusListResponse, InboundWebhookRequest, InboundWebhookResponse,
    OutboundWebhookRequest, OutboundWebhookResponse
)
from app.services.integrations.adapters import railway_integration_hub
from app.services.integrations.models import ExternalSystemType, WebhookEventType

router = APIRouter()


@router.get("/adapters/status", response_model=AdapterStatusListResponse)
def get_adapter_statuses():
    """
    Returns real-time health and connection status for external railway adapters (COA, TMS, FOIS, n8n).
    """
    statuses = railway_integration_hub.get_all_adapter_statuses()
    return AdapterStatusListResponse(
        adapters=statuses,
        total_connected=sum(1 for s in statuses if s.status == "CONNECTED")
    )


@router.post("/webhooks/inbound", response_model=InboundWebhookResponse)
def handle_inbound_webhook(request: InboundWebhookRequest):
    """
    Receives and processes incoming events/webhooks from COA, TMS, FOIS, or n8n.
    """
    event = railway_integration_hub.process_inbound_webhook(
        source=ExternalSystemType(request.source_system),
        event_type=WebhookEventType(request.event_type),
        payload=request.payload
    )
    return InboundWebhookResponse(
        event_id=event.event_id,
        source_system=event.source_system.value,
        event_type=event.event_type.value,
        timestamp=event.timestamp,
        acknowledged=event.acknowledged,
        action_taken=event.action_taken
    )


@router.post("/webhooks/dispatch", response_model=OutboundWebhookResponse)
def dispatch_outbound_webhook(request: OutboundWebhookRequest):
    """
    Dispatches outbound webhook notification to external automation hubs (e.g. n8n).
    """
    dispatch = railway_integration_hub.dispatch_outbound_webhook(
        target=ExternalSystemType(request.target_system),
        event_type=WebhookEventType(request.event_type),
        payload=request.payload
    )
    return OutboundWebhookResponse(
        dispatch_id=dispatch.dispatch_id,
        target_system=dispatch.target_system.value,
        event_type=dispatch.event_type.value,
        dispatched_at=dispatch.dispatched_at,
        status_code=dispatch.status_code,
        delivered=dispatch.delivered
    )
