# Intelligent Block Planning & Cross-Department Bundling — SIH26027 IntelliBlock AI

**Document Type:** Intelligent Block Planning & Bundling Specification  
**Phase:** 7A, 7B, 7C — Opportunity Discovery, Cross-Department Bundling & Planning UI  
**Status:** Canonical & Active  
**Version:** 1.0.0  

---

## 1. The Multi-Department Coordination Problem in Indian Railways

Historically in Indian Railways operations:
- **Civil Engineering (ENGG)** requests track possessions for tamping, ballast cleaning, and rail renewals.
- **Signal & Telecom (S&T)** requests separate possessions for point machines, track circuits, and axle counters.
- **Electrical / Traction (TRD)** requests separate power block shutoffs for OHE inspection and wire renewals.

When departments act in silos, the same track section is closed multiple times, compounding passenger train delays and causing severe capacity degradation.

---

## 2. IntelliBlock Coordinated Bundling Architecture

IntelliBlock AI coordinates multi-department requests into unified block possession windows on the same track section:

```
┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│     CIVIL ENGG TASK       │  │       S&T SIGNAL TASK     │  │       ELECTRICAL (TRD)    │
│  (Track Tamping 120m)     │  │  (Point Machine 60m)      │  │  (OHE Wire Inspection 90m)│
└─────────────┬─────────────┘  └─────────────┬─────────────┘  └─────────────┬─────────────┘
              │                              │                              │
              └──────────────────────────────┼──────────────────────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │  CROSS-DEPT BUNDLING ENGINE │
                              │   (Safety Conflict Check)   │
                              └──────────────┬──────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │ UNIFIED POSSESSION WINDOW   │
                              │ Duration = max(120,60,90)   │
                              │          = 120 minutes      │
                              │ Synergy Saved = 150 minutes │
                              └─────────────────────────────┘
```

### Synergy Formula:
$$\text{SynergyMinutesSaved} = \left(\sum_{t \in \text{Bundle}} \text{Duration}(t)\right) - \max_{t \in \text{Bundle}} \text{Duration}(t)$$

---

## 3. Verified Endpoints & UI Integration

- `POST /api/v1/bundling/coordinate-bundles`: Returns `BundlingSynergyReportResponse` with individual bundled blocks, participating departments, minutes saved, and passenger delay reduction index.
- Human Planner UI: Interactive control center at `/plans` with dynamic KPI scorecards, bundled block cards, and single-click solver re-runs.
