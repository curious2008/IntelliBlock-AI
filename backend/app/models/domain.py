from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base


def utc_now():
    return datetime.now(timezone.utc)


class DepartmentModel(Base):
    __tablename__ = "departments"

    department_code = Column(String(10), primary_key=True, index=True)
    department_name = Column(String(100), nullable=False)
    contact_officer = Column(String(100), nullable=True)
    priority_weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=utc_now)

    assets = relationship("AssetModel", back_populates="department_rel")
    tasks = relationship("MaintenanceTaskModel", back_populates="department_rel")
    resources = relationship("ResourceModel", back_populates="department_rel")


class CorridorModel(Base):
    __tablename__ = "corridors"

    corridor_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    start_location = Column(String(100), nullable=False)
    end_location = Column(String(100), nullable=False)
    total_length_km = Column(Float, nullable=False)
    track_configuration = Column(String(50), nullable=False, default="DOUBLE_LINE")
    sections_json = Column(JSON, nullable=False, default=list)
    operational_status = Column(String(50), nullable=False, default="NORMAL")
    created_at = Column(DateTime, default=utc_now)

    sections = relationship("TrackSectionModel", back_populates="corridor_rel", cascade="all, delete-orphan")
    assets = relationship("AssetModel", back_populates="corridor_rel")
    trains = relationship("TrainMovementModel", back_populates="corridor_rel")
    opportunities = relationship("BlockOpportunityModel", back_populates="corridor_rel")
    freight_forecasts = relationship("FreightForecastModel", back_populates="corridor_rel")


class TrackSectionModel(Base):
    __tablename__ = "track_sections"

    section_id = Column(String(50), primary_key=True, index=True)
    corridor_id = Column(String(50), ForeignKey("corridors.corridor_id"), nullable=False)
    sequence_order = Column(Integer, nullable=False, default=1)
    name = Column(String(150), nullable=False)
    start_location = Column(String(100), nullable=False)
    end_location = Column(String(100), nullable=False)
    distance_km = Column(Float, nullable=False)
    track_configuration = Column(String(50), nullable=False, default="DOUBLE_LINE")
    max_permissible_speed_kmh = Column(Integer, nullable=False, default=130)
    operational_status = Column(String(50), nullable=False, default="NORMAL")
    created_at = Column(DateTime, default=utc_now)

    corridor_rel = relationship("CorridorModel", back_populates="sections")
    assets = relationship("AssetModel", back_populates="track_section_rel")


class AssetModel(Base):
    __tablename__ = "assets"

    asset_id = Column(String(50), primary_key=True, index=True)
    asset_name = Column(String(150), nullable=False)
    asset_type = Column(String(50), nullable=False)
    department = Column(String(10), ForeignKey("departments.department_code"), nullable=False)
    corridor_id = Column(String(50), ForeignKey("corridors.corridor_id"), nullable=False)
    track_section_id = Column(String(50), ForeignKey("track_sections.section_id"), nullable=False)
    location_km_start = Column(Float, nullable=False)
    location_km_end = Column(Float, nullable=False)
    criticality_index = Column(Float, nullable=False, default=5.0)
    condition_score = Column(Float, nullable=False, default=7.0)
    operational_status = Column(String(50), nullable=False, default="ACTIVE")
    installation_date = Column(String(20), nullable=True)
    last_maintenance_date = Column(String(20), nullable=True)
    next_due_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    department_rel = relationship("DepartmentModel", back_populates="assets")
    corridor_rel = relationship("CorridorModel", back_populates="assets")
    track_section_rel = relationship("TrackSectionModel", back_populates="assets")
    tasks = relationship("MaintenanceTaskModel", back_populates="asset_rel")


class MaintenanceTaskModel(Base):
    __tablename__ = "maintenance_tasks"

    task_id = Column(String(50), primary_key=True, index=True)
    asset_id = Column(String(50), ForeignKey("assets.asset_id"), nullable=False)
    department = Column(String(10), ForeignKey("departments.department_code"), nullable=False)
    task_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    priority_score = Column(Float, nullable=False, default=5.0)
    is_emergency = Column(Boolean, default=False)
    due_date = Column(String(20), nullable=False)
    estimated_duration_mins = Column(Integer, nullable=False)
    minimum_duration_mins = Column(Integer, nullable=False)
    maximum_duration_mins = Column(Integer, nullable=False)
    required_resources = Column(JSON, default=list)
    preferred_time_window = Column(JSON, nullable=True)
    location_corridor_id = Column(String(50), nullable=False)
    location_section_id = Column(String(50), nullable=False)
    prerequisite_task_ids = Column(JSON, default=list)
    compatible_task_types = Column(JSON, default=list)
    status = Column(String(50), nullable=False, default="REQUESTED")
    created_at = Column(DateTime, default=utc_now)

    asset_rel = relationship("AssetModel", back_populates="tasks")
    department_rel = relationship("DepartmentModel", back_populates="tasks")


class TrainMovementModel(Base):
    __tablename__ = "train_movements"

    train_id = Column(String(50), primary_key=True, index=True)
    train_number = Column(String(50), nullable=False)
    train_name = Column(String(150), nullable=False)
    train_type = Column(String(50), nullable=False)
    corridor_id = Column(String(50), ForeignKey("corridors.corridor_id"), nullable=False)
    track_section_id = Column(String(50), nullable=True)
    direction = Column(String(10), nullable=False)
    scheduled_entry_time = Column(DateTime, nullable=False)
    scheduled_exit_time = Column(DateTime, nullable=False)
    priority_category = Column(Integer, nullable=False, default=3)
    delay_minutes = Column(Integer, default=0)
    status = Column(String(50), nullable=False, default="SCHEDULED")
    created_at = Column(DateTime, default=utc_now)

    corridor_rel = relationship("CorridorModel", back_populates="trains")


class ResourceModel(Base):
    __tablename__ = "resources"

    resource_id = Column(String(50), primary_key=True, index=True)
    resource_name = Column(String(150), nullable=False)
    resource_type = Column(String(50), nullable=False)
    department = Column(String(10), ForeignKey("departments.department_code"), nullable=False)
    capability = Column(String(100), nullable=False)
    home_depot_location = Column(String(100), nullable=False)
    current_location_section_id = Column(String(50), nullable=False)
    available_from = Column(DateTime, nullable=False)
    available_until = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False, default="READY")
    created_at = Column(DateTime, default=utc_now)

    department_rel = relationship("DepartmentModel", back_populates="resources")


class BlockOpportunityModel(Base):
    __tablename__ = "block_opportunities"

    opportunity_id = Column(String(50), primary_key=True, index=True)
    corridor_id = Column(String(50), ForeignKey("corridors.corridor_id"), nullable=False)
    track_section_id = Column(String(50), nullable=False)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    maximum_duration_mins = Column(Integer, nullable=False)
    availability_status = Column(String(50), nullable=False, default="AVAILABLE")
    affected_line_direction = Column(String(10), nullable=False, default="BOTH")
    is_power_block_available = Column(Boolean, default=True)
    restriction_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    corridor_rel = relationship("CorridorModel", back_populates="opportunities")


class FreightForecastModel(Base):
    __tablename__ = "freight_forecasts"

    forecast_id = Column(String(50), primary_key=True, index=True)
    corridor_id = Column(String(50), ForeignKey("corridors.corridor_id"), nullable=False)
    track_section_id = Column(String(50), nullable=False)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    expected_freight_density = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH
    confidence_level = Column(Float, nullable=False, default=0.85)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    corridor_rel = relationship("CorridorModel", back_populates="freight_forecasts")


class ExecutionRecordModel(Base):
    __tablename__ = "execution_records"

    execution_id = Column(String(50), primary_key=True, index=True)
    plan_id = Column(String(50), nullable=False)
    task_id = Column(String(50), nullable=False)
    planned_start = Column(DateTime, nullable=False)
    planned_end = Column(DateTime, nullable=False)
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)
    delay_start_mins = Column(Integer, default=0)
    overrun_mins = Column(Integer, default=0)
    completion_status = Column(String(50), nullable=False, default="PENDING")
    resources_utilized = Column(JSON, default=list)
    variance_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class ScenarioRunModel(Base):
    __tablename__ = "scenario_runs"

    run_id = Column(String(50), primary_key=True, index=True)
    scenario_type = Column(String(50), nullable=False)
    seed = Column(Integer, nullable=False)
    generated_at = Column(DateTime, default=utc_now)
    summary_json = Column(JSON, nullable=False, default=dict)
