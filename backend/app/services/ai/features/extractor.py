"""
Feature Extractor — converts raw domain entity data into a validated feature dictionary
suitable for AI model inference.

LEAKAGE PREVENTION: This module NEVER uses ExecutionRecord.actual_duration_mins,
ExecutionRecord.overrun_mins, or any other post-execution field as an input feature.
"""
from datetime import datetime, date
from typing import Any, Dict, List, Optional


# ─── Encoding Maps ───────────────────────────────────────────────────────────

TASK_TYPE_CODES: Dict[str, int] = {
    "TRACK_TAMPING": 0,
    "BALLAST_CLEANING": 1,
    "RAIL_RENEWAL": 2,
    "POINT_OVERHAUL": 3,
    "SIGNAL_TESTING": 4,
    "AXLE_COUNTER_CHECK": 5,
    "OHE_INSPECTION": 6,
    "INSULATOR_WASHING": 7,
    "POWER_BLOCK_MAINT": 8,
    "RAIL_GRINDING": 9,
    "DRAINAGE_REPAIR": 10,
    "BRIDGE_INSPECTION": 11,
}

DEPARTMENT_CODES: Dict[str, int] = {
    "ENGG": 0,
    "ST": 1,
    "TRD": 2,
}

FREIGHT_DENSITY_CODES: Dict[str, int] = {
    "LOW": 0,
    "MEDIUM": 1,
    "HIGH": 2,
}

SCENARIO_TYPE_CODES: Dict[str, int] = {
    "NORMAL": 0,
    "HEAVY_TRAFFIC": 1,
    "HIGH_MAINTENANCE_DEMAND": 2,
    "RESOURCE_SHORTAGE": 3,
    "MULTI_DEPARTMENT_OVERLAP": 4,
    "MAINTENANCE_OVERRUN": 5,
    "EMERGENCY_MAINTENANCE": 6,
    "COMBINED_STRESS_TEST": 7,
}

FEATURE_VERSION = "1.0"

# ─── Feature Names (must be stable across training & inference) ──────────────

DURATION_FEATURE_NAMES: List[str] = [
    # Asset features
    "asset_condition_score",
    "asset_criticality_index",
    "asset_age_years",
    "days_since_last_maintenance",
    "days_until_due",
    # Task features
    "task_type_code",
    "department_code",
    "priority_score",
    "estimated_duration_mins",
    "duration_range_mins",
    "is_emergency",
    "overdue_flag",
    "dependency_count",
    "resource_count",
    # Operational features
    "train_density_24h",
    "freight_density_code",
    "best_opportunity_duration_mins",
    "scenario_type_code",
    # Resource features
    "crew_available_count",
    "machine_available_count",
]


def _days_delta(date_str: Optional[str], reference: datetime) -> float:
    """Return (reference - date_str).days. Negative means date_str is in the future."""
    if not date_str:
        return 0.0
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return (reference - d).days
    except (ValueError, TypeError):
        return 0.0


def _years_since(date_str: Optional[str], reference: datetime) -> float:
    if not date_str:
        return 5.0  # Conservative default
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return max(0.0, (reference - d).days / 365.25)
    except (ValueError, TypeError):
        return 5.0


def extract_task_features(
    task: Any,
    asset: Any,
    trains_on_corridor: List[Any],
    opportunities_on_section: List[Any],
    freight_forecasts_on_section: List[Any],
    resources_for_dept: List[Any],
    scenario_type: str = "NORMAL",
    reference_time: Optional[datetime] = None,
) -> Dict[str, float]:
    """
    Extract the complete feature vector for a maintenance task before execution.

    Args:
        task: MaintenanceTaskModel instance
        asset: AssetModel instance (must match task.asset_id)
        trains_on_corridor: List of TrainMovementModel for the same corridor (24h window)
        opportunities_on_section: List of BlockOpportunityModel on task's section
        freight_forecasts_on_section: List of FreightForecastModel on task's section
        resources_for_dept: List of ResourceModel with task's department
        scenario_type: Current scenario type string
        reference_time: Reference point (defaults to now)

    Returns:
        Dict mapping feature name -> float value
    """
    if reference_time is None:
        reference_time = datetime.utcnow()

    # ── Asset features ──────────────────────────────────────────────────────
    condition_score = float(getattr(asset, "condition_score", 7.0))
    criticality_index = float(getattr(asset, "criticality_index", 5.0))
    age_years = _years_since(getattr(asset, "installation_date", None), reference_time)
    days_since_maint = _days_delta(
        getattr(asset, "last_maintenance_date", None), reference_time
    )
    # days_until_due: negative means overdue
    due_date_str = getattr(task, "due_date", None) or getattr(asset, "next_due_date", None)
    days_until_due = -_days_delta(due_date_str, reference_time)  # flip sign

    # ── Task features ───────────────────────────────────────────────────────
    task_type_raw = str(getattr(task, "task_type", "TRACK_TAMPING"))
    task_type_code = TASK_TYPE_CODES.get(task_type_raw, len(TASK_TYPE_CODES))

    dept_raw = str(getattr(task, "department", "ENGG"))
    department_code = DEPARTMENT_CODES.get(dept_raw, 0)

    priority_score = float(getattr(task, "priority_score", 5.0))
    estimated_duration = float(getattr(task, "estimated_duration_mins", 120))
    min_dur = float(getattr(task, "minimum_duration_mins", 60))
    max_dur = float(getattr(task, "maximum_duration_mins", 240))
    duration_range = max_dur - min_dur

    is_emergency = 1 if getattr(task, "is_emergency", False) else 0

    overdue_flag = 1 if days_until_due < 0 else 0

    prereqs = getattr(task, "prerequisite_task_ids", []) or []
    dependency_count = len(prereqs)

    req_res = getattr(task, "required_resources", []) or []
    resource_count = len(req_res)

    # ── Operational features ─────────────────────────────────────────────────
    train_density_24h = len(trains_on_corridor)

    best_opportunity_duration = 0
    for opp in opportunities_on_section:
        dur = getattr(opp, "maximum_duration_mins", 0)
        if dur > best_opportunity_duration:
            best_opportunity_duration = dur

    # Freight: use majority density from available forecasts
    freight_densities = [
        getattr(ff, "expected_freight_density", "MEDIUM")
        for ff in freight_forecasts_on_section
    ]
    if freight_densities:
        # Simple majority
        from collections import Counter
        most_common = Counter(freight_densities).most_common(1)[0][0]
        freight_density_code = FREIGHT_DENSITY_CODES.get(most_common, 1)
    else:
        freight_density_code = 1  # Default MEDIUM

    scenario_code = SCENARIO_TYPE_CODES.get(scenario_type, 0)

    # ── Resource features ────────────────────────────────────────────────────
    crew_available = sum(
        1 for r in resources_for_dept if getattr(r, "resource_type", "") == "CREW"
        and getattr(r, "status", "") == "READY"
    )
    machine_available = sum(
        1 for r in resources_for_dept if getattr(r, "resource_type", "") == "MACHINE"
        and getattr(r, "status", "") == "READY"
    )

    features = {
        # Asset
        "asset_condition_score": condition_score,
        "asset_criticality_index": criticality_index,
        "asset_age_years": age_years,
        "days_since_last_maintenance": days_since_maint,
        "days_until_due": days_until_due,
        # Task
        "task_type_code": float(task_type_code),
        "department_code": float(department_code),
        "priority_score": priority_score,
        "estimated_duration_mins": estimated_duration,
        "duration_range_mins": duration_range,
        "is_emergency": float(is_emergency),
        "overdue_flag": float(overdue_flag),
        "dependency_count": float(dependency_count),
        "resource_count": float(resource_count),
        # Operational
        "train_density_24h": float(train_density_24h),
        "freight_density_code": float(freight_density_code),
        "best_opportunity_duration_mins": float(best_opportunity_duration),
        "scenario_type_code": float(scenario_code),
        # Resource
        "crew_available_count": float(crew_available),
        "machine_available_count": float(machine_available),
    }

    return features


def extract_asset_risk_features(
    asset: Any,
    tasks: List[Any],
    reference_time: Optional[datetime] = None,
) -> Dict[str, float]:
    """Extract features for asset risk assessment."""
    if reference_time is None:
        reference_time = datetime.utcnow()

    condition_score = float(getattr(asset, "condition_score", 7.0))
    criticality_index = float(getattr(asset, "criticality_index", 5.0))
    days_since_maint = _days_delta(
        getattr(asset, "last_maintenance_date", None), reference_time
    )
    due_str = getattr(asset, "next_due_date", None)
    days_until_due = -_days_delta(due_str, reference_time) if due_str else 0.0

    open_tasks = [t for t in tasks if getattr(t, "status", "") != "COMPLETED"]
    overdue_tasks = [t for t in open_tasks if getattr(t, "priority_score", 0) >= 8.0]

    return {
        "condition_score": condition_score,
        "criticality_index": criticality_index,
        "days_since_last_maintenance": days_since_maint,
        "days_until_due": days_until_due,
        "open_task_count": float(len(open_tasks)),
        "overdue_task_count": float(len(overdue_tasks)),
    }


def features_to_vector(features: Dict[str, float], feature_names: List[str]) -> List[float]:
    """Return an ordered list of feature values for model input."""
    return [features.get(name, 0.0) for name in feature_names]
