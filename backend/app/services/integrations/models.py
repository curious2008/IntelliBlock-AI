"""
External Railway Adapters & n8n Integration Contracts — Phase 11 IntelliBlock AI
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class ExternalSystemType(str, Enum):
    COA = "COA"      # Control Office Application (Train Running & Controller Orders)
    TMS = "TMS"      # Track Management System (P-Way Defects & USFD)
    FOIS = "FOIS"    # Freight Operations Information System
    N8N = "N8N"      # n8n Automation & Messaging Gateway


class WebhookEventType(str, Enum):
    BLOCK_APPROVED = "BLOCK_APPROVED"
    EMERGENCY_DEFECT_ALERT = "EMERGENCY_DEFECT_ALERT"
    TRAIN_RUNNING_UPDATE = "TRAIN_RUNNING_UPDATE"
    DYNAMIC_REPLAN_TRIGGERED = "DYNAMIC_REPLAN_TRIGGERED"
    SAFETY_VIOLATION_BLOCKED = "SAFETY_VIOLATION_BLOCKED"


@dataclass
class AdapterStatus:
    system_type: ExternalSystemType
    system_name: str
    status: str       # "CONNECTED", "STANDBY_POLLING", "READY"
    endpoint_url: str
    last_sync_timestamp: datetime
    active_feed_type: str
    security_protocol: str


@dataclass
class InboundWebhookEvent:
    event_id: str
    source_system: ExternalSystemType
    event_type: WebhookEventType
    timestamp: datetime
    payload: Dict[str, Any] = field(default_factory=dict)
    acknowledged: bool = True
    action_taken: str = ""


@dataclass
class OutboundWebhookDispatch:
    dispatch_id: str
    target_system: ExternalSystemType
    event_type: WebhookEventType
    dispatched_at: datetime
    payload: Dict[str, Any]
    status_code: int = 200
    delivered: bool = True
