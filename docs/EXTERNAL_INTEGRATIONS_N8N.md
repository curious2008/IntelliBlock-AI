# External Railway Integrations & n8n Gateway — SIH26027 IntelliBlock AI

**Document Type:** External System Adapters & n8n Automation Specification  
**Phase:** 11A, 11B, 11C — COA, TMS, FOIS & n8n Integration Hub  
**Status:** Canonical & Active  
**Version:** 1.0.0  

---

## 1. Indian Railways Integration Ecosystem

IntelliBlock AI functions as the central intelligence and coordination brain, integrating seamlessly with CRIS (Centre for Railway Information Systems) enterprise services:

```
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│          COA           │  │          TMS           │  │          FOIS          │
│ (Control Office App)   │  │(Track Management System│  │(Freight Operations Info│
│ Live Train Movements   │  │ USFD Rail Defect Feed  │  │ Rake Demand Forecasts  │
└───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │   INTELLIBLOCK AI GATEWAY   │
                         │    (Normalized Adapters)    │
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │     n8n AUTOMATION HUB      │
                         │ WhatsApp / SMS / Controller │
                         │   Workflow Notifications    │
                         └─────────────────────────────┘
```

---

## 2. Adapter Catalog & Security Protocols

| System | Protocol / Spec | Feed Type | Data Ingested / Dispatched |
|---|---|---|---|
| **COA** | TLS 1.3 / HMAC-SHA256 | `REALTIME_GPS_TIMETABLE` | Live passenger train delays, punctuality updates, section clearances. |
| **TMS** | OAuth2 Client Credentials | `USFD_RAIL_DEFECTS_OMS` | Ultrasonic rail testing defect alarms, joint failures, urgent P-Way orders. |
| **FOIS** | Mutual TLS (mTLS) | `RAKE_MOVEMENT_FORECAST` | Freight loading demands, rake transit corridors, low-density gap forecasts. |
| **n8n** | Bearer Token / Signature Verification | `BI_DIRECTIONAL_WEBHOOKS` | Outbound block approval alerts, incident broadcast, controller confirmations. |

---

## 3. Verified Endpoints

- `GET /api/v1/integrations/adapters/status`: Real-time health check of all external adapters.
- `POST /api/v1/integrations/webhooks/inbound`: Ingests events from COA/TMS/FOIS/n8n.
- `POST /api/v1/integrations/webhooks/dispatch`: Dispatches outbound events to n8n workflows.
