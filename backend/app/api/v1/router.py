from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, departments, corridors, assets,
    maintenance_tasks, trains, resources, block_opportunities,
    scenarios, freight_forecasts, ai, constraints, optimizer, bundling,
    replanning, explainability, evaluation, integrations
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(ai.router, tags=["AI Predictions"])
api_router.include_router(constraints.router, prefix="/constraints", tags=["Constraint Engine"])
api_router.include_router(optimizer.router, prefix="/optimizer", tags=["Optimization Engine"])
api_router.include_router(bundling.router, prefix="/bundling", tags=["Task Bundling Engine"])
api_router.include_router(replanning.router, prefix="/replanning", tags=["Dynamic Replanning & What-If"])
api_router.include_router(explainability.router, prefix="/explainability", tags=["Explainability & Decision Support"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["Evaluation & Benchmarks"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["External Railway Integrations & n8n"])
api_router.include_router(scenarios.router, tags=["Scenarios"])
api_router.include_router(departments.router, tags=["Departments"])
api_router.include_router(corridors.router, tags=["Corridors"])
api_router.include_router(assets.router, tags=["Assets"])
api_router.include_router(maintenance_tasks.router, tags=["Maintenance Tasks"])
api_router.include_router(trains.router, tags=["Train Movements"])
api_router.include_router(freight_forecasts.router, tags=["Freight Forecasts"])
api_router.include_router(resources.router, tags=["Resources"])
api_router.include_router(block_opportunities.router, tags=["Block Opportunities"])








