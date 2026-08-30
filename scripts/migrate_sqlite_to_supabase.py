#!/usr/bin/env python
"""
High-Performance Data Preservation & Migration: SQLite -> Supabase PostgreSQL
Phase 4B — IntelliBlock AI
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.domain import (
    DepartmentModel, CorridorModel, TrackSectionModel, AssetModel,
    MaintenanceTaskModel, TrainMovementModel, ResourceModel,
    BlockOpportunityModel, FreightForecastModel, ExecutionRecordModel,
    ScenarioRunModel
)

# Connect to SQLite source
sqlite_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "intelliblock.db"))
sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}", echo=False)
SqliteSession = sessionmaker(bind=sqlite_engine)

# Connect to Supabase PostgreSQL target
supabase_engine = create_engine(settings.DATABASE_URL, echo=False)
SupabaseSession = sessionmaker(bind=supabase_engine)


def migrate_data():
    sqlite_db = SqliteSession()
    supabase_db = SupabaseSession()

    try:
        print("=" * 60, flush=True)
        print("IntelliBlock AI — Fast SQLite to Supabase Data Migration", flush=True)
        print("=" * 60, flush=True)

        # Clear existing target data in reverse dependency order
        supabase_db.query(ScenarioRunModel).delete()
        supabase_db.query(ExecutionRecordModel).delete()
        supabase_db.query(FreightForecastModel).delete()
        supabase_db.query(BlockOpportunityModel).delete()
        supabase_db.query(ResourceModel).delete()
        supabase_db.query(TrainMovementModel).delete()
        supabase_db.query(MaintenanceTaskModel).delete()
        supabase_db.query(AssetModel).delete()
        supabase_db.query(TrackSectionModel).delete()
        supabase_db.query(CorridorModel).delete()
        supabase_db.query(DepartmentModel).delete()
        supabase_db.commit()

        # 1. Departments
        depts = [DepartmentModel(
            department_code=d.department_code,
            department_name=d.department_name,
            contact_officer=d.contact_officer,
            priority_weight=d.priority_weight,
            created_at=d.created_at
        ) for d in sqlite_db.query(DepartmentModel).all()]
        supabase_db.add_all(depts)
        supabase_db.commit()
        print(f"[1/11] Departments migrated: {len(depts)}", flush=True)

        # 2. Corridors
        corridors = [CorridorModel(
            corridor_id=c.corridor_id,
            name=c.name,
            start_location=c.start_location,
            end_location=c.end_location,
            total_length_km=c.total_length_km,
            track_configuration=c.track_configuration,
            sections_json=c.sections_json,
            operational_status=c.operational_status,
            created_at=c.created_at
        ) for c in sqlite_db.query(CorridorModel).all()]
        supabase_db.add_all(corridors)
        supabase_db.commit()
        print(f"[2/11] Corridors migrated: {len(corridors)}", flush=True)

        # 3. Track Sections
        sections = [TrackSectionModel(
            section_id=s.section_id,
            corridor_id=s.corridor_id,
            sequence_order=s.sequence_order,
            name=s.name,
            start_location=s.start_location,
            end_location=s.end_location,
            distance_km=s.distance_km,
            track_configuration=s.track_configuration,
            max_permissible_speed_kmh=s.max_permissible_speed_kmh,
            operational_status=s.operational_status,
            created_at=s.created_at
        ) for s in sqlite_db.query(TrackSectionModel).all()]
        supabase_db.add_all(sections)
        supabase_db.commit()
        print(f"[3/11] Track Sections migrated: {len(sections)}", flush=True)

        # 4. Assets
        assets = [AssetModel(
            asset_id=a.asset_id,
            asset_name=a.asset_name,
            asset_type=a.asset_type,
            department=a.department,
            corridor_id=a.corridor_id,
            track_section_id=a.track_section_id,
            location_km_start=a.location_km_start,
            location_km_end=a.location_km_end,
            criticality_index=a.criticality_index,
            condition_score=a.condition_score,
            operational_status=a.operational_status,
            installation_date=a.installation_date,
            last_maintenance_date=a.last_maintenance_date,
            next_due_date=a.next_due_date,
            created_at=a.created_at
        ) for a in sqlite_db.query(AssetModel).all()]
        supabase_db.add_all(assets)
        supabase_db.commit()
        print(f"[4/11] Assets migrated: {len(assets)}", flush=True)

        # 5. Maintenance Tasks
        tasks = [MaintenanceTaskModel(
            task_id=t.task_id,
            asset_id=t.asset_id,
            department=t.department,
            task_type=t.task_type,
            description=t.description,
            priority_score=t.priority_score,
            is_emergency=t.is_emergency,
            due_date=t.due_date,
            estimated_duration_mins=t.estimated_duration_mins,
            minimum_duration_mins=t.minimum_duration_mins,
            maximum_duration_mins=t.maximum_duration_mins,
            required_resources=t.required_resources,
            preferred_time_window=t.preferred_time_window,
            location_corridor_id=t.location_corridor_id,
            location_section_id=t.location_section_id,
            prerequisite_task_ids=t.prerequisite_task_ids,
            compatible_task_types=t.compatible_task_types,
            status=t.status,
            created_at=t.created_at
        ) for t in sqlite_db.query(MaintenanceTaskModel).all()]
        supabase_db.add_all(tasks)
        supabase_db.commit()
        print(f"[5/11] Maintenance Tasks migrated: {len(tasks)}", flush=True)

        # 6. Train Movements
        trains = [TrainMovementModel(
            train_id=tr.train_id,
            train_number=tr.train_number,
            train_name=tr.train_name,
            train_type=tr.train_type,
            corridor_id=tr.corridor_id,
            track_section_id=tr.track_section_id,
            direction=tr.direction,
            scheduled_entry_time=tr.scheduled_entry_time,
            scheduled_exit_time=tr.scheduled_exit_time,
            priority_category=tr.priority_category,
            delay_minutes=tr.delay_minutes,
            status=tr.status,
            created_at=tr.created_at
        ) for tr in sqlite_db.query(TrainMovementModel).all()]
        supabase_db.add_all(trains)
        supabase_db.commit()
        print(f"[6/11] Train Movements migrated: {len(trains)}", flush=True)

        # 7. Resources
        resources = [ResourceModel(
            resource_id=r.resource_id,
            resource_name=r.resource_name,
            resource_type=r.resource_type,
            department=r.department,
            capability=r.capability,
            home_depot_location=r.home_depot_location,
            current_location_section_id=r.current_location_section_id,
            available_from=r.available_from,
            available_until=r.available_until,
            status=r.status,
            created_at=r.created_at
        ) for r in sqlite_db.query(ResourceModel).all()]
        supabase_db.add_all(resources)
        supabase_db.commit()
        print(f"[7/11] Resources migrated: {len(resources)}", flush=True)

        # 8. Block Opportunities
        opps = [BlockOpportunityModel(
            opportunity_id=o.opportunity_id,
            corridor_id=o.corridor_id,
            track_section_id=o.track_section_id,
            window_start=o.window_start,
            window_end=o.window_end,
            maximum_duration_mins=o.maximum_duration_mins,
            availability_status=o.availability_status,
            affected_line_direction=o.affected_line_direction,
            is_power_block_available=o.is_power_block_available,
            restriction_notes=o.restriction_notes,
            created_at=o.created_at
        ) for o in sqlite_db.query(BlockOpportunityModel).all()]
        supabase_db.add_all(opps)
        supabase_db.commit()
        print(f"[8/11] Block Opportunities migrated: {len(opps)}", flush=True)

        # 9. Freight Forecasts
        freight = [FreightForecastModel(
            forecast_id=f.forecast_id,
            corridor_id=f.corridor_id,
            track_section_id=f.track_section_id,
            window_start=f.window_start,
            window_end=f.window_end,
            expected_freight_density=f.expected_freight_density,
            confidence_level=f.confidence_level,
            notes=f.notes,
            created_at=f.created_at
        ) for f in sqlite_db.query(FreightForecastModel).all()]
        supabase_db.add_all(freight)
        supabase_db.commit()
        print(f"[9/11] Freight Forecasts migrated: {len(freight)}", flush=True)

        # 10. Execution Records
        execs = [ExecutionRecordModel(
            execution_id=e.execution_id,
            plan_id=e.plan_id,
            task_id=e.task_id,
            planned_start=e.planned_start,
            planned_end=e.planned_end,
            actual_start=e.actual_start,
            actual_end=e.actual_end,
            delay_start_mins=e.delay_start_mins,
            overrun_mins=e.overrun_mins,
            completion_status=e.completion_status,
            resources_utilized=e.resources_utilized,
            variance_reason=e.variance_reason,
            created_at=e.created_at
        ) for e in sqlite_db.query(ExecutionRecordModel).all()]
        supabase_db.add_all(execs)
        supabase_db.commit()
        print(f"[10/11] Execution Records migrated: {len(execs)}", flush=True)

        # 11. Scenario Runs
        runs = [ScenarioRunModel(
            run_id=ru.run_id,
            scenario_type=ru.scenario_type,
            seed=ru.seed,
            generated_at=ru.generated_at,
            summary_json=ru.summary_json
        ) for ru in sqlite_db.query(ScenarioRunModel).all()]
        supabase_db.add_all(runs)
        supabase_db.commit()
        print(f"[11/11] Scenario Runs migrated: {len(runs)}", flush=True)

        print("=" * 60, flush=True)
        print("MIGRATION COMPLETE: All tables successfully migrated to Supabase PostgreSQL!", flush=True)
        print("=" * 60, flush=True)

    finally:
        sqlite_db.close()
        supabase_db.close()


if __name__ == "__main__":
    migrate_data()
