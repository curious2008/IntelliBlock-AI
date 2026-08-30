"""
Model Trainer — trains Duration and Overrun Risk models offline.

IMPORTANT:
  - Training is SEPARATE from inference. Models are trained once by running
    scripts/train_models.py and saved to the model registry.
  - API endpoints NEVER trigger retraining.
  - Evaluation metrics are reported vs. baseline models before claiming ML adds value.
"""
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.metrics import (
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.services.ai.features.extractor import DURATION_FEATURE_NAMES
from app.services.ai.training.simulator import generate_training_examples

# ─── Registry paths ──────────────────────────────────────────────────────────
_MODELS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "..", "..", "models"
)


def _ensure_models_dir() -> str:
    path = os.path.abspath(_MODELS_DIR)
    os.makedirs(path, exist_ok=True)
    return path


# ─── Baselines ────────────────────────────────────────────────────────────────

def _duration_baseline_mae(y_test: np.ndarray, y_train: np.ndarray) -> float:
    """Median baseline: predict global median of training set for every example."""
    median_val = float(np.median(y_train))
    preds = np.full(len(y_test), median_val)
    return float(mean_absolute_error(y_test, preds))


def _overrun_baseline_predictions(X_test: np.ndarray) -> np.ndarray:
    """
    Weighted-score baseline for overrun:
    score = 0.4*(priority/10) + 0.3*overdue_flag + 0.3*(1-condition/10)
    Predict overrun=1 if score > 0.40
    """
    priority_idx = DURATION_FEATURE_NAMES.index("priority_score")
    overdue_idx = DURATION_FEATURE_NAMES.index("overdue_flag")
    cond_idx = DURATION_FEATURE_NAMES.index("asset_condition_score")

    priority_vals = X_test[:, priority_idx] / 10.0
    overdue_vals = X_test[:, overdue_idx]
    cond_vals = 1.0 - (X_test[:, cond_idx] / 10.0)

    scores = 0.4 * priority_vals + 0.3 * overdue_vals + 0.3 * cond_vals
    return (scores > 0.40).astype(int)


# ─── Duration Model Training ──────────────────────────────────────────────────

def train_duration_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    record_count: int,
    training_seed: int = 42,
) -> Dict[str, Any]:
    """
    Train RandomForestRegressor for duration prediction.
    Reports metrics vs. baseline before saving.
    """
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            min_samples_leaf=3,
            random_state=training_seed,
            n_jobs=-1,
        )),
    ])

    # 5-fold cross-validation on training data
    cv_mae_scores = cross_val_score(
        pipeline, X_train, y_train,
        scoring="neg_mean_absolute_error", cv=5,
    )
    cv_mae = float(-cv_mae_scores.mean())

    # Train on full training set, evaluate on held-out test set
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    # Baseline comparison
    baseline_mae = _duration_baseline_mae(y_test, y_train)

    metrics = {
        "cv_mae_mean": round(cv_mae, 2),
        "test_mae_mins": round(mae, 2),
        "test_rmse_mins": round(rmse, 2),
        "test_r2": round(r2, 4),
        "baseline_median_mae_mins": round(baseline_mae, 2),
        "improvement_over_baseline_mins": round(baseline_mae - mae, 2),
        "note": "SYNTHETIC_PROTOTYPE only — does not represent real IR performance",
    }

    models_dir = _ensure_models_dir()
    version = "1.0.0"
    name = "duration_rf"

    joblib.dump(pipeline, os.path.join(models_dir, f"{name}_v{version}.joblib"))

    meta = {
        "model_name": name,
        "model_version": version,
        "feature_version": "1.0",
        "feature_names": DURATION_FEATURE_NAMES,
        "training_seed": training_seed,
        "record_count": record_count,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "metrics": metrics,
        "prediction_basis": "SYNTHETIC_PROTOTYPE",
    }
    with open(os.path.join(models_dir, f"{name}_v{version}_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[TRAINING] Duration model saved: {name}_v{version}")
    print(f"  Test MAE: {mae:.1f} mins | Baseline MAE: {baseline_mae:.1f} mins | Delta={baseline_mae - mae:.1f}")
    print(f"  Test RMSE: {rmse:.1f} | R2: {r2:.3f}")

    return meta


# ─── Overrun Risk Model Training ──────────────────────────────────────────────

def train_overrun_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    record_count: int,
    training_seed: int = 42,
) -> Dict[str, Any]:
    """
    Train GradientBoostingClassifier for overrun risk prediction.
    Reports metrics vs. baseline.
    """
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("gbc", GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=4,
            random_state=training_seed,
        )),
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    try:
        auc = float(roc_auc_score(y_test, y_prob))
    except ValueError:
        auc = 0.5

    # Baseline comparison
    baseline_pred = _overrun_baseline_predictions(X_test)
    baseline_f1 = float(f1_score(y_test, baseline_pred, zero_division=0))

    metrics = {
        "test_precision": round(precision, 4),
        "test_recall": round(recall, 4),
        "test_f1": round(f1, 4),
        "test_roc_auc": round(auc, 4),
        "baseline_f1": round(baseline_f1, 4),
        "improvement_f1_over_baseline": round(f1 - baseline_f1, 4),
        "note": "SYNTHETIC_PROTOTYPE only — does not represent real IR performance",
    }

    models_dir = _ensure_models_dir()
    version = "1.0.0"
    name = "overrun_gbc"

    joblib.dump(pipeline, os.path.join(models_dir, f"{name}_v{version}.joblib"))

    meta = {
        "model_name": name,
        "model_version": version,
        "feature_version": "1.0",
        "feature_names": DURATION_FEATURE_NAMES,
        "training_seed": training_seed,
        "record_count": record_count,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "metrics": metrics,
        "prediction_basis": "SYNTHETIC_PROTOTYPE",
    }
    with open(os.path.join(models_dir, f"{name}_v{version}_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[TRAINING] Overrun model saved: {name}_v{version}")
    print(f"  Test F1: {f1:.3f} | Baseline F1: {baseline_f1:.3f} | Delta={f1 - baseline_f1:.3f}")
    print(f"  Precision: {precision:.3f} | Recall: {recall:.3f} | AUC: {auc:.3f}")

    return meta


# ─── Master training orchestrator ─────────────────────────────────────────────

def run_full_training_pipeline(seed: int = 42) -> Dict[str, Any]:
    """
    Generate training data from synthetic scenarios and train all models.
    Returns a summary of training results.
    """
    print("[TRAINING] Generating synthetic training data from all 8 scenarios...")
    X_list, y_dur, y_overrun = generate_training_examples(
        scenario_types=[
            "NORMAL",
            "HEAVY_TRAFFIC",
            "HIGH_MAINTENANCE_DEMAND",
            "RESOURCE_SHORTAGE",
            "MULTI_DEPARTMENT_OVERLAP",
            "MAINTENANCE_OVERRUN",
            "EMERGENCY_MAINTENANCE",
            "COMBINED_STRESS_TEST",
        ],
        seed=seed,
    )

    X = np.array(X_list, dtype=np.float64)
    y_dur_arr = np.array(y_dur, dtype=np.float64)
    y_overrun_arr = np.array(y_overrun, dtype=np.int32)
    n = len(X)

    print(f"[TRAINING] Total training examples: {n}")

    overrun_rate = float(np.mean(y_overrun_arr))
    print(f"[TRAINING] Overrun rate: {overrun_rate:.1%} (target: 40-60% for class balance)")

    # Stratified hold-out test set (20%) — preserves overrun class ratio in both splits
    X_train, X_test, y_dur_train, y_dur_test, y_ov_train, y_ov_test = train_test_split(
        X, y_dur_arr, y_overrun_arr,
        test_size=0.20,
        random_state=seed,
        stratify=y_overrun_arr,  # Ensures balanced class ratio in train + test
    )

    print(f"[TRAINING] Train: {len(X_train)} | Test: {len(X_test)}")

    dur_meta = train_duration_model(X_train, y_dur_train, X_test, y_dur_test, n, seed)
    ov_meta = train_overrun_model(X_train, y_ov_train, X_test, y_ov_test, n, seed)

    return {
        "training_complete": True,
        "total_examples": n,
        "train_examples": len(X_train),
        "test_examples": len(X_test),
        "duration_model": dur_meta,
        "overrun_model": ov_meta,
    }
