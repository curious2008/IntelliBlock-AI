"""
Automated Test Suite for Baseline Evaluation & Stress Testing — Phase 10 IntelliBlock AI
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.evaluation.engine import benchmark_evaluator
from app.services.evaluation.stress_tester import stress_tester


class TestEvaluationUnit:
    def test_stress_tester_tiers(self):
        report = stress_tester.run_stress_test()
        assert report.all_tiers_feasible is True
        assert len(report.tiers) == 3
        assert report.max_scale_tested_tasks == 500
        # Every tier should have 0 hard violations
        for tier in report.tiers:
            assert tier.hard_violations_detected == 0
            assert tier.solver_duration_ms > 0


class TestEvaluationAPIEndpoints:
    def test_benchmark_baselines_endpoint(self):
        with TestClient(app) as client:
            res = client.post("/api/v1/evaluation/benchmark-baselines")
            assert res.status_code == 200
            data = res.json()
            assert "intelliblock_ai" in data
            assert "manual_siloed_baseline" in data
            assert data["throughput_improvement_pct"] > 0
            assert data["delay_reduction_pct"] > 0

    def test_run_stress_test_endpoint(self):
        with TestClient(app) as client:
            res = client.post("/api/v1/evaluation/run-stress-test")
            assert res.status_code == 200
            data = res.json()
            assert "tiers" in data
            assert len(data["tiers"]) == 3
            assert data["all_tiers_feasible"] is True
