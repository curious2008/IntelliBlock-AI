"""
Pydantic schemas for AI prediction API contracts.
Schemas match exactly the contracts defined in docs/AI_CONTRACT.md.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ─── Duration Prediction ──────────────────────────────────────────────────────

class DurationPredictionRequest(BaseModel):
    """
    Features required for duration prediction.
    All values must be pre-execution — no actual execution data allowed.
    """
    task_id: str = Field(..., json_schema_extra={"example": "TSK-2026-0012"})
    task_type: str = Field(..., json_schema_extra={"example": "TRACK_TAMPING"})
    department: str = Field(..., json_schema_extra={"example": "ENGG"})
    estimated_duration_mins: int = Field(..., ge=1, le=1440)
    minimum_duration_mins: int = Field(..., ge=1, le=1440)
    maximum_duration_mins: int = Field(..., ge=1, le=2880)
    priority_score: float = Field(..., ge=0.0, le=10.0)
    is_emergency: bool = Field(False)
    dependency_count: int = Field(0, ge=0)
    resource_count: int = Field(0, ge=0)
    asset_condition_score: float = Field(..., ge=1.0, le=10.0)
    asset_criticality_index: float = Field(..., ge=1.0, le=10.0)
    asset_age_years: float = Field(5.0, ge=0.0, le=100.0)
    days_since_last_maintenance: float = Field(90.0, ge=0.0)
    days_until_due: float = Field(7.0)
    crew_available_count: int = Field(3, ge=0)
    machine_available_count: int = Field(1, ge=0)
    train_density_24h: int = Field(20, ge=0)
    freight_density: str = Field("MEDIUM", json_schema_extra={"example": "MEDIUM"})
    best_opportunity_duration_mins: int = Field(120, ge=0)
    scenario_type: str = Field("NORMAL", json_schema_extra={"example": "NORMAL"})


class DurationPredictionResponse(BaseModel):
    task_id: str
    predicted_duration_minutes: int
    lower_bound_minutes: int
    upper_bound_minutes: int
    confidence: float
    model_name: str
    model_version: str
    feature_version: str
    prediction_basis: str


# ─── Overrun Risk Prediction ──────────────────────────────────────────────────

class OverrunRiskRequest(BaseModel):
    """Same feature set as duration — model uses identical feature vector."""
    task_id: str = Field(..., json_schema_extra={"example": "TSK-2026-0012"})
    task_type: str = Field(..., json_schema_extra={"example": "TRACK_TAMPING"})
    department: str = Field(..., json_schema_extra={"example": "ENGG"})
    estimated_duration_mins: int = Field(..., ge=1, le=1440)
    minimum_duration_mins: int = Field(..., ge=1, le=1440)
    maximum_duration_mins: int = Field(..., ge=1, le=2880)
    priority_score: float = Field(..., ge=0.0, le=10.0)
    is_emergency: bool = Field(False)
    dependency_count: int = Field(0, ge=0)
    resource_count: int = Field(0, ge=0)
    asset_condition_score: float = Field(..., ge=1.0, le=10.0)
    asset_criticality_index: float = Field(..., ge=1.0, le=10.0)
    asset_age_years: float = Field(5.0, ge=0.0, le=100.0)
    days_since_last_maintenance: float = Field(90.0, ge=0.0)
    days_until_due: float = Field(7.0)
    crew_available_count: int = Field(3, ge=0)
    machine_available_count: int = Field(1, ge=0)
    train_density_24h: int = Field(20, ge=0)
    freight_density: str = Field("MEDIUM", json_schema_extra={"example": "MEDIUM"})
    best_opportunity_duration_mins: int = Field(120, ge=0)
    scenario_type: str = Field("NORMAL", json_schema_extra={"example": "NORMAL"})


class OverrunRiskResponse(BaseModel):
    task_id: str
    overrun_probability: float
    risk_level: str
    confidence: float
    model_name: str
    model_version: str
    feature_version: str
    prediction_basis: str


# ─── Asset Risk Assessment ────────────────────────────────────────────────────

class AssetRiskRequest(BaseModel):
    asset_id: str = Field(..., json_schema_extra={"example": "AST-DEL-ENGG-0042"})
    condition_score: float = Field(..., ge=1.0, le=10.0)
    criticality_index: float = Field(..., ge=1.0, le=10.0)
    days_since_last_maintenance: float = Field(90.0, ge=0.0)
    days_until_due: float = Field(7.0)
    open_task_count: int = Field(0, ge=0)
    overdue_task_count: int = Field(0, ge=0)


class AssetRiskResponse(BaseModel):
    asset_id: str
    risk_score: float
    risk_level: str
    confidence: float
    score_components: Dict[str, float]
    weight_config: Dict[str, float]
    model_name: str
    model_version: str
    feature_version: str
    prediction_basis: str


# ─── Model Status ─────────────────────────────────────────────────────────────

class ModelStatusEntry(BaseModel):
    model_name: str
    model_version: str
    status: str
    feature_version: str
    record_count: int
    created_at: Optional[str]
    metrics: Dict[str, Any]
    prediction_basis: str


class ModelStatusResponse(BaseModel):
    models: List[ModelStatusEntry]
    api_version: str = "v1"
    feature_version: str = "1.0"
