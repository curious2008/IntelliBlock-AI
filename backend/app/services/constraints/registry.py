"""
Constraint Registry — Central Catalog of Deterministic Operational Rules
Phase 5 IntelliBlock AI
"""
from typing import Dict, List, Type
from app.services.constraints.rules import (
    BaseConstraintRule, TimeWindowValidityRule, BlockOpportunityAlignmentRule,
    ResourceNoOverlapRule, ResourceCapabilityMatchRule, TaskPrerequisitesRule,
    TrainMovementConflictRule, PowerBlockIsolationRule, CrossDeptSafetyRule
)


class ConstraintRegistry:
    """Registry maintaining all available active constraint rules."""

    def __init__(self):
        self._rules: Dict[str, BaseConstraintRule] = {}
        self._register_default_rules()

    def _register_default_rules(self):
        defaults = [
            TimeWindowValidityRule(),
            BlockOpportunityAlignmentRule(),
            ResourceNoOverlapRule(),
            ResourceCapabilityMatchRule(),
            TaskPrerequisitesRule(),
            TrainMovementConflictRule(),
            PowerBlockIsolationRule(),
            CrossDeptSafetyRule(),
        ]
        for rule in defaults:
            self._rules[rule.rule_id] = rule

    def register(self, rule: BaseConstraintRule):
        self._rules[rule.rule_id] = rule

    def get_rule(self, rule_id: str) -> BaseConstraintRule:
        return self._rules[rule_id]

    def get_all_rules(self) -> List[BaseConstraintRule]:
        return list(self._rules.values())

    def list_rules_metadata(self) -> List[Dict[str, str]]:
        return [
            {
                "rule_id": r.rule_id,
                "rule_name": r.rule_name,
                "constraint_type": r.constraint_type.value,
                "severity": r.severity.value,
            }
            for r in self._rules.values()
        ]


# Singleton instance
constraint_registry = ConstraintRegistry()
