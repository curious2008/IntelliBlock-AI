# Railway Constraint Engine Specification — SIH26027 IntelliBlock AI

**Document Type:** Domain Safety & Deterministic Constraint Specification  
**Phase:** 5A, 5B, 5C — Constraint Engine Foundation, Modeling & Validation  
**Status:** Canonical & Active  
**Version:** 1.0.0  

---

## 1. Architectural Philosophy: AI Predicts $\rightarrow$ Optimization Decides $\rightarrow$ Constraint Engine Validates

In Indian Railways operational block scheduling, safety rules and physics are non-negotiable hard boundaries:
- **AI Models:** Responsible for predictive and probabilistic estimation (duration variance, overrun probability, asset risk).
- **Optimization Engine (Phase 6):** Formulates multi-objective trade-offs and discovers candidate block allocations.
- **Constraint Engine (Phase 5):** Deterministically evaluates and guarantees that NO schedule assignment violates safety, spatial, rolling-stock, or electrical constraints.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CANDIDATE SCHEDULE                              │
│              (Task, Time Window, Opportunity, Resources)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    DETERMINISTIC CONSTRAINT ENGINE                     │
│                                                                        │
│   [CR-001] Time Window Validity         [CR-005] Precedence Order      │
│   [CR-002] Opportunity Alignment       [CR-006] Train Traffic Safety  │
│   [CR-003] Resource Non-Overlap        [CR-007] Power Block Isolation │
│   [CR-004] Resource Capability Match   [CR-008] Cross-Dept Safety     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       FEASIBILITY REPORT                               │
│       • is_feasible: Boolean (True only if Hard Violations == 0)       │
│       • hard_violations_count, soft_violations_count, warnings_count   │
│       • Granular violation diagnostics with affected entity IDs        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 8 Canonical Deterministic Rules

| Rule ID | Rule Name | Severity | Operational / Safety Logic |
|---|---|---|---|
| `CR-001` | Time Window Validity | **HARD** | $t_{start} < t_{end}$ and duration $(t_{end} - t_{start}) \ge t_{min}$. |
| `CR-002` | Block Opportunity Alignment | **HARD** | Task schedule window must lie strictly within designated line possession window ($t_{start} \ge opp_{start} \land t_{end} \le opp_{end}$). |
| `CR-003` | Resource Non-Overlap | **HARD** | A machine (e.g. BCM, TTM) or specialized gang cannot be assigned to overlapping task windows ($[s_1, e_1] \cap [s_2, e_2] = \emptyset$). |
| `CR-004` | Resource Capability Match | **HARD** | Assigned resources must match task department and operational machinery capability. |
| `CR-005` | Task Prerequisite Precedence | **HARD** | Predecessor maintenance tasks must finish before dependent successor tasks start ($t_{end, pred} \le t_{start, succ}$). |
| `CR-006` | Train Movement Non-Interference | **HARD** | Track section block must not overlap with scheduled passenger/freight train paths without allocated possession. |
| `CR-007` | Power Block Isolation | **HARD** | Traction (TRD/OHE) maintenance tasks requiring power isolation must have verified `is_power_block_available == True`. |
| `CR-008` | Cross-Department Safety | **HARD** | Incompatible physical tasks on the same track section (e.g. heavy mechanical track tamping and delicate signal wiring) cannot occur simultaneously. |

---

## 3. Verified API Contracts

- `POST /api/v1/constraints/validate-schedule`
- `GET /api/v1/constraints/rules`
