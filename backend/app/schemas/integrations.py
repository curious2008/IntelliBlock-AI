"""
Pydantic Schemas for External Integrations & n8n API
Phase 11 IntelliBlock AI
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AdapterStatusSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    system_type: str
    system_name: str
    status: str
    endpoint_url: str
    last_sync_timestamp: datetime
    active_feed_type: str
    security_protocol: str


class AdapterStatusListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    adapters: List[AdapterStatusSchema]
    total_connected: int


class InboundWebhookRequest(BaseModel):
    source_system: str = Field(..., json_schema_extra={"example": "COA"})
    event_type: str = Field(..., json_schema_extra={"example": "TRAIN_RUNNING_UPDATE"})
    payload: Dict[str, Any] = Field(default_factory=dict)


class InboundWebhookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: str
    source_system: str
    event_type: str
    timestamp: datetime
    acknowledged: bool
    action_taken: str


class OutboundWebhookRequest(BaseModel):
    target_system: str = Field(..., json_schema_extra={"example": "N8N"})
    event_type: str = Field(..., json_schema_extra={"example": "BLOCK_APPROVED"})
    payload: Dict[str, Any] = Field(default_factory=dict)


class OutboundWebhookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dispatch_id: str
    target_system: str
    event_type: str
    dispatched_at: datetime
    status_code: int
    delivered: bool
