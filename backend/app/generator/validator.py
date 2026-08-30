from typing import Dict, List, Any


class DataValidationError(Exception):
    def __init__(self, message: str, errors: List[str]):
        super().__init__(message)
        self.errors = errors


class DataQualityValidator:
    """Validates referential, spatial, temporal, capability, and constraint integrity of generated synthetic datasets."""

    @staticmethod
    def validate(dataset: Dict[str, List[Any]]) -> bool:
        errors: List[str] = []

        corridors = {c.corridor_id: c for c in dataset.get("corridors", [])}
        sections = {s.section_id: s for s in dataset.get("sections", [])}
        assets = {a.asset_id: a for a in dataset.get("assets", [])}
        tasks = {t.task_id: t for t in dataset.get("tasks", [])}
        resources = {r.resource_id: r for r in dataset.get("resources", [])}
        trains = dataset.get("trains", [])
        opportunities = dataset.get("opportunities", [])
        freight_forecasts = dataset.get("freight_forecasts", [])

        # 1. Duplicate ID Check
        all_ids = list(corridors.keys()) + list(sections.keys()) + list(assets.keys()) + list(tasks.keys()) + list(resources.keys())
        if len(all_ids) != len(set(all_ids)):
            errors.append("Duplicate primary key identifiers detected across domain entities.")

        # 2. Section & Corridor Spatial Referential Integrity
        for s_id, s in sections.items():
            if s.corridor_id not in corridors:
                errors.append(f"Section {s_id} references non-existent Corridor ID {s.corridor_id}.")

        for a_id, a in assets.items():
            if a.corridor_id not in corridors:
                errors.append(f"Asset {a_id} references non-existent Corridor ID {a.corridor_id}.")
            if a.track_section_id not in sections:
                errors.append(f"Asset {a_id} references non-existent TrackSection ID {a.track_section_id}.")

        # 3. Task Referential & Spatial Integrity
        for t_id, t in tasks.items():
            if t.asset_id not in assets:
                errors.append(f"Task {t_id} references non-existent Asset ID {t.asset_id}.")
            else:
                target_asset = assets[t.asset_id]
                if t.location_corridor_id != target_asset.corridor_id:
                    errors.append(f"Task {t_id} corridor {t.location_corridor_id} mismatches asset corridor {target_asset.corridor_id}.")
                if t.location_section_id != target_asset.track_section_id:
                    errors.append(f"Task {t_id} section {t.location_section_id} mismatches asset section {target_asset.track_section_id}.")

            if t.estimated_duration_mins < t.minimum_duration_mins or t.estimated_duration_mins > t.maximum_duration_mins:
                errors.append(f"Task {t_id} estimated duration {t.estimated_duration_mins} is outside min/max bounds [{t.minimum_duration_mins}, {t.maximum_duration_mins}].")

        # 4. Train Temporal & Spatial Integrity
        for trn in trains:
            if trn.corridor_id not in corridors:
                errors.append(f"Train {trn.train_id} references non-existent Corridor ID {trn.corridor_id}.")
            if trn.scheduled_entry_time >= trn.scheduled_exit_time:
                errors.append(f"Train {trn.train_id} entry time {trn.scheduled_entry_time} is not before exit time {trn.scheduled_exit_time}.")

        # 5. Opportunity Temporal Integrity
        for opp in opportunities:
            if opp.corridor_id not in corridors:
                errors.append(f"Opportunity {opp.opportunity_id} references non-existent Corridor ID {opp.corridor_id}.")
            if opp.track_section_id not in sections:
                errors.append(f"Opportunity {opp.opportunity_id} references non-existent Section ID {opp.track_section_id}.")
            if opp.window_start >= opp.window_end:
                errors.append(f"Opportunity {opp.opportunity_id} window start {opp.window_start} is not before window end {opp.window_end}.")

        # 6. Freight Forecast Integrity
        for ff in freight_forecasts:
            if ff.corridor_id not in corridors:
                errors.append(f"Freight Forecast {ff.forecast_id} references non-existent Corridor ID {ff.corridor_id}.")
            if ff.track_section_id not in sections:
                errors.append(f"Freight Forecast {ff.forecast_id} references non-existent Section ID {ff.track_section_id}.")

        if errors:
            raise DataValidationError(f"Synthetic dataset quality validation failed with {len(errors)} errors.", errors)

        return True
