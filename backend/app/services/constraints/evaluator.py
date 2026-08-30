"""
Constraint Evaluator — High Performance Deterministic Validation Engine
Phase 5 IntelliBlock AI
"""
from typing import Any, Dict, List, Optional
from app.services.constraints.models import (
    ConstraintResult, ConstraintSeverity, ConstraintViolation,
    FeasibilityReport, ScheduledTaskAssignment
)
from app.services.constraints.registry import constraint_registry, ConstraintRegistry


class ConstraintEvaluator:
    """Evaluates candidate schedule assignments against all active constraint rules."""

    def __init__(self, registry: Optional[ConstraintRegistry] = None):
        self.registry = registry or constraint_registry

    def evaluate_schedule(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> FeasibilityReport:
        results: List[ConstraintResult] = []
        all_violations: List[ConstraintViolation] = []
        hard_count = 0
        soft_count = 0
        warning_count = 0

        rules = self.registry.get_all_rules()
        for rule in rules:
            result = rule.evaluate(assignments, context)
            results.append(result)
            for v in result.violations:
                all_violations.append(v)
                if v.severity == ConstraintSeverity.HARD:
                    hard_count += 1
                elif v.severity == ConstraintSeverity.SOFT:
                    soft_count += 1
                elif v.severity == ConstraintSeverity.WARNING:
                    warning_count += 1

        is_feasible = (hard_count == 0)

        if is_feasible:
            summary = f"Schedule is FEASIBLE. 0 hard violations across {len(rules)} evaluated rules."
            if warning_count > 0:
                summary += f" ({warning_count} operational warnings flagged)."
        else:
            summary = f"Schedule is INFEASIBLE: {hard_count} hard constraint violation(s) detected across {len(rules)} evaluated rules."

        return FeasibilityReport(
            is_feasible=is_feasible,
            hard_violations_count=hard_count,
            soft_violations_count=soft_count,
            warnings_count=warning_count,
            evaluated_rules_count=len(rules),
            results=results,
            violations=all_violations,
            summary=summary
        )


# Singleton instance
constraint_evaluator = ConstraintEvaluator()
