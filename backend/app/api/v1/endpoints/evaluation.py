"""
FastAPI Endpoints for Evaluation, Baselines & Stress Testing
Phase 10 IntelliBlock AI
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.evaluation import (
    BaselineComparisonReportResponse, StressTestReportResponse
)
from app.services.evaluation.engine import benchmark_evaluator
from app.services.evaluation.stress_tester import stress_tester

router = APIRouter()


@router.post("/benchmark-baselines", response_model=BaselineComparisonReportResponse)
def run_baseline_benchmarks(
    scenario_type: str = "NORMAL",
    db: Session = Depends(get_db)
):
    """
    Executes comparison benchmarks between IntelliBlock AI and traditional railway baselines
    (Manual Siloed, FCFS Greedy, Static Fixed Blocks).
    """
    report = benchmark_evaluator.run_benchmark(db, scenario_type=scenario_type)
    return report


@router.post("/run-stress-test", response_model=StressTestReportResponse)
def run_stress_test():
    """
    Executes scalability stress testing across problem sizes up to 500 tasks / 150 block windows.
    """
    report = stress_tester.run_stress_test()
    return report
