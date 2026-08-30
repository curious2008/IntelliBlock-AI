"""
Feature Quality Validator — checks extracted feature dictionaries for data quality
issues before passing them to AI models.

Leakage prevention: explicitly blocks any post-execution field from entering a
feature vector used for pre-execution predictions.
"""
from typing import Any, Dict, List, Optional, Tuple


# Fields that must NEVER appear in pre-execution feature vectors
_POST_EXECUTION_FIELDS = {
    "actual_duration_mins",
    "overrun_mins",
    "actual_start",
    "actual_end",
    "delay_start_mins",
    "completion_status",
    "variance_reason",
}

# Expected ranges for each feature
_FEATURE_RANGES: Dict[str, Tuple[float, float]] = {
    "asset_condition_score": (1.0, 10.0),
    "asset_criticality_index": (1.0, 10.0),
    "asset_age_years": (0.0, 100.0),
    "days_since_last_maintenance": (0.0, 3650.0),   # up to 10 years
    "days_until_due": (-365.0, 3650.0),             # up to 1yr overdue, 10yr future
    "task_type_code": (0.0, 20.0),
    "department_code": (0.0, 5.0),
    "priority_score": (0.0, 10.0),
    "estimated_duration_mins": (1.0, 1440.0),       # up to 24h
    "duration_range_mins": (0.0, 1440.0),
    "is_emergency": (0.0, 1.0),
    "overdue_flag": (0.0, 1.0),
    "dependency_count": (0.0, 50.0),
    "resource_count": (0.0, 50.0),
    "train_density_24h": (0.0, 300.0),
    "freight_density_code": (0.0, 2.0),
    "best_opportunity_duration_mins": (0.0, 1440.0),
    "scenario_type_code": (0.0, 10.0),
    "crew_available_count": (0.0, 100.0),
    "machine_available_count": (0.0, 50.0),
    # Asset risk features
    "condition_score": (1.0, 10.0),
    "criticality_index": (1.0, 10.0),
    "open_task_count": (0.0, 500.0),
    "overdue_task_count": (0.0, 500.0),
}


class FeatureValidationError(Exception):
    def __init__(self, message: str, issues: List[str]):
        super().__init__(message)
        self.issues = issues


def validate_features(
    features: Dict[str, float],
    required_feature_names: Optional[List[str]] = None,
) -> bool:
    """
    Validate a feature dictionary before passing to a model.

    Checks:
    1. No post-execution (leakage) fields present
    2. All required features present (if required_feature_names given)
    3. No NaN / None values
    4. All values within expected ranges

    Raises:
        FeatureValidationError: If any validation check fails.
    """
    issues: List[str] = []

    # 1. Leakage check
    for field in _POST_EXECUTION_FIELDS:
        if field in features:
            issues.append(
                f"DATA LEAKAGE DETECTED: post-execution field '{field}' found in "
                f"pre-execution feature vector. This would invalidate predictions."
            )

    # 2. Required feature presence
    if required_feature_names:
        for fname in required_feature_names:
            if fname not in features:
                issues.append(f"Missing required feature: '{fname}'")

    # 3. None / NaN check
    for fname, val in features.items():
        if val is None:
            issues.append(f"Feature '{fname}' is None.")
            continue
        try:
            fval = float(val)
            if fval != fval:  # NaN check
                issues.append(f"Feature '{fname}' is NaN.")
        except (TypeError, ValueError):
            issues.append(f"Feature '{fname}' has non-numeric value: {val!r}")

    # 4. Range checks
    for fname, val in features.items():
        if fname in _FEATURE_RANGES:
            lo, hi = _FEATURE_RANGES[fname]
            try:
                fval = float(val)
                if not (lo <= fval <= hi):
                    issues.append(
                        f"Feature '{fname}' value {fval:.2f} is outside expected "
                        f"range [{lo}, {hi}]."
                    )
            except (TypeError, ValueError):
                pass  # Already caught above

    if issues:
        raise FeatureValidationError(
            f"Feature validation failed with {len(issues)} issue(s).",
            issues=issues,
        )

    return True
