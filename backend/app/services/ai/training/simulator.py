"""
Synthetic Training Data Simulator.

Generates (feature_vector, actual_duration_target, overrun_target) training examples
from SyntheticDataGenerator scenario datasets.

IMPORTANT: The relationship between features and targets is explicitly documented
in docs/AI_PIPELINE.md. Targets are NOT simply equal to any single input feature.
Controlled noise is introduced to ensure the model learns a non-trivial mapping.
"""
import random
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from app.generator.engine import SyntheticDataGenerator
from app.services.ai.features.extractor import (
    extract_task_features,
    DURATION_FEATURE_NAMES,
    features_to_vector,
)


def _compute_simulated_actual_duration(
    features: Dict[str, float],
    rng: random.Random,
) -> float:
    """
    Compute simulated actual_duration_mins using a documented multi-factor formula.

    Formula (updated in Phase 3A validation — see docs/AI_PIPELINE.md §4):
        base = estimated_duration_mins (planner's nominal estimate)

        condition_adj = 0.12 * (5 - condition_score) / 5
            → Poor condition (score<5) adds time; good condition (score>5) saves time.
        resource_adj  = 0.08 * (3 - crew_count) / 3
            → Fewer crew than nominal (3) adds time; more crew saves time.
        overdue_adj   = 0.06 * overdue_flag
            → Overdue tasks have extra urgency overhead.
        traffic_adj   = 0.04 * ((train_density_24h - 20) / 20)
            → Centred at density=20 (neutral); above 20 adds time, below saves time.
        noise ~ N(0, 0.12 * base)  [Gaussian, controlled]

    The combined adjustment is additive (not multiplicative) to allow the formula
    to produce actual < estimated (good conditions, light traffic, sufficient crew).
    This produces a balanced ~40-60% overrun rate for better ML class balance.
    The result is clamped to [max(1, min_duration * 0.9), max_duration * 1.5].
    """
    base = features.get("estimated_duration_mins", 120.0)
    cond = features.get("asset_condition_score", 7.0)
    crew = features.get("crew_available_count", 3.0)
    overdue = features.get("overdue_flag", 0.0)
    density = features.get("train_density_24h", 20.0)
    min_dur = base - features.get("duration_range_mins", 30.0) / 2
    max_dur = base + features.get("duration_range_mins", 30.0) / 2

    # Centred, signed adjustment factors (positive = slower, negative = faster)
    # Strengthened for clearer feature-label signal (monotone relationships expected)
    condition_adj = 0.18 * (5.0 - cond) / 5.0          # range: [-0.036, +0.18]
    resource_adj  = 0.10 * (3.0 - crew) / 3.0           # allows negative for large crews
    overdue_adj   = 0.12 * overdue                        # range: [0, +0.12] — stronger signal
    traffic_adj   = 0.06 * ((density - 20.0) / 20.0)    # centred at density=20
    # Emergency tasks have additional time pressure
    emergency = features.get("is_emergency", 0.0)
    emergency_adj = 0.10 * emergency

    # Total fractional adjustment applied to base
    total_adj = condition_adj + resource_adj + overdue_adj + traffic_adj + emergency_adj

    # Controlled Gaussian noise: scale = 10% of base duration
    noise = rng.gauss(0.0, 0.10 * base)

    actual = base * (1.0 + total_adj) + noise
    actual = max(max(min_dur * 0.9, 1.0), min(actual, max_dur * 1.5))
    return round(actual, 1)


def generate_training_examples(
    scenario_types: Optional[List[str]] = None,
    seed: int = 42,
) -> Tuple[List[List[float]], List[float], List[int]]:
    """
    Generate (X, y_duration, y_overrun) training examples across multiple scenarios.

    Args:
        scenario_types: List of scenario type strings to generate data for.
                        Defaults to the four "training" scenarios.
        seed: Master random seed for reproducibility.

    Returns:
        X: List of feature vectors (List[float], ordered by DURATION_FEATURE_NAMES)
        y_duration: Simulated actual_duration_mins for each example
        y_overrun: Binary overrun label (1 if actual > estimated, else 0)
    """
    if scenario_types is None:
        scenario_types = [
            "NORMAL",
            "HEAVY_TRAFFIC",
            "HIGH_MAINTENANCE_DEMAND",
            "RESOURCE_SHORTAGE",
        ]

    rng = random.Random(seed)
    X: List[List[float]] = []
    y_duration: List[float] = []
    y_overrun: List[int] = []

    for sc_type in scenario_types:
        scenario_seed = rng.randint(1, 10000)
        generator = SyntheticDataGenerator(scenario_type=sc_type, seed=scenario_seed)
        dataset = generator.generate()

        tasks = dataset["tasks"]
        assets = {a.asset_id: a for a in dataset["assets"]}
        trains = dataset["trains"]
        opportunities = dataset["opportunities"]
        freight_forecasts = dataset["freight_forecasts"]
        resources = dataset["resources"]

        for task in tasks:
            asset = assets.get(task.asset_id)
            if asset is None:
                continue

            # Build operational context for this task
            corridor_trains = [t for t in trains if t.corridor_id == task.location_corridor_id]
            section_opps = [o for o in opportunities if o.track_section_id == task.location_section_id]
            section_ff = [ff for ff in freight_forecasts if ff.track_section_id == task.location_section_id]
            dept_resources = [r for r in resources if r.department == task.department]

            features = extract_task_features(
                task=task,
                asset=asset,
                trains_on_corridor=corridor_trains,
                opportunities_on_section=section_opps,
                freight_forecasts_on_section=section_ff,
                resources_for_dept=dept_resources,
                scenario_type=sc_type,
                reference_time=generator.base_time,
            )

            actual_duration = _compute_simulated_actual_duration(features, rng)
            overrun_label = 1 if actual_duration > features["estimated_duration_mins"] else 0

            feature_vector = features_to_vector(features, DURATION_FEATURE_NAMES)
            X.append(feature_vector)
            y_duration.append(actual_duration)
            y_overrun.append(overrun_label)

    return X, y_duration, y_overrun
