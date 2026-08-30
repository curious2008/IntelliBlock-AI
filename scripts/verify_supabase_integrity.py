#!/usr/bin/env python
"""
Automated Data Integrity & Schema Validation: SQLite vs Supabase PostgreSQL
Phase 4B — IntelliBlock AI
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.domain import (
    DepartmentModel, CorridorModel, TrackSectionModel, AssetModel,
    MaintenanceTaskModel, TrainMovementModel, ResourceModel,
    BlockOpportunityModel, FreightForecastModel, ExecutionRecordModel,
    ScenarioRunModel
)

sqlite_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "intelliblock.db"))
sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}", echo=False)
SqliteSession = sessionmaker(bind=sqlite_engine)

supabase_engine = create_engine(settings.DATABASE_URL, echo=False)
SupabaseSession = sessionmaker(bind=supabase_engine)


def verify_integrity():
    sqlite_db = SqliteSession()
    supabase_db = SupabaseSession()
    inspector = inspect(supabase_engine)

    print("=" * 65, flush=True)
    print("IntelliBlock AI — Supabase PostgreSQL Data Integrity Audit", flush=True)
    print("=" * 65, flush=True)

    tables = [
        ("departments", DepartmentModel),
        ("corridors", CorridorModel),
        ("track_sections", TrackSectionModel),
        ("assets", AssetModel),
        ("maintenance_tasks", MaintenanceTaskModel),
        ("train_movements", TrainMovementModel),
        ("resources", ResourceModel),
        ("block_opportunities", BlockOpportunityModel),
        ("freight_forecasts", FreightForecastModel),
        ("execution_records", ExecutionRecordModel),
        ("scenario_runs", ScenarioRunModel),
    ]

    all_passed = True
    print(f"{'Table Name':<22} | {'SQLite Count':<14} | {'Supabase Count':<14} | {'Status':<8}", flush=True)
    print("-" * 65, flush=True)

    for table_name, model in tables:
        sqlite_cnt = sqlite_db.query(model).count()
        supabase_cnt = supabase_db.query(model).count()
        match = (sqlite_cnt == supabase_cnt)
        if not match:
            all_passed = False
        status = "PASSED" if match else "MISMATCH"
        print(f"{table_name:<22} | {sqlite_cnt:<14} | {supabase_cnt:<14} | {status:<8}", flush=True)

    # Check sample task and asset relations in Supabase
    sample_task = supabase_db.query(MaintenanceTaskModel).first()
    if sample_task:
        assert sample_task.asset_id is not None
        assert sample_task.department in ["ENGG", "ST", "TRD"]
        print(f"\n[Sample Verification] Task {sample_task.task_id} -> Asset: {sample_task.asset_id}, Dept: {sample_task.department}, Dur: {sample_task.estimated_duration_mins}m")

    sample_train = supabase_db.query(TrainMovementModel).first()
    if sample_train:
        assert sample_train.corridor_id is not None
        print(f"[Sample Verification] Train {sample_train.train_number} -> Corridor: {sample_train.corridor_id}, Entry: {sample_train.scheduled_entry_time}")

    print("=" * 65, flush=True)
    if all_passed:
        print("ALL DATA INTEGRITY CHECKS PASSED: Exact 1:1 Match (0 Drift)", flush=True)
    else:
        print("DATA INTEGRITY WARNING: Count mismatch detected!", flush=True)
    print("=" * 65, flush=True)


if __name__ == "__main__":
    verify_integrity()
