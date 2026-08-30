from app.db.session import SessionLocal, engine, Base
from app.generator.engine import SyntheticDataGenerator
from app.models.domain import (
    DepartmentModel, CorridorModel, TrackSectionModel, AssetModel,
    MaintenanceTaskModel, TrainMovementModel, ResourceModel,
    BlockOpportunityModel, FreightForecastModel, ExecutionRecordModel,
    ScenarioRunModel
)


def seed_database(scenario_type: str = "NORMAL", seed: int = 42):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # If database already populated with scenario, skip unless empty
        if db.query(DepartmentModel).count() > 0 and db.query(MaintenanceTaskModel).count() > 0:
            return

        print(f"Seeding synthetic dataset: scenario='{scenario_type}', seed={seed}...")
        generator = SyntheticDataGenerator(scenario_type=scenario_type, seed=seed)
        dataset = generator.generate()
        summary = generator.get_summary(dataset)

        # Clear existing entities
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

        # Add generated domain entities
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

        # Save Scenario Run Metadata
        scenario_run = ScenarioRunModel(
            run_id=f"RUN-{scenario_type}-{seed}",
            scenario_type=scenario_type,
            seed=seed,
            summary_json=summary
        )
        db.add(scenario_run)
        db.commit()

        print(f"Seeding successful! Generated {summary['maintenance_task_count']} tasks, {summary['train_movement_count']} trains, {summary['block_opportunity_count']} block opportunities.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
