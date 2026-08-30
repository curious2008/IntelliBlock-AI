# Maintenance Priority Framework — SIH26027

This document defines the mathematical prioritization framework used to evaluate maintenance task urgency, distinguishing between **Hard Priority Constraints** and **Soft Priority Factors**.

---

## 1. Prioritization Principles

1. **Safety First:** Safety-critical defects and emergency repairs always supersede routine scheduled maintenance.
2. **Configurable Thresholds:** All priority weights and safety limits are fully configurable parameters rather than fixed, hardcoded assumptions.
3. **No Hidden Magic Scores:** The priority calculation is fully transparent and auditable.

---

## 2. Hard Priority Constraints vs. Soft Priority Factors

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HARD PRIORITY CONSTRAINTS                          │
│        (MUST be satisfied unconditionally; Solver CANNOT violate)        │
├─────────────────────────────────────────────────────────────────────────┤
│ • Emergency Safety Repair Isolation (Immediate line closure for broken  │
│   rail or severed OHE line).                                            │
│ • Maximum Safe Deferred Limit (Task cannot be deferred past its maximum │
│   safety threshold without triggering automatic speed restriction).    │
│ • Hard Sequence Dependencies (Task A must precede Task B).              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        SOFT PRIORITY FACTORS                            │
│           (Used in mathematical objective function scoring)             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Asset Criticality Score                                               │
│ • Defect Severity Rating                                                │
│ • Due-Date Proximity Score                                              │
│ • Historical Failure Probability                                        │
│ • Expected Asset Availability Benefit                                   │
│ • Bundling Efficiency Advantage                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Soft Priority Composite Formula

For non-emergency tasks, the system calculates a composite Task Priority Score $P(T)$ ranging from $0.0$ to $10.0$:

$$P(T) = w_1 \cdot C_{\text{asset}} + w_2 \cdot S_{\text{defect}} + w_3 \cdot U_{\text{due}} + w_4 \cdot F_{\text{history}} + w_5 \cdot B_{\text{benefit}}$$

Where:

- $C_{\text{asset}}$ **(Asset Criticality, 1–10):** Importance of the asset based on corridor density and track classification (e.g., Group A trunk line vs branch line).
- $S_{\text{defect}}$ **(Defect Severity, 1–10):** Physical condition degradation score assessed during inspection.
- $U_{\text{due}}$ **(Due-Date Proximity, 0–10):** Scaled score based on how close the task is to its target due date:
  $$U_{\text{due}} = \min\left(10, \frac{\text{Days Elapsed Since Request}}{\text{Total Days Allowed}} \times 10\right)$$
- $F_{\text{history}}$ **(Historical Failure Risk, 0–10):** AI-estimated probability of asset breakdown if maintenance is delayed.
- $B_{\text{benefit}}$ **(Availability Benefit, 0–10):** Estimated improvement in track throughput or removal of a temporary speed restriction (TSR).
- $w_1, w_2, w_3, w_4, w_5$ **(Configurable Weight Factors):** Default baseline weights ($\sum w_i = 1.0$):
  - Asset Criticality Weight ($w_1$) = `0.25`
  - Defect Severity Weight ($w_2$) = `0.30`
  - Due-Date Proximity Weight ($w_3$) = `0.20`
  - Failure History Weight ($w_4$) = `0.15`
  - Availability Benefit Weight ($w_5$) = `0.10`

---

## 4. Configurable Threshold Matrix

Because official internal Indian Railways parameter values vary by zone and division, all operational limits are defined as configurable environment parameters:

```json
{
  "priority_config": {
    "weights": {
      "asset_criticality": 0.25,
      "defect_severity": 0.30,
      "due_date_proximity": 0.20,
      "failure_history": 0.15,
      "availability_benefit": 0.10
    },
    "thresholds": {
      "emergency_priority_score": 9.5,
      "max_allowed_deferral_days_civil": 14,
      "max_allowed_deferral_days_st": 7,
      "max_allowed_deferral_days_trd": 10,
      "tsr_speed_penalty_threshold_kmh": 30
    }
  }
}
```

This ensures the system can be calibrated for different railway divisions without altering domain logic.
