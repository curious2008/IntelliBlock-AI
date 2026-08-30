# AI Prediction Contracts — SIH26027 IntelliBlock AI

**Document Type:** AI System Specification  
**Status:** Phase 3A Prototype  
**Version:** 1.0.0

> [!IMPORTANT]
> All predictions in this document are produced by models trained **exclusively on synthetic scenario data**. They do NOT represent official Indian Railways operational classifications, safety limits, or performance benchmarks. All thresholds are configurable prototype parameters.

---

## 1. Overview

The IntelliBlock AI subsystem produces four categories of predictions that serve as **inputs** to the future Constraint Optimization Engine. The optimizer enforces hard constraints; the AI layer provides calibrated estimates and confidence ranges.

```
Domain Data (Assets, Tasks, Trains, Resources, Scenarios)
        ↓
Feature Engineering Layer
        ↓
AI Models (inference only, no direct DB writes)
        ↓
Prediction Contracts (defined below)
        ↓
Future Optimization Engine (enforces hard constraints)
```

---

## 2. Contract 1 — Maintenance Duration Prediction

### Purpose
Estimate actual task completion time before execution, given planned scope, asset condition, and operational context.

### Input Fields

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `task_id` | str | MaintenanceTask | Reference only (not a feature) |
| `task_type` | str | MaintenanceTask | Encoded categorically |
| `department` | str | MaintenanceTask | ENGG / ST / TRD |
| `estimated_duration_mins` | int | MaintenanceTask | Planned estimate |
| `min_duration_mins` | int | MaintenanceTask | Lower bound |
| `max_duration_mins` | int | MaintenanceTask | Upper bound |
| `priority_score` | float | MaintenanceTask | 0.0–10.0 |
| `is_emergency` | bool | MaintenanceTask | Emergency flag |
| `dependency_count` | int | Derived | Number of prerequisite tasks |
| `resource_count` | int | Derived | Number of required resources |
| `asset_condition_score` | float | Asset | 1.0–10.0 |
| `asset_criticality_index` | float | Asset | 1.0–10.0 |
| `asset_age_years` | float | Derived from Asset | Installation date delta |
| `days_since_last_maintenance` | float | Derived from Asset | From last_maintenance_date |
| `days_until_due` | float | Derived from Asset/Task | Signed (negative = overdue) |
| `crew_available_count` | int | Resource query | Matching dept crew count |
| `machine_available_count` | int | Resource query | Matching capability machines |
| `train_density_24h` | int | TrainMovement | Trains on corridor in 24h window |
| `best_opportunity_duration_mins` | int | BlockOpportunity | Longest candidate gap on section |
| `freight_density_code` | int | FreightForecast | LOW=0, MEDIUM=1, HIGH=2 |

### Leakage Prevention
The following fields are **explicitly excluded** — they would only be known after task execution:
- `actual_duration_mins` (ExecutionRecord)
- `overrun_mins` (ExecutionRecord)
- `actual_start`, `actual_end` (ExecutionRecord)
- `completion_status` (ExecutionRecord)

### Output Schema

```json
{
  "task_id": "TSK-2026-0012",
  "predicted_duration_minutes": 127,
  "lower_bound_minutes": 105,
  "upper_bound_minutes": 152,
  "confidence": 0.74,
  "model_name": "duration_rf_v1",
  "model_version": "1.0.0",
  "feature_version": "1.0",
  "prediction_basis": "SYNTHETIC_PROTOTYPE"
}
```

> **Note on intervals:** `lower_bound` and `upper_bound` are derived from Random Forest leaf-node prediction spread. They are **indicative ranges, not guaranteed statistical confidence intervals** at a specific probability level.

---

## 3. Contract 2 — Overrun Risk Prediction

### Purpose
Before assigning a task to a block window, estimate the probability that the task will exceed its planned duration (causing schedule disruption).

### Additional Input Fields (beyond Contract 1)
| Field | Type | Notes |
|-------|------|-------|
| `overdue_flag` | int | 1 if past due_date, 0 otherwise |
| `scenario_type_code` | int | Encoded: NORMAL=0, HEAVY_TRAFFIC=1, … |

### Output Schema

```json
{
  "task_id": "TSK-2026-0012",
  "overrun_probability": 0.38,
  "risk_level": "MEDIUM",
  "confidence": 0.71,
  "model_name": "overrun_gbc_v1",
  "model_version": "1.0.0",
  "feature_version": "1.0",
  "prediction_basis": "SYNTHETIC_PROTOTYPE"
}
```

### Prototype Risk Level Thresholds (Configurable)

| `overrun_probability` Range | `risk_level` |
|-----------------------------|--------------|
| < 0.20 | LOW |
| 0.20 – 0.50 | MEDIUM |
| 0.50 – 0.70 | HIGH |
| > 0.70 | CRITICAL |

> These thresholds are **configurable prototype parameters** and do not reflect official Indian Railways risk classifications.

---

## 4. Contract 3 — Asset Maintenance Risk Assessment

### Purpose
Estimate the operational risk of deferring maintenance on a specific asset, based on asset condition, criticality, and overdue status.

### Input Fields

| Field | Type | Source |
|-------|------|--------|
| `asset_id` | str | Asset |
| `condition_score` | float | Asset (1–10, lower = worse) |
| `criticality_index` | float | Asset (1–10) |
| `days_since_last_maintenance` | float | Derived |
| `days_until_due` | float | Derived (negative = overdue) |
| `open_task_count` | int | Derived from MaintenanceTask |
| `overdue_task_count` | int | Derived from MaintenanceTask |

### Output Schema

```json
{
  "asset_id": "AST-DEL-ENGG-0042",
  "risk_score": 7.4,
  "risk_level": "HIGH",
  "confidence": 0.82,
  "score_components": {
    "condition_risk": 3.2,
    "criticality_weight": 2.4,
    "overdue_penalty": 1.8
  },
  "model_name": "asset_risk_weighted_v1",
  "model_version": "1.0.0",
  "feature_version": "1.0",
  "prediction_basis": "SYNTHETIC_PROTOTYPE"
}
```

> This is a **transparent weighted composite score**, not a black-box ML model. The formula is fully auditable.
>
> **NOT an official Indian Railways safety classification.**

---

## 5. Contract 4 — Traffic & Freight Density Forecast

### Purpose
Provide a forward-looking traffic density estimate for a corridor time window to assist opportunity discovery.

### Output Schema

```json
{
  "corridor_id": "COR-DEL-KNP",
  "time_window_start": "2026-09-01T06:00:00Z",
  "time_window_end": "2026-09-01T12:00:00Z",
  "predicted_density": "HIGH",
  "train_count_estimate": 12,
  "confidence": 0.79,
  "model_name": "traffic_baseline_v1",
  "model_version": "1.0.0",
  "prediction_basis": "SYNTHETIC_PROTOTYPE"
}
```

---

## 6. Model Version & Registry Metadata

Every prediction response must carry:

| Field | Description |
|-------|-------------|
| `model_name` | Unique model identifier |
| `model_version` | Semantic version string |
| `feature_version` | Feature schema version |
| `prediction_basis` | Always `"SYNTHETIC_PROTOTYPE"` in Phase 3A |

---

## 7. Future Optimizer Consumption

The Optimization Engine (Phase 3B/4) will consume AI outputs as follows:

```
MaintenanceTask.estimated_duration_mins
    → REPLACED BY → DurationPrediction.predicted_duration_minutes
                     DurationPrediction.lower_bound_minutes
                     DurationPrediction.upper_bound_minutes

Risk-aware task ordering:
    ← OverrunRiskPrediction.overrun_probability
    ← AssetRiskAssessment.risk_score

Block window selection:
    ← TrafficForecast.predicted_density (reduces false-positive opportunity selection)
```

The domain model (Asset, Task, Opportunity) is **never modified** by AI predictions.
