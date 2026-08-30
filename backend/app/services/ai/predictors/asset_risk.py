"""
Asset Risk Predictor — transparent weighted composite scoring.

This is NOT an ML model. It uses a fully auditable weighted formula to compute
a maintenance risk score for an asset, based on condition, criticality, and
overdue status.

Rationale: For a prototype safety-adjacent score, a transparent formula is
preferable to a black-box model. Every decision factor is visible to the operator.

THIS IS NOT an official Indian Railways safety classification.
"""
from typing import Dict, Optional

from app.services.ai import FEATURE_VERSION, PREDICTION_BASIS
from app.services.ai.features.extractor import extract_asset_risk_features

# Configurable prototype weight configuration
ASSET_RISK_WEIGHTS = {
    "condition_risk_w": 0.40,       # Weight for (10 - condition_score) / 9
    "criticality_w": 0.35,          # Weight for criticality_index / 10
    "overdue_penalty_w": 0.25,      # Weight for overdue + open task burden
}

# Prototype risk level thresholds (configurable, not official)
ASSET_RISK_THRESHOLDS = {
    "LOW": 3.5,
    "MEDIUM": 6.0,
    "HIGH": 8.0,
}


def _score_to_risk_level(score: float) -> str:
    if score < ASSET_RISK_THRESHOLDS["LOW"]:
        return "LOW"
    elif score < ASSET_RISK_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    elif score < ASSET_RISK_THRESHOLDS["HIGH"]:
        return "HIGH"
    else:
        return "CRITICAL"


def assess_asset_risk(
    asset_features: Dict[str, float],
    asset_id: str,
) -> Dict:
    """
    Compute asset maintenance risk score from pre-extracted features.

    Formula:
        condition_risk   = (10 - condition_score) / 9 * 10
        criticality_part = criticality_index
        overdue_part     = min(10, overdue_task_count * 1.5 + (max(0, -days_until_due) / 10))
        risk_score       = w1 * condition_risk + w2 * criticality_part + w3 * overdue_part
    """
    condition_score = asset_features.get("condition_score", 7.0)
    criticality = asset_features.get("criticality_index", 5.0)
    days_until_due = asset_features.get("days_until_due", 0.0)
    overdue_task_count = asset_features.get("overdue_task_count", 0.0)

    # Component scores (all normalised to [0, 10])
    condition_risk = max(0.0, (10.0 - condition_score) / 9.0 * 10.0)
    criticality_part = criticality  # Already 1-10
    overdue_part = min(10.0, overdue_task_count * 1.5 + max(0.0, -days_until_due) / 10.0)

    w = ASSET_RISK_WEIGHTS
    risk_score = (
        w["condition_risk_w"] * condition_risk
        + w["criticality_w"] * criticality_part
        + w["overdue_penalty_w"] * overdue_part
    )
    risk_score = round(min(10.0, max(0.0, risk_score)), 2)
    risk_level = _score_to_risk_level(risk_score)

    # Confidence: formula-based scoring has high confidence in weights but
    # limited confidence in synthetic asset data quality
    confidence = 0.82

    return {
        "asset_id": asset_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": confidence,
        "score_components": {
            "condition_risk": round(condition_risk, 2),
            "criticality_weight": round(criticality_part, 2),
            "overdue_penalty": round(overdue_part, 2),
        },
        "weight_config": ASSET_RISK_WEIGHTS,
        "model_name": "asset_risk_weighted",
        "model_version": "1.0.0",
        "feature_version": FEATURE_VERSION,
        "prediction_basis": PREDICTION_BASIS,
    }
