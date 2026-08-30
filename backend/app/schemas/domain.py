from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# Department Schemas
class DepartmentBase(BaseModel):
    department_code: str = Field(..., json_schema_extra={"example": "ENGG"})
    department_name: str = Field(..., json_schema_extra={"example": "Civil & Track Engineering"})
    contact_officer: Optional[str] = Field(None, json_schema_extra={"example": "Sr. DEN (Co-ordination)"})
    priority_weight: float = Field(1.0, ge=0.1, le=10.0)


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentRead(DepartmentBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Track Section Schemas
class TrackSectionBase(BaseModel):
    section_id: str = Field(..., json_schema_extra={"example": "SEC-GZB-SBB-UP"})
    corridor_id: str = Field(..., json_schema_extra={"example": "COR-DEL-KNP"})
    sequence_order: int = Field(1, ge=1)
    name: str = Field(..., json_schema_extra={"example": "Ghaziabad - Sahibabad Up Line"})
    start_location: str = Field(..., json_schema_extra={"example": "Ghaziabad (GZB)"})
    end_location: str = Field(..., json_schema_extra={"example": "Sahibabad (SBB)"})
    distance_km: float = Field(..., json_schema_extra={"example": 5.2})
    track_configuration: str = Field("DOUBLE_LINE", json_schema_extra={"example": "DOUBLE_LINE"})
    max_permissible_speed_kmh: int = Field(130, ge=30, le=200)
    operational_status: str = Field("NORMAL", json_schema_extra={"example": "NORMAL"})


class TrackSectionRead(TrackSectionBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Corridor Schemas
class CorridorBase(BaseModel):
    corridor_id: str = Field(..., json_schema_extra={"example": "COR-DEL-KNP"})
    name: str = Field(..., json_schema_extra={"example": "New Delhi - Kanpur Trunk Corridor (Synthetic)"})
    start_location: str = Field(..., json_schema_extra={"example": "New Delhi (NDLS)"})
    end_location: str = Field(..., json_schema_extra={"example": "Kanpur Central (CNB)"})
    total_length_km: float = Field(..., json_schema_extra={"example": 440.0})
    track_configuration: str = Field("DOUBLE_LINE", json_schema_extra={"example": "DOUBLE_LINE"})
    sections_json: List[Dict[str, Any]] = Field(default_factory=list)
    operational_status: str = Field("NORMAL", json_schema_extra={"example": "NORMAL"})


class CorridorRead(CorridorBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Asset Schemas
class AssetBase(BaseModel):
    asset_id: str = Field(..., json_schema_extra={"example": "AST-DEL-KNP-TK-0142"})
    asset_name: str = Field(..., json_schema_extra={"example": "Up Line Track Segment Km 142.0 to 144.5"})
    asset_type: str = Field(..., json_schema_extra={"example": "TRACK_SEGMENT"})
    department: str = Field(..., json_schema_extra={"example": "ENGG"})
    corridor_id: str = Field(..., json_schema_extra={"example": "COR-DEL-KNP"})
    track_section_id: str = Field(..., json_schema_extra={"example": "SEC-GZB-SBB-UP"})
    location_km_start: float = Field(..., json_schema_extra={"example": 142.0})
    location_km_end: float = Field(..., json_schema_extra={"example": 144.5})
    criticality_index: float = Field(5.0, ge=1.0, le=10.0)
    condition_score: float = Field(7.0, ge=1.0, le=10.0)
    operational_status: str = Field("ACTIVE", json_schema_extra={"example": "ACTIVE"})
    installation_date: Optional[str] = Field(None, json_schema_extra={"example": "2018-04-12"})
    last_maintenance_date: Optional[str] = Field(None, json_schema_extra={"example": "2026-02-10"})
    next_due_date: Optional[str] = Field(None, json_schema_extra={"example": "2026-09-01"})


class AssetRead(AssetBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Maintenance Task Schemas
class MaintenanceTaskBase(BaseModel):
    task_id: str = Field(..., json_schema_extra={"example": "TSK-2026-0830-001"})
    asset_id: str = Field(..., json_schema_extra={"example": "AST-DEL-KNP-TK-0142"})
    department: str = Field(..., json_schema_extra={"example": "ENGG"})
    task_type: str = Field(..., json_schema_extra={"example": "TRACK_TAMPING"})
    description: Optional[str] = Field(None, json_schema_extra={"example": "Routine track tamping using TTM machine"})
    priority_score: float = Field(5.0, ge=0.0, le=10.0)
    is_emergency: bool = Field(False)
    due_date: str = Field(..., json_schema_extra={"example": "2026-09-05"})
    estimated_duration_mins: int = Field(..., json_schema_extra={"example": 120})
    minimum_duration_mins: int = Field(..., json_schema_extra={"example": 90})
    maximum_duration_mins: int = Field(..., json_schema_extra={"example": 180})
    required_resources: List[str] = Field(default_factory=list)
    preferred_time_window: Optional[Dict[str, str]] = None
    location_corridor_id: str = Field(..., json_schema_extra={"example": "COR-DEL-KNP"})
    location_section_id: str = Field(..., json_schema_extra={"example": "SEC-GZB-SBB-UP"})
    prerequisite_task_ids: List[str] = Field(default_factory=list)
    compatible_task_types: List[str] = Field(default_factory=list)
    status: str = Field("REQUESTED", json_schema_extra={"example": "REQUESTED"})


class MaintenanceTaskRead(MaintenanceTaskBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Train Movement Schemas
class TrainMovementBase(BaseModel):
    train_id: str = Field(..., json_schema_extra={"example": "TRN-12301"})
    train_number: str = Field(..., json_schema_extra={"example": "12301"})
    train_name: str = Field(..., json_schema_extra={"example": "Howrah Rajdhani Express (Synthetic)"})
    train_type: str = Field(..., json_schema_extra={"example": "PASSENGER_SUPERFAST"})
    corridor_id: str = Field(..., json_schema_extra={"example": "COR-DEL-KNP"})
    track_section_id: Optional[str] = Field(None, json_schema_extra={"example": "SEC-GZB-SBB-UP"})
    direction: str = Field(..., json_schema_extra={"example": "DOWN"})
    scheduled_entry_time: datetime
    scheduled_exit_time: datetime
    priority_category: int = Field(3, ge=1, le=5)
    delay_minutes: int = Field(0)
    status: str = Field("SCHEDULED", json_schema_extra={"example": "SCHEDULED"})


class TrainMovementRead(TrainMovementBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Resource Schemas
class ResourceBase(BaseModel):
    resource_id: str = Field(..., json_schema_extra={"example": "RES-TTM-04"})
    resource_name: str = Field(..., json_schema_extra={"example": "Plasser Track Tamping Machine TTM-04"})
    resource_type: str = Field(..., json_schema_extra={"example": "MACHINE"})
    department: str = Field(..., json_schema_extra={"example": "ENGG"})
    capability: str = Field(..., json_schema_extra={"example": "TRACK_TAMPING"})
    home_depot_location: str = Field(..., json_schema_extra={"example": "Allahabad Depot"})
    current_location_section_id: str = Field(..., json_schema_extra={"example": "SEC-ALD-MIR-UP"})
    available_from: datetime
    available_until: datetime
    status: str = Field("READY", json_schema_extra={"example": "READY"})


class ResourceRead(ResourceBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Block Opportunity Schemas
class BlockOpportunityBase(BaseModel):
    opportunity_id: str = Field(..., json_schema_extra={"example": "BLK-OPP-20260901-004"})
    corridor_id: str = Field(..., json_schema_extra={"example": "COR-DEL-KNP"})
    track_section_id: str = Field(..., json_schema_extra={"example": "SEC-GZB-SBB-UP"})
    window_start: datetime
    window_end: datetime
    maximum_duration_mins: int = Field(..., json_schema_extra={"example": 180})
    availability_status: str = Field("AVAILABLE", json_schema_extra={"example": "AVAILABLE"})
    affected_line_direction: str = Field("BOTH", json_schema_extra={"example": "BOTH"})
    is_power_block_available: bool = Field(True)
    restriction_notes: Optional[str] = None


class BlockOpportunityRead(BlockOpportunityBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Freight Forecast Schemas
class FreightForecastBase(BaseModel):
    forecast_id: str = Field(..., json_schema_extra={"example": "FF-20260901-01"})
    corridor_id: str = Field(..., json_schema_extra={"example": "COR-DEL-KNP"})
    track_section_id: str = Field(..., json_schema_extra={"example": "SEC-GZB-SBB-UP"})
    window_start: datetime
    window_end: datetime
    expected_freight_density: str = Field("MEDIUM", json_schema_extra={"example": "HIGH"})
    confidence_level: float = Field(0.85, ge=0.0, le=1.0)
    notes: Optional[str] = None


class FreightForecastRead(FreightForecastBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Scenario Control & Summary Schemas
class ScenarioInfo(BaseModel):
    scenario_type: str
    name: str
    description: str
    purpose: str
    traffic_density: str
    maintenance_demand: str
    resource_availability: str


class ScenarioGenerateRequest(BaseModel):
    scenario_type: str = Field("NORMAL", json_schema_extra={"example": "MULTI_DEPARTMENT_OVERLAP"})
    seed: int = Field(42, json_schema_extra={"example": 42})


class ScenarioSummaryRead(BaseModel):
    run_id: str
    scenario_type: str
    scenario_name: str
    seed: int
    generated_at: datetime
    corridor_count: int
    track_section_count: int
    asset_count: int
    maintenance_task_count: int
    train_movement_count: int
    freight_forecast_count: int
    resource_count: int
    block_opportunity_count: int
    overdue_task_count: int
    emergency_task_count: int
    overlapping_request_count: int
    traffic_density_level: str
    resource_bottleneck_status: str
    model_config = ConfigDict(from_attributes=True)
