"""
AI API Endpoints — /api/v1/ai/

All ML logic is delegated to the AI service layer (services/ai/).
Route handlers only: validate input → call service → return response.
No ML code inside this file.
"""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.errors import AppException
from app.schemas.ai import (
    AssetRiskRequest, AssetRiskResponse,
    DurationPredictionRequest, DurationPredictionResponse,
    ModelStatusResponse,
    OverrunRiskRequest, OverrunRiskResponse,
)
from app.services.ai.features.extractor import (
    FREIGHT_DENSITY_CODES,
    SCENARIO_TYPE_CODES,
    TASK_TYPE_CODES,
    DEPARTMENT_CODES,
    extract_asset_risk_features,
)
from app.services.ai.features.validator import FeatureValidationError
from app.services.ai.predictors.duration import predict_duration
from app.services.ai.predictors.overrun import predict_overrun_risk
from app.services.ai.predictors.asset_risk import assess_asset_risk
from app.services.ai.registry.model_store import model_store, ModelNotReadyError

router = APIRouter()


def _build_task_features(req) -> dict:
    """Build a feature dictionary from an API request object."""
    return {
        # Asset
        "asset_condition_score": req.asset_condition_score,
        "asset_criticality_index": req.asset_criticality_index,
        "asset_age_years": req.asset_age_years,
        "days_since_last_maintenance": req.days_since_last_maintenance,
        "days_until_due": req.days_until_due,
        # Task
        "task_type_code": float(TASK_TYPE_CODES.get(req.task_type, len(TASK_TYPE_CODES))),
        "department_code": float(DEPARTMENT_CODES.get(req.department, 0)),
        "priority_score": req.priority_score,
        "estimated_duration_mins": float(req.estimated_duration_mins),
        "duration_range_mins": float(req.maximum_duration_mins - req.minimum_duration_mins),
        "is_emergency": 1.0 if req.is_emergency else 0.0,
        "overdue_flag": 1.0 if req.days_until_due < 0 else 0.0,
        "dependency_count": float(req.dependency_count),
        "resource_count": float(req.resource_count),
        # Operational
        "train_density_24h": float(req.train_density_24h),
        "freight_density_code": float(FREIGHT_DENSITY_CODES.get(req.freight_density, 1)),
        "best_opportunity_duration_mins": float(req.best_opportunity_duration_mins),
        "scenario_type_code": float(SCENARIO_TYPE_CODES.get(req.scenario_type, 0)),
        # Resource
        "crew_available_count": float(req.crew_available_count),
        "machine_available_count": float(req.machine_available_count),
    }


@router.post(
    "/ai/predict-duration",
    response_model=DurationPredictionResponse,
    summary="Predict maintenance task duration",
    description=(
        "Returns AI-estimated task duration with confidence range. "
        "SYNTHETIC PROTOTYPE ONLY — not official Railway predictions."
    ),
)
def predict_task_duration(req: DurationPredictionRequest):
    try:
        features = _build_task_features(req)
        result = predict_duration(features, req.task_id)
        return DurationPredictionResponse(**result)
    except ModelNotReadyError as e:
        raise AppException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="MODEL_NOT_READY",
            message=str(e),
            details={"hint": "Run 'python scripts/train_models.py' to train models."},
        )
    except FeatureValidationError as e:
        raise AppException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="FEATURE_VALIDATION_ERROR",
            message=str(e),
            details={"issues": e.issues},
        )
    except Exception as e:
        raise AppException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PREDICTION_ERROR",
            message=f"Duration prediction failed: {str(e)}",
            details={},
        )


@router.post(
    "/ai/predict-overrun-risk",
    response_model=OverrunRiskResponse,
    summary="Predict overrun probability for a maintenance task",
    description=(
        "Returns probability that the task will exceed its planned duration. "
        "SYNTHETIC PROTOTYPE ONLY."
    ),
)
def predict_task_overrun_risk(req: OverrunRiskRequest):
    try:
        features = _build_task_features(req)
        result = predict_overrun_risk(features, req.task_id)
        return OverrunRiskResponse(**result)
    except ModelNotReadyError as e:
        raise AppException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="MODEL_NOT_READY",
            message=str(e),
            details={"hint": "Run 'python scripts/train_models.py' to train models."},
        )
    except FeatureValidationError as e:
        raise AppException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="FEATURE_VALIDATION_ERROR",
            message=str(e),
            details={"issues": e.issues},
        )
    except Exception as e:
        raise AppException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PREDICTION_ERROR",
            message=f"Overrun risk prediction failed: {str(e)}",
            details={},
        )


@router.post(
    "/ai/assess-maintenance-risk",
    response_model=AssetRiskResponse,
    summary="Assess asset maintenance risk score",
    description=(
        "Returns a transparent weighted risk score for an asset. "
        "NOT an official Railway safety classification. SYNTHETIC PROTOTYPE ONLY."
    ),
)
def assess_maintenance_risk(req: AssetRiskRequest):
    try:
        asset_features = {
            "condition_score": req.condition_score,
            "criticality_index": req.criticality_index,
            "days_since_last_maintenance": req.days_since_last_maintenance,
            "days_until_due": req.days_until_due,
            "open_task_count": float(req.open_task_count),
            "overdue_task_count": float(req.overdue_task_count),
        }
        result = assess_asset_risk(asset_features, req.asset_id)
        return AssetRiskResponse(**result)
    except Exception as e:
        raise AppException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PREDICTION_ERROR",
            message=f"Asset risk assessment failed: {str(e)}",
            details={},
        )


@router.get(
    "/ai/model-status",
    response_model=ModelStatusResponse,
    summary="Get AI model registry status",
    description="Lists all registered models, their versions, training status, and metrics.",
)
def get_model_status():
    model_list = model_store.list_models()
    from app.schemas.ai import ModelStatusEntry
    return ModelStatusResponse(
        models=[ModelStatusEntry(**m) for m in model_list]
    )
