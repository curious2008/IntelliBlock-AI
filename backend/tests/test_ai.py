"""
Phase 3A AI Test Suite

Tests:
  - Feature extraction correctness and leakage prevention
  - Simulator determinism
  - Duration and overrun predictor correctness
  - Asset risk formula correctness
  - AI API endpoint integration
  - Model-not-ready error handling
  - Regression: all Phase 1/2 tests remain unaffected
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import engine, Base
from data.seed_data import seed_database

# ─── DB Fixture ───────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database("NORMAL", 42)


# ─── Feature Engineering Tests ────────────────────────────────────────────────

class TestFeatureExtraction:
    # Valid baseline values that satisfy all feature range constraints.
    # Note: is_emergency and overdue_flag must be 0.0 or 1.0; freight_density_code 0-2.
    _valid_clean_features = {
        "asset_condition_score": 7.0,
        "asset_criticality_index": 6.0,
        "asset_age_years": 5.0,
        "days_since_last_maintenance": 90.0,
        "days_until_due": 7.0,
        "task_type_code": 2.0,
        "department_code": 1.0,
        "priority_score": 5.0,
        "estimated_duration_mins": 120.0,
        "duration_range_mins": 60.0,
        "is_emergency": 0.0,
        "overdue_flag": 0.0,
        "dependency_count": 2.0,
        "resource_count": 3.0,
        "train_density_24h": 20.0,
        "freight_density_code": 1.0,
        "best_opportunity_duration_mins": 180.0,
        "scenario_type_code": 0.0,
        "crew_available_count": 4.0,
        "machine_available_count": 2.0,
    }

    def test_no_post_execution_leakage(self):
        """Feature validator must reject any post-execution field."""
        from app.services.ai.features.validator import validate_features, FeatureValidationError
        from app.services.ai.features.extractor import DURATION_FEATURE_NAMES

        clean_features = dict(self._valid_clean_features)
        # Should pass without error
        assert validate_features(clean_features, DURATION_FEATURE_NAMES) is True

        # Inject post-execution field — must raise
        leaky_features = dict(clean_features)
        leaky_features["actual_duration_mins"] = 120.0
        with pytest.raises(FeatureValidationError) as exc_info:
            validate_features(leaky_features)
        assert any("leakage" in issue.lower() or "actual_duration" in issue.lower()
                   for issue in exc_info.value.issues)

    def test_overrun_field_blocked(self):
        """overrun_mins must never enter a feature vector."""
        from app.services.ai.features.validator import validate_features, FeatureValidationError
        from app.services.ai.features.extractor import DURATION_FEATURE_NAMES

        bad_features = {name: 5.0 for name in DURATION_FEATURE_NAMES}
        bad_features["overrun_mins"] = 35.0
        with pytest.raises(FeatureValidationError):
            validate_features(bad_features)

    def test_range_validation(self):
        """Features outside expected ranges should raise FeatureValidationError."""
        from app.services.ai.features.validator import validate_features, FeatureValidationError
        from app.services.ai.features.extractor import DURATION_FEATURE_NAMES

        bad_features = {name: 5.0 for name in DURATION_FEATURE_NAMES}
        bad_features["asset_condition_score"] = 99.0  # Out of [1, 10]
        with pytest.raises(FeatureValidationError) as exc_info:
            validate_features(bad_features)
        assert any("asset_condition_score" in issue for issue in exc_info.value.issues)

    def test_feature_names_stable(self):
        """Feature name list must be deterministic and non-empty."""
        from app.services.ai.features.extractor import DURATION_FEATURE_NAMES
        assert len(DURATION_FEATURE_NAMES) >= 18
        assert "estimated_duration_mins" in DURATION_FEATURE_NAMES
        assert "asset_condition_score" in DURATION_FEATURE_NAMES
        # Post-execution fields must NOT be in feature names
        assert "actual_duration_mins" not in DURATION_FEATURE_NAMES
        assert "overrun_mins" not in DURATION_FEATURE_NAMES


# ─── Simulator Determinism Tests ──────────────────────────────────────────────

class TestSimulatorDeterminism:
    def test_same_seed_same_output(self):
        """Same seed must produce identical training dataset."""
        from app.services.ai.training.simulator import generate_training_examples
        X1, y1, ov1 = generate_training_examples(["NORMAL"], seed=42)
        X2, y2, ov2 = generate_training_examples(["NORMAL"], seed=42)
        assert X1 == X2
        assert y1 == y2
        assert ov1 == ov2

    def test_different_seed_different_output(self):
        """Different seeds must produce different training data."""
        from app.services.ai.training.simulator import generate_training_examples
        X1, y1, _ = generate_training_examples(["NORMAL"], seed=42)
        X2, y2, _ = generate_training_examples(["NORMAL"], seed=99)
        # At least some targets should differ
        assert any(abs(a - b) > 0.01 for a, b in zip(y1, y2))

    def test_non_trivial_targets(self):
        """Targets must NOT be identical to estimated_duration_mins feature."""
        from app.services.ai.training.simulator import generate_training_examples
        from app.services.ai.features.extractor import DURATION_FEATURE_NAMES
        X, y, _ = generate_training_examples(["NORMAL"], seed=42)
        est_idx = DURATION_FEATURE_NAMES.index("estimated_duration_mins")
        estimated_vals = [row[est_idx] for row in X]
        identical_count = sum(1 for e, t in zip(estimated_vals, y) if abs(e - t) < 0.01)
        # At most 10% identical to estimated (allowing for edge-case noise = 0)
        assert identical_count / len(y) < 0.10


# ─── Asset Risk Tests ─────────────────────────────────────────────────────────

class TestAssetRiskPredictor:
    def test_high_risk_low_condition(self):
        """Asset with poor condition, high criticality, and overdue tasks → HIGH/CRITICAL risk."""
        from app.services.ai.predictors.asset_risk import assess_asset_risk
        result = assess_asset_risk(
            asset_features={
                "condition_score": 2.0,  # Very poor
                "criticality_index": 9.5,
                "days_since_last_maintenance": 300.0,
                "days_until_due": -30.0,  # 30 days overdue
                "open_task_count": 5.0,
                "overdue_task_count": 4.0,
            },
            asset_id="TEST-AST-001",
        )
        assert result["risk_level"] in ("HIGH", "CRITICAL")
        assert result["risk_score"] >= 6.0
        assert result["prediction_basis"] == "SYNTHETIC_PROTOTYPE"

    def test_low_risk_good_condition(self):
        """Asset with good condition, low criticality → LOW risk."""
        from app.services.ai.predictors.asset_risk import assess_asset_risk
        result = assess_asset_risk(
            asset_features={
                "condition_score": 9.0,
                "criticality_index": 2.0,
                "days_since_last_maintenance": 10.0,
                "days_until_due": 60.0,
                "open_task_count": 0.0,
                "overdue_task_count": 0.0,
            },
            asset_id="TEST-AST-002",
        )
        assert result["risk_level"] in ("LOW", "MEDIUM")
        assert result["risk_score"] <= 5.0

    def test_score_components_present(self):
        """Score components must be present and positive."""
        from app.services.ai.predictors.asset_risk import assess_asset_risk
        result = assess_asset_risk(
            {"condition_score": 5.0, "criticality_index": 5.0,
             "days_since_last_maintenance": 90.0, "days_until_due": 0.0,
             "open_task_count": 1.0, "overdue_task_count": 0.0},
            "TEST-AST-003",
        )
        assert "score_components" in result
        assert "weight_config" in result
        assert all(v >= 0 for v in result["score_components"].values())


# ─── ML Predictor Tests ───────────────────────────────────────────────────────

class TestMLPredictors:
    _base_features = {
        "asset_condition_score": 7.0, "asset_criticality_index": 6.0,
        "asset_age_years": 5.0, "days_since_last_maintenance": 90.0,
        "days_until_due": 7.0, "task_type_code": 0.0,
        "department_code": 0.0, "priority_score": 5.0,
        "estimated_duration_mins": 120.0, "duration_range_mins": 60.0,
        "is_emergency": 0.0, "overdue_flag": 0.0,
        "dependency_count": 0.0, "resource_count": 2.0,
        "train_density_24h": 20.0, "freight_density_code": 1.0,
        "best_opportunity_duration_mins": 180.0, "scenario_type_code": 0.0,
        "crew_available_count": 3.0, "machine_available_count": 1.0,
    }

    def test_duration_prediction_valid(self):
        from app.services.ai.predictors.duration import predict_duration
        result = predict_duration(dict(self._base_features), "TSK-TEST-001")
        assert result["predicted_duration_minutes"] > 0
        assert result["lower_bound_minutes"] <= result["predicted_duration_minutes"]
        assert result["upper_bound_minutes"] >= result["predicted_duration_minutes"]
        assert 0.0 <= result["confidence"] <= 1.0
        assert result["prediction_basis"] == "SYNTHETIC_PROTOTYPE"

    def test_overrun_prediction_valid(self):
        from app.services.ai.predictors.overrun import predict_overrun_risk
        result = predict_overrun_risk(dict(self._base_features), "TSK-TEST-002")
        assert 0.0 <= result["overrun_probability"] <= 1.0
        assert result["risk_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
        assert result["prediction_basis"] == "SYNTHETIC_PROTOTYPE"

    def test_duration_leakage_rejected(self):
        """Injecting post-execution field into prediction must raise FeatureValidationError."""
        from app.services.ai.predictors.duration import predict_duration
        from app.services.ai.features.validator import FeatureValidationError
        bad_features = dict(self._base_features)
        bad_features["actual_duration_mins"] = 145.0
        with pytest.raises(FeatureValidationError):
            predict_duration(bad_features, "TSK-LEAK-001")


# ─── AI API Endpoint Tests ────────────────────────────────────────────────────

class TestAIAPIEndpoints:
    _valid_payload = {
        "task_id": "TSK-API-001",
        "task_type": "TRACK_TAMPING",
        "department": "ENGG",
        "estimated_duration_mins": 120,
        "minimum_duration_mins": 90,
        "maximum_duration_mins": 180,
        "priority_score": 6.5,
        "is_emergency": False,
        "dependency_count": 0,
        "resource_count": 2,
        "asset_condition_score": 7.0,
        "asset_criticality_index": 6.5,
        "asset_age_years": 4.0,
        "days_since_last_maintenance": 60.0,
        "days_until_due": 10.0,
        "crew_available_count": 3,
        "machine_available_count": 1,
        "train_density_24h": 25,
        "freight_density": "MEDIUM",
        "best_opportunity_duration_mins": 180,
        "scenario_type": "NORMAL",
    }

    def test_predict_duration_success(self):
        with TestClient(app) as client:
            response = client.post("/api/v1/ai/predict-duration", json=self._valid_payload)
            assert response.status_code == 200
            data = response.json()
            assert "predicted_duration_minutes" in data
            assert "lower_bound_minutes" in data
            assert "upper_bound_minutes" in data
            assert data["prediction_basis"] == "SYNTHETIC_PROTOTYPE"

    def test_predict_overrun_success(self):
        with TestClient(app) as client:
            response = client.post("/api/v1/ai/predict-overrun-risk", json=self._valid_payload)
            assert response.status_code == 200
            data = response.json()
            assert "overrun_probability" in data
            assert "risk_level" in data
            assert data["risk_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")

    def test_assess_asset_risk_success(self):
        with TestClient(app) as client:
            payload = {
                "asset_id": "AST-TEST-001",
                "condition_score": 6.5,
                "criticality_index": 7.0,
                "days_since_last_maintenance": 120.0,
                "days_until_due": -5.0,
                "open_task_count": 3,
                "overdue_task_count": 1,
            }
            response = client.post("/api/v1/ai/assess-maintenance-risk", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert "risk_score" in data
            assert data["risk_score"] >= 0.0
            assert data["prediction_basis"] == "SYNTHETIC_PROTOTYPE"

    def test_model_status_endpoint(self):
        with TestClient(app) as client:
            response = client.get("/api/v1/ai/model-status")
            assert response.status_code == 200
            data = response.json()
            assert "models" in data
            model_names = [m["model_name"] for m in data["models"]]
            assert "duration_rf" in model_names
            assert "overrun_gbc" in model_names

    def test_invalid_priority_score_rejected(self):
        """priority_score > 10 must return 422 validation error."""
        with TestClient(app) as client:
            bad_payload = dict(self._valid_payload)
            bad_payload["priority_score"] = 15.0  # Exceeds max
            response = client.post("/api/v1/ai/predict-duration", json=bad_payload)
            assert response.status_code == 422

    def test_missing_required_field_rejected(self):
        """Missing required field must return 422."""
        with TestClient(app) as client:
            bad_payload = dict(self._valid_payload)
            del bad_payload["task_type"]
            response = client.post("/api/v1/ai/predict-duration", json=bad_payload)
            assert response.status_code == 422
