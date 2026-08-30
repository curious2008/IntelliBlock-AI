#!/usr/bin/env python
"""
Standalone Database Seeder CLI — Phase 4A Database Architecture

Usage:
    python scripts/seed_db.py
    python scripts/seed_db.py --scenario HEAVY_TRAFFIC --seed 123
    python scripts/seed_db.py --force
"""
import argparse
import sys
import os

# Ensure backend and project root are on python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from data.seed_data import seed_database
from app.db.session import SessionLocal, engine, Base
from app.models.domain import (
    DepartmentModel, CorridorModel, TrackSectionModel, AssetModel,
    MaintenanceTaskModel, TrainMovementModel, ResourceModel,
    BlockOpportunityModel, FreightForecastModel, ExecutionRecordModel,
    ScenarioRunModel
)
from app.generator.engine import SyntheticDataGenerator


def main():
    parser = argparse.ArgumentParser(description="Seed IntelliBlock database with synthetic railway scenarios")
    parser.add_argument("--scenario", type=str, default="NORMAL", help="Benchmark scenario type (default: NORMAL)")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic seed (default: 42)")
    parser.add_argument("--force", action="store_true", help="Force overwrite existing data even if populated")
    args = parser.parse_args()

    print("=" * 60)
    print("IntelliBlock AI — Database Seeding CLI")
    print(f"Scenario: {args.scenario} | Seed: {args.seed} | Force: {args.force}")
    print("=" * 60)

    db = SessionLocal()
    try:
        if args.force:
            print("Wiping existing operational data...")
            db.query(ExecutionRecordModel).delete()
            db.query(FreightForecastModel).delete()
            db.query(BlockOpportunityModel).delete()
            db.query(TrainMovementModel).delete()
            db.query(MaintenanceTaskModel).delete()
            db.query(ResourceModel).delete()
            db.query(AssetModel).delete()
            db.query(TrackSectionModel).delete()
            db.query(CorridorModel).delete()
            db.query(DepartmentModel).delete()
            db.query(ScenarioRunModel).delete()
            db.commit()

        generator = SyntheticDataGenerator(scenario_type=args.scenario, seed=args.seed)
        dataset = generator.generate()
        summary = generator.get_summary(dataset)

        db.add_all(dataset["departments"])
        db.commit()
        db.add_all(dataset["corridors"])
        db.commit()
        db.add_all(dataset["sections"])
        db.commit()
        db.add_all(dataset["assets"])
        db.commit()
        db.add_all(dataset["resources"])
        db.commit()
        db.add_all(dataset["tasks"])
        db.commit()
        db.add_all(dataset["trains"])
        db.commit()
        db.add_all(dataset["opportunities"])
        db.commit()
        db.add_all(dataset["freight_forecasts"])
        db.commit()
        if dataset.get("execution_records"):
            db.add_all(dataset["execution_records"])
            db.commit()

        scenario_run = ScenarioRunModel(
            run_id=f"RUN-{args.scenario}-{args.seed}",
            scenario_type=args.scenario,
            seed=args.seed,
            summary_json=summary
        )
        db.add(scenario_run)
        db.commit()

        print(f"Successfully seeded scenario '{args.scenario}'!")
        print(f"  Corridors:          {summary['corridor_count']}")
        print(f"  Track Sections:     {summary['track_section_count']}")
        print(f"  Assets:             {summary['asset_count']}")
        print(f"  Tasks (Work Orders):{summary['maintenance_task_count']}")
        print(f"  Train Movements:    {summary['train_movement_count']}")
        print(f"  Opportunities:      {summary['block_opportunity_count']}")
        print(f"  Resources:          {summary['resource_count']}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
