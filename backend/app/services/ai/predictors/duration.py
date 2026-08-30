"""
Duration Predictor — inference-only layer for maintenance task duration prediction.

This module:
  - Receives a pre-extracted, validated feature dictionary
  - Calls the loaded model pipeline for inference
  - Returns a typed DurationPrediction result
  - NEVER queries the database
  - NEVER retrains models
"""
from datetime import datetime
from typing import Dict, Optional

import numpy as np

from app.services.ai import FEATURE_VERSION, PREDICTION_BASIS
from app.services.ai.features.extractor import DURATION_FEATURE_NAMES, features_to_vector
from app.services.ai.features.validator import validate_features, FeatureValidationError
from app.services.ai.registry.model_store import model_store, ModelNotReadyError


MODEL_NAME = "duration_rf"


def predict_duration(
    features: Dict[str, float],
    task_id: str,
) -> Dict:
    """
    Predict task duration from a validated feature dictionary.

    Returns a dict conforming to AI_CONTRACT.md §2.
    Raises ModelNotReadyError if the model hasn't been trained.
    Raises FeatureValidationError if features fail quality checks.
    """
    # Validate features (also checks for leakage)
    validate_features(features, required_feature_names=DURATION_FEATURE_NAMES)

    pipeline = model_store.get_pipeline(MODEL_NAME)
    version = model_store.get_model_version(MODEL_NAME)

    feature_vector = np.array(
        [features_to_vector(features, DURATION_FEATURE_NAMES)], dtype=np.float64
    )

    # Main prediction
    predicted_duration = float(pipeline.predict(feature_vector)[0])
    predicted_duration = max(1.0, round(predicted_duration, 0))

    # Uncertainty range: use RF leaf variance across trees
    rf_model = pipeline.named_steps.get("rf")
    if rf_model is not None and hasattr(rf_model, "estimators_"):
        scaler = pipeline.named_steps.get("scaler")
        scaled_x = scaler.transform(feature_vector) if scaler else feature_vector
        tree_preds = np.array([
            est.predict(scaled_x)[0] for est in rf_model.estimators_
        ])
        std = float(tree_preds.std())
        lower_bound = max(1.0, round(predicted_duration - 1.28 * std, 0))  # ~80% interval
        upper_bound = round(predicted_duration + 1.28 * std, 0)
        confidence = round(max(0.4, min(0.95, 1.0 - std / (predicted_duration + 1e-6))), 3)
    else:
        # Fallback: use task min/max range from features
        est_dur = features.get("estimated_duration_mins", predicted_duration)
        dur_range = features.get("duration_range_mins", 30.0)
        lower_bound = max(1.0, round(est_dur - dur_range * 0.5, 0))
        upper_bound = round(est_dur + dur_range * 0.5, 0)
        confidence = 0.65

    return {
        "task_id": task_id,
        "predicted_duration_minutes": int(predicted_duration),
        "lower_bound_minutes": int(lower_bound),
        "upper_bound_minutes": int(upper_bound),
        "confidence": confidence,
        "model_name": MODEL_NAME,
        "model_version": version,
        "feature_version": FEATURE_VERSION,
        "prediction_basis": PREDICTION_BASIS,
    }
