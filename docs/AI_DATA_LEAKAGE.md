# AI Feature Leakage & Temporal Evaluation Audit — SIH26027 IntelliBlock AI

**Document Type:** AI Governance & Scientific Validation  
**Phase:** 3B — Model Improvement, Evaluation & Data-Contract Hardening  
**Status:** Validated  
**Version:** 1.1.0  

> [!IMPORTANT]
> All datasets, features, and model metrics described herein originate from **synthetic prototype scenario simulations**. They do not represent operational Indian Railways data.

---

## 1. Executive Summary & Leakage Policy

In railway maintenance block planning, predictive models inform schedule optimization *before* line possessions are granted and work commences. A model that consumes features only observable during or after task execution (data leakage) produces artificially inflated evaluation metrics but fails catastrophically in operational practice.

IntelliBlock enforces a **Strict Pre-Execution Information Boundary**:
Any attribute whose value is determined by, updated by, or dependent upon real-time task execution or post-possession reporting is strictly forbidden from the feature pipeline.

```
PLANNING & SCHEDULING TIME (Features Available)
============================================================
✓ Asset age, condition score, criticality index
✓ Due dates & overdue status
✓ Planned nominal duration & range (min/max)
✓ Required resources & crew capacities
✓ Scheduled timetable train density & block opportunities
----------------- STRICT TEMPORAL BOUNDARY -----------------
× Actual start / end times
× Realized execution duration
× Realized overrun minutes
× Actual machine breakdowns / weather disruptions
× Execution completion status (COMPLETED, OVERRUN, FAILED)
============================================================
EXECUTION & REPORTING TIME (Post-Possession Realization)
```

---

## 2. Feature-by-Feature Temporal Availability Audit

| Feature Name | Source Domain Entity | Time of Observation | Temporal Classification | Anti-Leakage Guard |
|---|---|---|---|---|
| `asset_condition_score` | `Asset` | Prior inspection record | **Pre-Execution** | Measured in prior cycle; static during scheduling |
| `asset_criticality_index` | `Asset` | Engineering master data | **Pre-Execution** | Master registry attribute |
| `asset_age_years` | `Asset.installation_date` | Installation record | **Pre-Execution** | Derived from current planning reference timestamp |
| `days_since_last_maintenance` | `Asset.last_maintenance_date` | Historical completion log | **Pre-Execution** | Computed relative to planning reference time |
| `days_until_due` | `Asset.next_due_date` | Work schedule registry | **Pre-Execution** | Negative value indicates overdue; known in advance |
| `task_type_code` | `MaintenanceTask.task_type` | Work order creation | **Pre-Execution** | Fixed categorical request attribute |
| `department_code` | `MaintenanceTask.department` | Work order creation | **Pre-Execution** | ENGG / ST / TRD identifier |
| `priority_score` | `MaintenanceTask.priority_score`| Work order creation | **Pre-Execution** | Engineering priority rating (0–10) |
| `estimated_duration_mins` | `MaintenanceTask` | Work order creation | **Pre-Execution** | Planner's nominal estimated duration |
| `duration_range_mins` | `MaintenanceTask` (max - min) | Work order creation | **Pre-Execution** | Permissible scheduling tolerance range |
| `is_emergency` | `MaintenanceTask.is_emergency` | Work order creation | **Pre-Execution** | Emergency tag assigned at request time |
| `overdue_flag` | Derived (`due_date` vs ref time) | Planning snapshot | **Pre-Execution** | Binary flag derived from scheduled due date |
| `dependency_count` | `MaintenanceTask.prerequisite_task_ids` | Work order graph | **Pre-Execution** | Topological prerequisite count |
| `resource_count` | `MaintenanceTask.required_resources` | Resource demand list | **Pre-Execution** | Machinery/crew requirements count |
| `train_density_24h` | `TrainMovement` | Passenger timetable | **Pre-Execution** | Timetable density on corridor over 24h window |
| `freight_density_code` | `FreightForecast` | Operational forecast | **Pre-Execution** | Scheduled traffic demand estimate |
| `best_opportunity_duration_mins` | `BlockOpportunity` | Timetable gap analyzer | **Pre-Execution** | Maximum available possession window on section |
| `scenario_type_code` | `ScenarioRun.scenario_type` | Operational environment | **Pre-Execution** | Contextual operating environment code |
| `crew_available_count` | `Resource` | Depot roster status | **Pre-Execution** | Available department crew count |
| `machine_available_count` | `Resource` | Machine roster status | **Pre-Execution** | Matching capability machinery count |

---

## 3. Explicitly Excluded Realized Execution Fields

The following fields exist in the database (`ExecutionRecordModel`) or domain layer for historical record-keeping and dynamic replanning, but are **explicitly blocked** from the feature engineering vector in `backend/app/services/ai/features/validator.py`:

```python
FORBIDDEN_LEAKAGE_FIELDS = {
    "actual_duration_mins",
    "actual_start",
    "actual_end",
    "delay_start_mins",
    "overrun_mins",
    "completion_status",
    "variance_reason",
    "resources_utilized",
}
```

If any of these fields are passed to `validate_features()`, a `FeatureValidationError` is immediately raised, terminating inference or training data construction.

---

## 4. Train / Validation / Test Splitting Methodology

To test genuine model generalization across unseen operational environments, evaluation incorporates:

1. **Stratified Hold-Out Test Set (20%):**
   - Stratified on the binary `overrun_label` to preserve minority/majority class proportions in both train and test splits.
   - Strictly isolated: no test-set observations are used in cross-validation, threshold tuning, or hyperparameter selection.
2. **5-Fold Cross Validation within Training Split:**
   - Used for training error estimation (`cv_mae_mean`) and probability threshold selection.
   - Threshold tuning for classification is performed exclusively on cross-validation predictions on the training fold, never on the hold-out test set.
3. **Scenario Diversity:**
   - Training and evaluation data are synthesized across all 8 benchmark scenarios (Normal, Heavy Traffic, High Demand, Resource Shortage, Multi-Department Overlap, Overrun Disruption, Emergency, and Combined Stress Test), ensuring the model encounters diverse operating regimes.

---

## 5. Summary of Audit Findings

- **Data Leakage Risk:** ZERO detected. All 20 features in `DURATION_FEATURE_NAMES` represent information available at planning time.
- **Evaluation Isolation:** The 20% hold-out test set is evaluated exactly once post-training without post-hoc metric tuning.
- **Code Enforcement:** `backend/app/services/ai/features/validator.py` actively validates all inference feature dictionaries against prohibited keys.
