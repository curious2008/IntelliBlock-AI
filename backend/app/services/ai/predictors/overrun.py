"""
Overrun Risk Predictor — inference-only layer for maintenance task overrun
probability estimation.

Returns a probability + risk level before a task is assigned to a block window.
"""
from typing import Dict

import numpy as np

from app.services.ai import FEATURE_VERSION, PREDICTION_BASIS
from app.services.ai.features.extractor import DURATION_FEATURE_NAMES, features_to_vector
from app.services.ai.features.validator import validate_features, FeatureValidationError
from app.services.ai.registry.model_store import model_store, ModelNotReadyError


MODEL_NAME = "overrun_gbc"

# Configurable prototype risk thresholds (not official Railway thresholds)
RISK_THRESHOLDS = {
    "LOW": 0.20,
    "MEDIUM": 0.50,
    "HIGH": 0.70,
}


def _probability_to_risk_level(prob: float) -> str:
    if prob < RISK_THRESHOLDS["LOW"]:
        return "LOW"
    elif prob < RISK_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    elif prob < RISK_THRESHOLDS["HIGH"]:
        return "HIGH"
    else:
        return "CRITICAL"


def predict_overrun_risk(
    features: Dict[str, float],
    task_id: str,
) -> Dict:
    """
    Predict overrun probability for a maintenance task before execution.

    Returns a dict conforming to AI_CONTRACT.md §3.
    """
    validate_features(features, required_feature_names=DURATION_FEATURE_NAMES)

    pipeline = model_store.get_pipeline(MODEL_NAME)
    version = model_store.get_model_version(MODEL_NAME)

    feature_vector = np.array(
        [features_to_vector(features, DURATION_FEATURE_NAMES)], dtype=np.float64
    )

    overrun_prob = float(pipeline.predict_proba(feature_vector)[0][1])
    overrun_prob = round(max(0.0, min(1.0, overrun_prob)), 4)
    risk_level = _probability_to_risk_level(overrun_prob)

    # GBC probability calibration is generally good; confidence reflects class separation
    confidence = round(abs(overrun_prob - 0.5) * 2, 3)  # 0 near 0.5, 1 near 0 or 1

    return {
        "task_id": task_id,
        "overrun_probability": overrun_prob,
        "risk_level": risk_level,
        "confidence": confidence,
        "model_name": MODEL_NAME,
        "model_version": version,
        "feature_version": FEATURE_VERSION,
        "prediction_basis": PREDICTION_BASIS,
    }
