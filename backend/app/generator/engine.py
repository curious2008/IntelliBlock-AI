import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.generator.config import SCENARIO_METADATA
from app.generator.validator import DataQualityValidator
from app.models.domain import (
    DepartmentModel, CorridorModel, TrackSectionModel, AssetModel,
    MaintenanceTaskModel, TrainMovementModel, ResourceModel,
    BlockOpportunityModel, FreightForecastModel, ExecutionRecordModel,
    ScenarioRunModel
)


class SyntheticDataGenerator:
    """Deterministic, domain-aware synthetic dataset generator for Indian Railways maintenance scenarios."""

    def __init__(self, scenario_type: str = "NORMAL", seed: int = 42):
        if scenario_type not in SCENARIO_METADATA:
            raise ValueError(f"Unknown scenario type '{scenario_type}'. Valid options: {list(SCENARIO_METADATA.keys())}")
        self.scenario_type = scenario_type
        self.seed = seed
        self.meta = SCENARIO_METADATA[scenario_type]
        self.rng = random.Random(seed)
        self.base_time = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)

    def generate(self) -> Dict[str, List[Any]]:
        # 1. Departments
        departments = [
            DepartmentModel(
                department_code="ENGG",
                department_name="Civil & Track Engineering",
                contact_officer="Sr. DEN (Co-ordination)",
                priority_weight=1.0,
            ),
            DepartmentModel(
                department_code="ST",
                department_name="Signal & Telecommunication Engineering",
                contact_officer="Sr. DSTE",
                priority_weight=1.2,
            ),
            DepartmentModel(
                department_code="TRD",
                department_name="Traction Distribution (Electrical OHE)",
                contact_officer="Sr. DEE (TRD)",
                priority_weight=1.1,
            ),
        ]

        # 2. Corridors & Track Sections
        corridors = [
            CorridorModel(
                corridor_id="COR-DEL-KNP",
                name="New Delhi - Kanpur Trunk Corridor (Synthetic)",
                start_location="New Delhi (NDLS)",
                end_location="Kanpur Central (CNB)",
                total_length_km=440.0,
                track_configuration="DOUBLE_LINE",
                sections_json=[],
                operational_status="NORMAL",
            ),
            CorridorModel(
                corridor_id="COR-HWH-PRYJ",
                name="Howrah - Prayagraj Main Line (Synthetic)",
                start_location="Howrah Junction (HWH)",
                end_location="Prayagraj Junction (PRYJ)",
                total_length_km=775.0,
                track_configuration="DOUBLE_LINE",
                sections_json=[],
                operational_status="NORMAL",
            ),
            CorridorModel(
                corridor_id="COR-BCT-ADIR",
                name="Mumbai Central - Ahmedabad Corridor (Synthetic)",
                start_location="Mumbai Central (MMCT)",
                end_location="Ahmedabad Junction (ADI)",
                total_length_km=492.0,
                track_configuration="QUADRUPLE_LINE",
                sections_json=[],
                operational_status="NORMAL",
            ),
        ]

        sections = [
            # Corridor 1 Sections
            TrackSectionModel(
                section_id="SEC-GZB-SBB-UP",
                corridor_id="COR-DEL-KNP",
                sequence_order=1,
                name="Ghaziabad - Sahibabad Up Line",
                start_location="Ghaziabad (GZB)",
                end_location="Sahibabad (SBB)",
                distance_km=5.2,
                track_configuration="DOUBLE_LINE",
                max_permissible_speed_kmh=130,
                operational_status="NORMAL",
            ),
            TrackSectionModel(
                section_id="SEC-SBB-ALJN-DN",
                corridor_id="COR-DEL-KNP",
                sequence_order=2,
                name="Sahibabad - Aligarh Down Line",
                start_location="Sahibabad (SBB)",
                end_location="Aligarh (ALJN)",
                distance_km=120.5,
                track_configuration="DOUBLE_LINE",
                max_permissible_speed_kmh=130,
                operational_status="NORMAL",
            ),
            TrackSectionModel(
                section_id="SEC-ALJN-TDL-UP",
                corridor_id="COR-DEL-KNP",
                sequence_order=3,
                name="Aligarh - Tundla Up Line",
                start_location="Aligarh (ALJN)",
                end_location="Tundla (TDL)",
                distance_km=78.0,
                track_configuration="DOUBLE_LINE",
                max_permissible_speed_kmh=130,
                operational_status="NORMAL",
            ),
            TrackSectionModel(
                section_id="SEC-TDL-CNB-DN",
                corridor_id="COR-DEL-KNP",
                sequence_order=4,
                name="Tundla - Kanpur Down Line",
                start_location="Tundla (TDL)",
                end_location="Kanpur (CNB)",
                distance_km=236.3,
                track_configuration="DOUBLE_LINE",
                max_permissible_speed_kmh=130,
                operational_status="NORMAL",
            ),
            # Corridor 2 Sections
            TrackSectionModel(
                section_id="SEC-HWH-BWN-UP",
                corridor_id="COR-HWH-PRYJ",
                sequence_order=1,
                name="Howrah - Barddhaman Up Line",
                start_location="Howrah (HWH)",
                end_location="Barddhaman (BWN)",
                distance_km=95.0,
                track_configuration="DOUBLE_LINE",
                max_permissible_speed_kmh=110,
                operational_status="NORMAL",
            ),
            TrackSectionModel(
                section_id="SEC-BWN-PRYJ-DN",
                corridor_id="COR-HWH-PRYJ",
                sequence_order=2,
                name="Barddhaman - Prayagraj Down Line",
                start_location="Barddhaman (BWN)",
                end_location="Prayagraj (PRYJ)",
                distance_km=680.0,
                track_configuration="DOUBLE_LINE",
                max_permissible_speed_kmh=130,
                operational_status="NORMAL",
            ),
            # Corridor 3 Sections
            TrackSectionModel(
                section_id="SEC-MMCT-ST-UP",
                corridor_id="COR-BCT-ADIR",
                sequence_order=1,
                name="Mumbai Central - Surat Up Line",
                start_location="Mumbai Central (MMCT)",
                end_location="Surat (ST)",
                distance_km=263.0,
                track_configuration="QUADRUPLE_LINE",
                max_permissible_speed_kmh=130,
                operational_status="NORMAL",
            ),
        ]

        # Update corridor sections_json metadata
        for c in corridors:
            c.sections_json = [
                {
                    "section_id": s.section_id,
                    "name": s.name,
                    "length_km": s.distance_km,
                    "max_permissible_speed_kmh": s.max_permissible_speed_kmh,
                }
                for s in sections if s.corridor_id == c.corridor_id
            ]

        # 3. Assets
        assets: List[AssetModel] = []
        asset_types = {
            "ENGG": [("TRACK_SEGMENT", "Track Segment"), ("TURNOUT", "Turnout Switch Point"), ("BRIDGE", "Steel Girder Bridge"), ("DRAINAGE", "Track Culvert")],
            "ST": [("SIGNAL_POINT", "Point Motor Switch"), ("TRACK_CIRCUIT", "Axle Counter Circuit"), ("SIGNAL_GANTRY", "LED Signal Gantry")],
            "TRD": [("OHE_CATENARY", "OHE Contact Wire Span"), ("OHE_ISOLATOR", "Power Substation Isolator"), ("TOWER_FEEDER", "Catenary Feeder Wire")],
        }

        asset_counter = 1
        for sec in sections:
            for dept_code, types_list in asset_types.items():
                # Create 3-5 assets per dept per section
                for _ in range(self.rng.randint(2, 4)):
                    atype, atitle = self.rng.choice(types_list)
                    km_start = round(self.rng.uniform(1.0, sec.distance_km - 2.0), 1)
                    km_end = round(km_start + self.rng.uniform(0.5, 3.0), 1)
                    cond = round(self.rng.uniform(4.5, 9.5), 1)
                    crit = round(self.rng.uniform(5.0, 9.8), 1)
                    inst_year = self.rng.randint(2012, 2022)

                    asset = AssetModel(
                        asset_id=f"AST-{sec.corridor_id.split('-')[1]}-{dept_code}-{asset_counter:04d}",
                        asset_name=f"{sec.name} {atitle} Km {km_start}",
                        asset_type=atype,
                        department=dept_code,
                        corridor_id=sec.corridor_id,
                        track_section_id=sec.section_id,
                        location_km_start=km_start,
                        location_km_end=km_end,
                        criticality_index=crit,
                        condition_score=cond,
                        operational_status="ACTIVE",
                        installation_date=f"{inst_year}-04-15",
                        last_maintenance_date=(self.base_time - timedelta(days=self.rng.randint(30, 180))).strftime("%Y-%m-%d"),
                        next_due_date=(self.base_time + timedelta(days=self.rng.randint(-10, 30))).strftime("%Y-%m-%d"),
                    )
                    assets.append(asset)
                    asset_counter += 1

        # 4. Resources
        resources: List[ResourceModel] = []
        is_shortage = self.meta["resource_availability"] == "CONSTRAINED"

        # Machines
        machine_defs = [
            ("RES-TTM-01", "Plasser Track Tamper TTM-01", "MACHINE", "ENGG", "TRACK_TAMPING", "Ghaziabad Depot"),
            ("RES-BCM-01", "Ballast Cleaner BCM-01", "MACHINE", "ENGG", "BALLAST_CLEANING", "Allahabad Depot"),
            ("RES-TOWER-01", "OHE Tower Wagon TW-01", "MACHINE", "TRD", "OHE_INSPECTION", "Sahibabad Depot"),
            ("RES-RAILGRID-01", "Rail Grinding Machine RGM-01", "MACHINE", "ENGG", "RAIL_GRINDING", "Tundla Depot"),
        ]
        if not is_shortage:
            machine_defs.extend([
                ("RES-TTM-02", "Plasser Track Tamper TTM-02", "MACHINE", "ENGG", "TRACK_TAMPING", "Kanpur Depot"),
                ("RES-TOWER-02", "OHE Tower Wagon TW-02", "MACHINE", "TRD", "OHE_INSPECTION", "Howrah Depot"),
            ])

        for r_id, r_name, r_type, r_dept, r_cap, r_depot in machine_defs:
            resources.append(ResourceModel(
                resource_id=r_id,
                resource_name=r_name,
                resource_type=r_type,
                department=r_dept,
                capability=r_cap,
                home_depot_location=r_depot,
                current_location_section_id=sections[0].section_id,
                available_from=self.base_time - timedelta(days=1),
                available_until=self.base_time + timedelta(days=30),
                status="READY",
            ))

        # Crews
        crew_count = 6 if is_shortage else 14
        for c_i in range(1, crew_count + 1):
            dept_code = ["ENGG", "ST", "TRD"][c_i % 3]
            cap = "TRACK_TAMPING" if dept_code == "ENGG" else "POINT_OVERHAUL" if dept_code == "ST" else "OHE_INSPECTION"
            resources.append(ResourceModel(
                resource_id=f"RES-CREW-{dept_code}-{c_i:02d}",
                resource_name=f"{dept_code} Maintenance Gang #{c_i}",
                resource_type="CREW",
                department=dept_code,
                capability=cap,
                home_depot_location=f"{sections[c_i % len(sections)].start_location} Depot",
                current_location_section_id=sections[c_i % len(sections)].section_id,
                available_from=self.base_time - timedelta(days=1),
                available_until=self.base_time + timedelta(days=30),
                status="READY",
            ))

        # 5. Maintenance Tasks
        tasks: List[MaintenanceTaskModel] = []
        target_task_count = self.meta["task_count"]
        task_types_map = {
            "ENGG": [("TRACK_TAMPING", 120, 90, 180, ["RES-TTM-01"]), ("BALLAST_CLEANING", 240, 180, 360, ["RES-BCM-01"]), ("RAIL_RENEWAL", 180, 120, 240, [])],
            "ST": [("POINT_OVERHAUL", 60, 45, 90, []), ("SIGNAL_TESTING", 45, 30, 60, []), ("AXLE_COUNTER_CHECK", 45, 30, 60, [])],
            "TRD": [("OHE_INSPECTION", 90, 60, 120, ["RES-TOWER-01"]), ("INSULATOR_WASHING", 60, 45, 90, []), ("POWER_BLOCK_MAINT", 120, 90, 180, [])],
        }

        # Handle explicit Multi-Department Overlap targets
        overlap_target = self.meta["multi_dept_overlap_target"]
        target_section = sections[0]  # SEC-GZB-SBB-UP for primary overlap cluster

        task_id_counter = 1
        for i in range(target_task_count):
            # Select target asset
            if i < overlap_target * 3:
                # Force overlap cluster on target_section across depts
                dept_code = ["ENGG", "ST", "TRD"][i % 3]
                matching_assets = [a for a in assets if a.track_section_id == target_section.section_id and a.department == dept_code]
                asset = matching_assets[0] if matching_assets else assets[i % len(assets)]
            else:
                asset = assets[i % len(assets)]

            dept_code = asset.department
            ttype, est_d, min_d, max_d, default_res = self.rng.choice(task_types_map[dept_code])

            # Derive priority score P(T) coherently
            is_overdue = self.rng.random() < self.meta["overdue_ratio"]
            is_emerg = (i < self.meta["emergency_count"])
            
            if is_emerg:
                p_score = 9.8
            elif is_overdue:
                p_score = round(self.rng.uniform(8.0, 9.4), 1)
            else:
                p_score = round((asset.criticality_index * 0.4) + ((10.0 - asset.condition_score) * 0.4) + self.rng.uniform(0.5, 2.0), 1)
                p_score = min(9.5, max(3.0, p_score))

            due_days = -self.rng.randint(1, 10) if is_overdue else self.rng.randint(2, 14)
            due_dt = (self.base_time + timedelta(days=due_days)).strftime("%Y-%m-%d")

            # Required resources assignment
            req_res = list(default_res)
            crew_matches = [r.resource_id for r in resources if r.department == dept_code and r.resource_type == "CREW"]
            if crew_matches:
                req_res.append(self.rng.choice(crew_matches))

            # Preferred window (Synchronized for overlap targets)
            if i < overlap_target * 3:
                w_start = self.base_time + timedelta(hours=1, minutes=15)
                w_finish = self.base_time + timedelta(hours=4, minutes=15)
            else:
                w_hour = self.rng.randint(0, 20)
                w_start = self.base_time + timedelta(hours=w_hour)
                w_finish = w_start + timedelta(hours=4)

            task = MaintenanceTaskModel(
                task_id=f"TSK-2026-{task_id_counter:04d}",
                asset_id=asset.asset_id,
                department=dept_code,
                task_type=ttype,
                description=f"Synthetic {dept_code} work request for {asset.asset_name}",
                priority_score=p_score,
                is_emergency=is_emerg,
                due_date=due_dt,
                estimated_duration_mins=est_d,
                minimum_duration_mins=min_d,
                maximum_duration_mins=max_d,
                required_resources=req_res,
                preferred_time_window={
                    "earliest_start": w_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "latest_finish": w_finish.strftime("%Y-%m-%dT%H:%M:%SZ"),
                },
                location_corridor_id=asset.corridor_id,
                location_section_id=asset.track_section_id,
                prerequisite_task_ids=[],
                compatible_task_types=["TRACK_TAMPING", "POINT_OVERHAUL", "OHE_INSPECTION"],
                status="REQUESTED",
            )
            tasks.append(task)
            task_id_counter += 1

        # 6. Train Movements
        trains: List[TrainMovementModel] = []
        target_train_count = self.meta["train_count"]
        train_types = [
            ("PASSENGER_PREMIUM", 1, "Vande Bharat Express"),
            ("PASSENGER_SUPERFAST", 2, "Rajdhani Express"),
            ("PASSENGER_EXPRESS", 3, "Express Passenger"),
            ("FREIGHT_CONTAINER", 4, "Container Freight Rake"),
            ("FREIGHT_BULK", 5, "Bulk Freight Coal Rake"),
        ]

        t_time = self.base_time
        for t_i in range(1, target_train_count + 1):
            ttype, cat, tname_suffix = self.rng.choice(train_types)
            direction = "UP" if t_i % 2 == 0 else "DOWN"
            sec = self.rng.choice(sections)

            # High density = shorter intervals between trains
            step_mins = self.rng.randint(15, 30) if self.meta["traffic_density"] == "HIGH" else self.rng.randint(30, 60)
            t_time += timedelta(minutes=step_mins)

            run_duration_mins = self.rng.randint(25, 45)
            entry_t = t_time
            exit_t = entry_t + timedelta(minutes=run_duration_mins)
            delay = self.rng.choice([0, 0, 0, 10, 25]) if self.meta["traffic_density"] == "HIGH" else 0

            trn = TrainMovementModel(
                train_id=f"TRN-{10000 + t_i}",
                train_number=f"{10000 + t_i}",
                train_name=f"{tname_suffix} #{t_i} (Synthetic)",
                train_type=ttype,
                corridor_id=sec.corridor_id,
                track_section_id=sec.section_id,
                direction=direction,
                scheduled_entry_time=entry_t,
                scheduled_exit_time=exit_t,
                priority_category=cat,
                delay_minutes=delay,
                status="SCHEDULED",
            )
            trains.append(trn)

        # 7. Freight Forecasts
        freight_forecasts: List[FreightForecastModel] = []
        for sec in sections:
            for hour in [0, 6, 12, 18]:
                w_s = self.base_time + timedelta(hours=hour)
                w_e = w_s + timedelta(hours=6)
                density = "HIGH" if (self.meta["traffic_density"] == "HIGH" and hour in [6, 12]) else self.rng.choice(["LOW", "MEDIUM", "HIGH"])
                ff = FreightForecastModel(
                    forecast_id=f"FF-{sec.section_id}-{hour:02d}",
                    corridor_id=sec.corridor_id,
                    track_section_id=sec.section_id,
                    window_start=w_s,
                    window_end=w_e,
                    expected_freight_density=density,
                    confidence_level=round(self.rng.uniform(0.75, 0.95), 2),
                    notes="Synthetic Goods Movement Forecast",
                )
                freight_forecasts.append(ff)

        # 8. Candidate Block Opportunities
        opportunities: List[BlockOpportunityModel] = []
        opp_counter = 1
        for sec in sections:
            # Discover candidate time slots between passenger traffic gaps
            sec_trains = [t for t in trains if t.track_section_id == sec.section_id]
            sec_trains.sort(key=lambda x: x.scheduled_entry_time)

            if not sec_trains:
                w_s = self.base_time + timedelta(hours=1)
                w_e = w_s + timedelta(hours=4)
                opportunities.append(BlockOpportunityModel(
                    opportunity_id=f"BLK-OPP-{opp_counter:04d}",
                    corridor_id=sec.corridor_id,
                    track_section_id=sec.section_id,
                    window_start=w_s,
                    window_end=w_e,
                    maximum_duration_mins=180,
                    availability_status="AVAILABLE",
                    affected_line_direction="UP",
                    is_power_block_available=True,
                    restriction_notes="Candidate gap window discovered",
                ))
                opp_counter += 1
            else:
                for idx in range(len(sec_trains) - 1):
                    gap_start = sec_trains[idx].scheduled_exit_time + timedelta(minutes=10)
                    gap_end = sec_trains[idx + 1].scheduled_entry_time - timedelta(minutes=10)
                    gap_dur = int((gap_end - gap_start).total_seconds() / 60)

                    if gap_dur >= 30:  # Candidate gap threshold
                        opportunities.append(BlockOpportunityModel(
                            opportunity_id=f"BLK-OPP-{opp_counter:04d}",
                            corridor_id=sec.corridor_id,
                            track_section_id=sec.section_id,
                            window_start=gap_start,
                            window_end=gap_end,
                            maximum_duration_mins=gap_dur,
                            availability_status="AVAILABLE",
                            affected_line_direction=sec_trains[idx].direction,
                            is_power_block_available=True,
                            restriction_notes=f"Candidate gap window between Train #{sec_trains[idx].train_number} and #{sec_trains[idx+1].train_number}",
                        ))
                        opp_counter += 1

        # 9. Pre-populated Execution Records for Overrun Scenarios
        execution_records: List[ExecutionRecordModel] = []
        if self.meta["overrun_scenario"]:
            overrun_task = tasks[0]
            planned_s = self.base_time + timedelta(hours=1)
            planned_e = planned_s + timedelta(minutes=overrun_task.estimated_duration_mins)
            actual_s = planned_s + timedelta(minutes=5)
            actual_e = planned_e + timedelta(minutes=35)  # 35-minute overrun

            execution_records.append(ExecutionRecordModel(
                execution_id=f"EXE-{self.seed:04d}-001",
                plan_id="PLN-HIST-001",
                task_id=overrun_task.task_id,
                planned_start=planned_s,
                planned_end=planned_e,
                actual_start=actual_s,
                actual_end=actual_e,
                delay_start_mins=5,
                overrun_mins=35,
                completion_status="COMPLETED_WITH_OVERRUN",
                resources_utilized=overrun_task.required_resources,
                variance_reason="Synthetic Overrun: Machine hydraulic pressure breakdown site clearance delay",
            ))

        # Bundle dataset dictionary
        dataset = {
            "departments": departments,
            "corridors": corridors,
            "sections": sections,
            "assets": assets,
            "tasks": tasks,
            "trains": trains,
            "resources": resources,
            "opportunities": opportunities,
            "freight_forecasts": freight_forecasts,
            "execution_records": execution_records,
        }

        # Run strict data quality validation
        DataQualityValidator.validate(dataset)

        return dataset

    def get_summary(self, dataset: Dict[str, List[Any]]) -> Dict[str, Any]:
        tasks = dataset.get("tasks", [])
        trains = dataset.get("trains", [])
        opportunities = dataset.get("opportunities", [])
        
        overdue = sum(1 for t in tasks if "due_date" in dir(t) and t.due_date and t.due_date < self.base_time.strftime("%Y-%m-%d"))
        emergency = sum(1 for t in tasks if getattr(t, "is_emergency", False))

        return {
            "scenario_type": self.scenario_type,
            "scenario_name": self.meta["name"],
            "seed": self.seed,
            "generated_at": datetime.utcnow().isoformat(),
            "corridor_count": len(dataset.get("corridors", [])),
            "track_section_count": len(dataset.get("sections", [])),
            "asset_count": len(dataset.get("assets", [])),
            "maintenance_task_count": len(tasks),
            "train_movement_count": len(trains),
            "freight_forecast_count": len(dataset.get("freight_forecasts", [])),
            "resource_count": len(dataset.get("resources", [])),
            "block_opportunity_count": len(opportunities),
            "overdue_task_count": overdue,
            "emergency_task_count": emergency,
            "overlapping_request_count": self.meta["multi_dept_overlap_target"],
            "traffic_density_level": self.meta["traffic_density"],
            "resource_bottleneck_status": self.meta["resource_availability"],
        }
