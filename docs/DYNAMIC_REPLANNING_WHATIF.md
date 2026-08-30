# Dynamic Replanning & What-If Simulation — SIH26027 IntelliBlock AI

**Document Type:** Dynamic Rolling-Horizon Replanning & Disruption Simulation Specification  
**Phase:** 8A, 8B, 8C — Disruption Detection, What-If Simulator & Dynamic Replan Engine  
**Status:** Canonical & Active  
**Version:** 1.0.0  

---

## 1. Operational Realities of Indian Railways Disturbances

Railway networks operate in highly dynamic stochastic environments:
- Passenger train delays propagate through section headways.
- Maintenance machines experience unexpected mechanical faults or track conditions.
- Emergency track fractures or OHE wire snaps require immediate unscheduled line possessions.

When disruptions occur, manually rescheduling takes hours of telephone coordination between Section Controllers, TXR, and Permanent Way Inspectors, leading to massive cumulative delays.

---

## 2. Dynamic Replanning Architecture

```
OPERATIONAL DISTURBANCE (Train Delay / Task Overrun / Machine Breakdown)
                                  ↓
WHAT-IF CASCADE ESTIMATOR (Quantifies Unmitigated Headway Propagation)
                                  ↓
ROLLING-HORIZON REPLANNER (Isolates Affected Window, Shifts Minimal Tasks)
                                  ↓
DETERMINISTIC CONSTRAINT CHECK (Guarantees Feasibility of New Schedule)
                                  ↓
REPLAN DIFF (Unchanged Tasks, Shift Deltas, Punctuality Recovery Minutes)
```

---

## 3. Verified Endpoints & UI Sandbox

- `POST /api/v1/replanning/dynamic-replan`: Re-optimizes active schedule in response to disturbance events.
- `POST /api/v1/replanning/simulate-whatif`: Compares unmitigated default cascade vs AI dynamic mitigation.
- UI Sandbox: Interactive disruption studio at `/what-if` allowing planners to test disruptions and apply replans with one click.
