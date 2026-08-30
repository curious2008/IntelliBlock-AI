# AI Pipeline Architecture — SIH26027 IntelliBlock AI

**Document Type:** Engineering Architecture  
**Phase:** 3A — Data Pipeline & Feature Engineering  
**Version:** 1.0.0

> All models described here are trained on **synthetic scenario data only**. Performance metrics do not represent real Indian Railways operational data.

---

## 1. Pipeline Overview

```
┌──────────────────────────────────────────────────┐
│               DOMAIN DATA LAYER                  │
│  Asset · Task · Train · Resource · Opportunity   │
│  FreightForecast · ExecutionRecord · Scenario    │
└────────────────────┬─────────────────────────────┘
                     │ domain entities (no raw SQL)
                     ▼
┌──────────────────────────────────────────────────┐
│           FEATURE ENGINEERING LAYER              │
│  services/ai/features/extractor.py               │
│  • Asset features    • Task features             │
│  • Operational       • Resource features         │
│  services/ai/features/validator.py               │
│  • Missing values    • Range checks              │
│  • Leakage guard     • Type checks               │
└────────────────────┬─────────────────────────────┘
                     │ validated feature dict / DataFrame
                     ▼
┌──────────────────────────────────────────────────┐
│         SYNTHETIC TRAINING SIMULATOR             │
│  services/ai/training/simulator.py               │
│  • Generates (features, target) pairs            │
│  • Controlled noise → non-trivial targets        │
│  • Seeded & reproducible                         │
└────────────────────┬─────────────────────────────┘
                     │ training DataFrame (train/val/test)
                     ▼
┌──────────────────────────────────────────────────┐
│              MODEL TRAINING (OFFLINE)            │
│  services/ai/training/trainer.py                 │
│  scripts/train_models.py                         │
│                                                  │
│  Duration Model:     RandomForestRegressor       │
│  Overrun Model:      GradientBoostingClassifier  │
│  Asset Risk:         Weighted composite (no ML)  │
│  Baseline:           Median/rule-based           │
└────────────────────┬─────────────────────────────┘
                     │ serialised .joblib artefacts
                     ▼
┌──────────────────────────────────────────────────┐
│              MODEL REGISTRY (Disk)               │
│  services/ai/registry/model_store.py             │
│  models/<name>_<version>.joblib                  │
│  models/<name>_<version>_meta.json               │
└────────────────────┬─────────────────────────────┘
                     │ loaded once at API startup
                     ▼
┌──────────────────────────────────────────────────┐
│           INFERENCE / PREDICTOR LAYER            │
│  services/ai/predictors/duration.py              │
│  services/ai/predictors/overrun.py               │
│  services/ai/predictors/asset_risk.py            │
│  • Stateless, fast, no DB access                 │
│  • Returns typed Pydantic prediction response    │
└────────────────────┬─────────────────────────────┘
                     │ prediction response
                     ▼
┌──────────────────────────────────────────────────┐
│              AI API ENDPOINTS                    │
│  api/v1/endpoints/ai.py                          │
│  POST /ai/predict-duration                       │
│  POST /ai/predict-overrun-risk                   │
│  POST /ai/assess-maintenance-risk                │
│  GET  /ai/model-status                           │
└──────────────────────────────────────────────────┘
```

---

## 2. Feature Groups

### 2.1 Asset Features

| Feature Name | Type | Rationale | Source |
|---|---|---|---|
| `asset_condition_score` | float | Lower condition → longer duration, higher risk | Asset.condition_score |
| `asset_criticality_index` | float | Higher criticality → prioritised but also more complex | Asset.criticality_index |
| `asset_age_years` | float | Older assets tend to require longer interventions | Derived from installation_date |
| `days_since_last_maintenance` | float | Long gap → more deterioration, longer work | Derived from last_maintenance_date |
| `days_until_due` | float | Negative = overdue, drives urgency & complexity | Derived from next_due_date |

### 2.2 Task Features

| Feature Name | Type | Rationale | Source |
|---|---|---|---|
| `task_type_code` | int | Different task types have very different durations | Encoded MaintenanceTask.task_type |
| `department_code` | int | ENGG/ST/TRD have different work profiles | Encoded MaintenanceTask.department |
| `priority_score` | float | High-priority tasks often involve more scope | MaintenanceTask.priority_score |
| `estimated_duration_mins` | int | Baseline planned estimate | MaintenanceTask.estimated_duration_mins |
| `duration_range_mins` | int | max_duration - min_duration: proxy for uncertainty | Derived |
| `is_emergency` | int | Emergency tasks often have accelerated but unpredictable execution | MaintenanceTask.is_emergency |
| `overdue_flag` | int | Overdue tasks are often more degraded → longer | Derived from due_date |
| `dependency_count` | int | More prerequisites → more coordination overhead | len(prerequisite_task_ids) |
| `resource_count` | int | More resources required → more complex coordination | len(required_resources) |

### 2.3 Operational Features

| Feature Name | Type | Rationale | Source |
|---|---|---|---|
| `train_density_24h` | int | More trains → tighter windows → rushed execution | Count of TrainMovement on corridor |
| `freight_density_code` | int | HIGH freight → less flexibility for work | Encoded FreightForecast density |
| `best_opportunity_duration_mins` | int | Larger gap → less time pressure | Max BlockOpportunity duration on section |
| `scenario_type_code` | int | Scenario type correlates with complexity patterns | Encoded ScenarioRun.scenario_type |

### 2.4 Resource Features

| Feature Name | Type | Rationale | Source |
|---|---|---|---|
| `crew_available_count` | int | More crew → potential for parallel work | Count of CREW resources for department |
| `machine_available_count` | int | Fewer machines → resource contention bottleneck | Count of MACHINE resources for dept |

---

## 3. Data Leakage Prevention

### What is Leakage?
Using information only available **after** the event being predicted.

### Excluded Features (Post-Execution Data)

| Excluded Field | Why Excluded |
|---|---|
| `ExecutionRecord.actual_duration_mins` | Only known after task completion |
| `ExecutionRecord.overrun_mins` | Only known after execution ends |
| `ExecutionRecord.actual_start` | Only known at execution time |
| `ExecutionRecord.completion_status` | Only known after execution |

ExecutionRecord **is** used as the **training target source** during training, but never as an input feature.

### Leakage Test
`features/validator.py` explicitly checks that no field from `ExecutionRecord` appears in the computed feature dictionary before it is passed to a model.

---

## 4. Synthetic Training Data Simulator

### Target Generation Methodology (`simulator.py`)

The simulated `actual_duration_mins` target is generated using a multi-factor formula designed to produce a non-trivial, learnable relationship:

```
base = estimated_duration_mins

# Asset degradation factor (worse condition → longer)
condition_factor = 1.0 + 0.15 * max(0, (5.0 - asset_condition_score) / 5.0)

# Complexity / resource availability factor
resource_factor = 1.0 + 0.10 * max(0, (3 - crew_available_count) / 3)

# Overdue burden (deferred work is harder)
overdue_factor = 1.0 + 0.08 * overdue_flag

# Traffic pressure (less time → rushed → more errors)
traffic_factor = 1.0 + 0.05 * (train_density_24h / 20.0)

# Controlled noise (normal, scale = 0.08 * base, seed-reproducible)
noise ~ N(0, 0.08 * base)

actual_duration = base * condition_factor * resource_factor * overdue_factor * traffic_factor + noise
actual_duration = clamp(actual_duration, min_duration, max_duration * 1.5)
```

**Overrun binary label:** `overrun = 1 if actual_duration > estimated_duration_mins else 0`

This relationship is **documented, not arbitrary**, and introduces genuine non-linear interactions between features that a model can learn.

---

## 5. Baseline Models

### Duration Baseline
- Compute median `actual_duration_mins` per `(task_type, department)` group from training set
- For unseen combinations: global median

### Overrun Risk Baseline
- Transparent weighted score: `0.4 * (priority_score/10) + 0.3 * overdue_flag + 0.3 * (1 - asset_condition_score/10)`
- Threshold at 0.40 for binary overrun prediction

### Asset Risk Baseline
- Fully explicit: `risk = w1*(10-condition_score) + w2*criticality_index + w3*overdue_penalty`
- No hidden ML; completely auditable

---

## 6. ML Models & Candidate Evaluation (Phase 3B)

### 6.1 Duration Prediction Model Comparison

| Candidate Model | Configuration | 5-Fold CV MAE (mins) | Test MAE (mins) | Test RMSE (mins) | Test $R^2$ | Baseline Median MAE (mins) | Delta vs Baseline |
|---|---|---|---|---|---|---|---|
| **RandomForestRegressor (Selected)** | `n_estimators=200, max_depth=10, min_samples_leaf=3` | **10.26** | **9.98** | **14.41** | **0.9500** | 51.71 | **-41.73 mins** |
| GradientBoostingRegressor | `n_estimators=150, max_depth=4, lr=0.08` | 10.85 | 10.92 | 15.63 | 0.9412 | 51.71 | -40.79 mins |
| HistGradientBoostingRegressor | `max_iter=150, max_depth=4, lr=0.08` | 10.42 | 10.24 | 14.81 | 0.9472 | 51.71 | -41.47 mins |
| Baseline (Median) | Median per department | - | 51.71 | 64.39 | 0.0000 | 51.71 | 0.00 mins |

**Selection Rationale:** `RandomForestRegressor` provides the lowest test MAE (9.98 mins) and highest $R^2$ (0.9500), while natively supporting uncertainty intervals via tree leaf-node variance.

### 6.2 Overrun Risk Model Comparison & Scientific Findings

| Candidate Model | Configuration | Test Precision | Test Recall | Test F1 | Test ROC-AUC | Baseline F1 | Findings / Status |
|---|---|---|---|---|---|---|---|
| **Baseline (Weighted Rule)** | `score = 0.4*prio + 0.3*overdue + 0.3*(1-cond)` | 0.6111 | 0.5000 | **0.5500** | - | 0.5500 | Simple heuristic baseline |
| **Calibrated RandomForest (Selected for Probabilities)** | `n_estimators=200, max_depth=5, CalibratedClassifierCV` | 0.4516 | 0.6364 | 0.5283 | **0.7453** | 0.5500 | **Strong continuous ranking / calibration (AUC=0.745)** |
| GradientBoostingClassifier (v1.0.0) | `n_estimators=150, max_depth=4, lr=0.08` | 0.6154 | 0.3636 | 0.4571 | 0.6381 | 0.5500 | Conservative predictions at default 0.5 threshold |
| HistGradientBoostingClassifier | `max_iter=100, max_depth=4, lr=0.05` | 0.4615 | 0.5455 | 0.5000 | 0.7127 | 0.5500 | Moderate ranking capability |

**Scientific Conclusion on Overrun Prediction:**
1. On synthetic scenario datasets generated with controlled Gaussian noise ($N(0, 0.10 \times \text{base})$), the heuristic baseline performs competitively on binary threshold F1 because the synthetic target generation formula itself has strong linear components.
2. However, the Machine Learning models (specifically Calibrated Random Forest and Gradient Boosting) produce **smooth, well-calibrated continuous probabilities ($ROC\text{-}AUC = 0.745$)**, which are far more informative for continuous risk scoring in the future optimization and decision-support engines than a coarse binary rule.
3. In accordance with the project integrity principles, we document that the binary F1 score of ML is comparable to the heuristic baseline, and the primary value of the ML classifier is in calibrated probability estimation and multi-dimensional feature ranking.

### 6.3 Asset Risk Model
- **Transparent Weighted Formula:** Retained as an explainable, deterministic composite index ($0.0 \text{--} 10.0$) ensuring complete transparency for safety-adjacent decision support.

---

## 7. Train / Validation / Test Split

- **Stratified Hold-Out Test Set (20%):** 75 held-out records stratified on `overrun_label` across all 8 synthetic scenarios.
- **5-Fold Cross Validation:** Evaluated strictly on the 80% training set (296 records).
- **Master Seed:** `seed=42` ensures exact bitwise reproducibility across training runs.

---

## 8. Model Metrics Summary

### Duration Model (`duration_rf_v1.0.0`)
- **Test MAE:** 9.98 minutes
- **Test RMSE:** 14.41 minutes
- **Test $R^2$:** 0.9500
- **Baseline MAE:** 51.71 minutes (Improvement: +41.73 minutes)

### Overrun Risk Model (`overrun_gbc_v1.0.0`)
- **Test ROC-AUC:** 0.7453 (ranking ability)
- **Test F1:** 0.5283
- **Test Precision:** 0.4516
- **Test Recall:** 0.6364
- **Baseline F1:** 0.5500

---

## 9. Model Registry & Reproducibility

Each saved model consists of:
- `models/{name}_v{version}.joblib` — Serialized scikit-learn Pipeline (scaler + model)
- `models/{name}_v{version}_meta.json` — Metadata (training seed, timestamp, exact metrics, feature names)

Running `python scripts/train_models.py --seed 42` twice produces identical models and evaluation metrics within machine numerical precision.

---

## 10. Limitations

1. **Synthetic data only:** All metrics reflect synthetic scenario performance. Real-world performance will differ significantly.
2. **Small dataset:** Training data is generated from 8 scenarios × ~45 tasks (371 records). A real deployment would require thousands of historical execution records.
3. **No temporal dynamics:** The simulator does not model seasonal patterns, monsoon effects, or zone-specific maintenance cycles.
4. **Simulated targets:** `actual_duration` is computed from a documented multi-factor formula, not real execution data.
5. **No external data:** Weather, track geometry surveys, and ultrasonic test results (all potentially available in real IR systems) are not modelled in this prototype.

