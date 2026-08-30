"""
Bundling Engine Package — Phase 7 IntelliBlock AI
"""
from app.services.bundling.models import (
    BundledTaskItem, BundledPossessionBlock, BundlingSynergyReport
)
from app.services.bundling.engine import (
    BundlingCoordinator, bundling_coordinator
)

__all__ = [
    "BundledTaskItem",
    "BundledPossessionBlock",
    "BundlingSynergyReport",
    "BundlingCoordinator",
    "bundling_coordinator",
]
