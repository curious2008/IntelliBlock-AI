from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.generator.config import SCENARIO_METADATA
from app.generator.engine import SyntheticDataGenerator
from app.schemas.domain import ScenarioInfo, ScenarioGenerateRequest, ScenarioSummaryRead
from app.models.domain import (
    DepartmentModel, CorridorModel, TrackSectionModel, AssetModel,
    MaintenanceTaskModel, TrainMovementModel, ResourceModel,
    BlockOpportunityModel, FreightForecastModel, ExecutionRecordModel,
    ScenarioRunModel
)

router = APIRouter()


@router.get("/scenarios", response_model=List[ScenarioInfo])
def get_scenarios():
    scenario_list = []
    for s_type, meta in SCENARIO_METADATA.items():
        scenario_list.append(ScenarioInfo(
            scenario_type=s_type,
            name=meta["name"],
            description=meta["description"],
            purpose=meta["purpose"],
            traffic_density=meta["traffic_density"],
            maintenance_demand=meta["maintenance_demand"],
            resource_availability=meta["resource_availability"],
        ))
    return scenario_list


@router.get("/scenarios/summary", response_model=ScenarioSummaryRead)
def get_scenario_summary(db: Session = Depends(get_db)):
    last_run = db.query(ScenarioRunModel).order_by(ScenarioRunModel.generated_at.desc()).first()
    if not last_run:
        # Fallback if no scenario run logged yet
        generator = SyntheticDataGenerator("NORMAL", 42)
        dataset = generator.generate()
        summary = generator.get_summary(dataset)
        return ScenarioSummaryRead(
            run_id="RUN-DEFAULT-42",
            scenario_type="NORMAL",
            scenario_name="Normal Operations Baseline",
            seed=42,
            generated_at=summary["generated_at"],
            corridor_count=summary["corridor_count"],
            track_section_count=summary["track_section_count"],
            asset_count=summary["asset_count"],
            maintenance_task_count=summary["maintenance_task_count"],
            train_movement_count=summary["train_movement_count"],
            freight_forecast_count=summary["freight_forecast_count"],
            resource_count=summary["resource_count"],
            block_opportunity_count=summary["block_opportunity_count"],
            overdue_task_count=summary["overdue_task_count"],
            emergency_task_count=summary["emergency_task_count"],
            overlapping_request_count=summary["overlapping_request_count"],
            traffic_density_level=summary["traffic_density_level"],
            resource_bottleneck_status=summary["resource_bottleneck_status"],
        )

    meta = SCENARIO_METADATA.get(last_run.scenario_type, {})
    sum_data = last_run.summary_json
    return ScenarioSummaryRead(
        run_id=last_run.run_id,
        scenario_type=last_run.scenario_type,
        scenario_name=meta.get("name", last_run.scenario_type),
        seed=last_run.seed,
        generated_at=last_run.generated_at,
        corridor_count=sum_data.get("corridor_count", 0),
        track_section_count=sum_data.get("track_section_count", 0),
        asset_count=sum_data.get("asset_count", 0),
        maintenance_task_count=sum_data.get("maintenance_task_count", 0),
        train_movement_count=sum_data.get("train_movement_count", 0),
        freight_forecast_count=sum_data.get("freight_forecast_count", 0),
        resource_count=sum_data.get("resource_count", 0),
        block_opportunity_count=sum_data.get("block_opportunity_count", 0),
        overdue_task_count=sum_data.get("overdue_task_count", 0),
        emergency_task_count=sum_data.get("emergency_task_count", 0),
        overlapping_request_count=sum_data.get("overlapping_request_count", 0),
        traffic_density_level=sum_data.get("traffic_density_level", "NORMAL"),
        resource_bottleneck_status=sum_data.get("resource_bottleneck_status", "ADEQUATE"),
    )


@router.post("/scenarios/generate", response_model=ScenarioSummaryRead)
def generate_scenario(req: ScenarioGenerateRequest, db: Session = Depends(get_db)):
    if req.scenario_type not in SCENARIO_METADATA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario type '{req.scenario_type}'. Allowed types: {list(SCENARIO_METADATA.keys())}"
        )

    try:
        generator = SyntheticDataGenerator(scenario_type=req.scenario_type, seed=req.seed)
        dataset = generator.generate()
        summary = generator.get_summary(dataset)

        # Clear DB tables in reverse dependency order
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

        run_id = f"RUN-{req.scenario_type}-{req.seed}"
        scenario_run = ScenarioRunModel(
            run_id=run_id,
            scenario_type=req.scenario_type,
            seed=req.seed,
            summary_json=summary
        )
        db.add(scenario_run)
        db.commit()

        meta = SCENARIO_METADATA[req.scenario_type]
        return ScenarioSummaryRead(
            run_id=run_id,
            scenario_type=req.scenario_type,
            scenario_name=meta["name"],
            seed=req.seed,
            generated_at=summary["generated_at"],
            corridor_count=summary["corridor_count"],
            track_section_count=summary["track_section_count"],
            asset_count=summary["asset_count"],
            maintenance_task_count=summary["maintenance_task_count"],
            train_movement_count=summary["train_movement_count"],
            freight_forecast_count=summary["freight_forecast_count"],
            resource_count=summary["resource_count"],
            block_opportunity_count=summary["block_opportunity_count"],
            overdue_task_count=summary["overdue_task_count"],
            emergency_task_count=summary["emergency_task_count"],
            overlapping_request_count=summary["overlapping_request_count"],
            traffic_density_level=summary["traffic_density_level"],
            resource_bottleneck_status=summary["resource_bottleneck_status"],
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate scenario: {str(e)}"
        )
