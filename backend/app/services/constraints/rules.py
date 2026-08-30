"""
Railway Operational Hard and Soft Constraint Rules — Phase 5 IntelliBlock AI

Implements all 8 domain constraint validation rules governing Indian Railways
line possession, rolling stock safety, rolling machine conflicts, and crew availability.
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from app.services.constraints.models import (
    ConstraintResult, ConstraintSeverity, ConstraintType,
    ConstraintViolation, ScheduledTaskAssignment
)


def _get_val(obj: Any, key: str, default: Any = None) -> Any:
    """Safely extract attribute or dictionary key without boolean falsy default bugs."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


class BaseConstraintRule(ABC):
    """Abstract base class for all constraint rules."""

    @property
    @abstractmethod
    def rule_id(self) -> str:
        pass

    @property
    @abstractmethod
    def rule_name(self) -> str:
        pass

    @property
    @abstractmethod
    def constraint_type(self) -> ConstraintType:
        pass

    @property
    @abstractmethod
    def severity(self) -> ConstraintSeverity:
        pass

    @abstractmethod
    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        pass


class TimeWindowValidityRule(BaseConstraintRule):
    """Rule 1: Start time must be before end time and duration must satisfy minimum required."""
    rule_id = "CR-001"
    rule_name = "Time Window Temporal Validity"
    constraint_type = ConstraintType.TIME_WINDOW_VALIDITY
    severity = ConstraintSeverity.HARD

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        tasks_map = context.get("tasks", {})

        for a in assignments:
            if a.scheduled_start >= a.scheduled_end:
                violations.append(ConstraintViolation(
                    constraint_id=self.rule_id,
                    constraint_type=self.constraint_type,
                    severity=self.severity,
                    message=f"Task {a.task_id} has invalid time window: start ({a.scheduled_start}) is not before end ({a.scheduled_end}).",
                    affected_entity_ids=[a.task_id],
                    details={"start": str(a.scheduled_start), "end": str(a.scheduled_end)}
                ))
                continue

            duration_mins = (a.scheduled_end - a.scheduled_start).total_seconds() / 60.0
            task = tasks_map.get(a.task_id)
            if task:
                min_mins = _get_val(task, "minimum_duration_mins", 1) or 1
                if duration_mins < min_mins:
                    violations.append(ConstraintViolation(
                        constraint_id=self.rule_id,
                        constraint_type=self.constraint_type,
                        severity=self.severity,
                        message=f"Task {a.task_id} allocated duration ({duration_mins:.0f} mins) is less than minimum required duration ({min_mins} mins).",
                        affected_entity_ids=[a.task_id],
                        details={"allocated_mins": duration_mins, "minimum_mins": min_mins}
                    ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )


class BlockOpportunityAlignmentRule(BaseConstraintRule):
    """Rule 2: Task schedule must fall strictly within the designated line block opportunity window."""
    rule_id = "CR-002"
    rule_name = "Block Opportunity Alignment"
    constraint_type = ConstraintType.BLOCK_OPPORTUNITY_ALIGNMENT
    severity = ConstraintSeverity.HARD

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        opps_map = context.get("opportunities", {})

        for a in assignments:
            if not a.opportunity_id:
                continue

            opp = opps_map.get(a.opportunity_id)
            if not opp:
                violations.append(ConstraintViolation(
                    constraint_id=self.rule_id,
                    constraint_type=self.constraint_type,
                    severity=self.severity,
                    message=f"Task {a.task_id} assigned to non-existent Block Opportunity '{a.opportunity_id}'.",
                    affected_entity_ids=[a.task_id, a.opportunity_id],
                    details={"opportunity_id": a.opportunity_id}
                ))
                continue

            opp_start = _get_val(opp, "window_start")
            opp_end = _get_val(opp, "window_end")

            if isinstance(opp_start, str):
                opp_start = datetime.fromisoformat(opp_start.replace("Z", "+00:00"))
            if isinstance(opp_end, str):
                opp_end = datetime.fromisoformat(opp_end.replace("Z", "+00:00"))

            if opp_start and opp_end:
                if a.scheduled_start < opp_start or a.scheduled_end > opp_end:
                    violations.append(ConstraintViolation(
                        constraint_id=self.rule_id,
                        constraint_type=self.constraint_type,
                        severity=self.severity,
                        message=f"Task {a.task_id} window [{a.scheduled_start} - {a.scheduled_end}] exceeds designated block opportunity [{opp_start} - {opp_end}].",
                        affected_entity_ids=[a.task_id, a.opportunity_id],
                        details={"opp_start": str(opp_start), "opp_end": str(opp_end)}
                    ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )


class ResourceNoOverlapRule(BaseConstraintRule):
    """Rule 3: A single resource (machine or gang) cannot be assigned to overlapping tasks."""
    rule_id = "CR-003"
    rule_name = "Resource Non-Overlap Constraint"
    constraint_type = ConstraintType.RESOURCE_NO_OVERLAP
    severity = ConstraintSeverity.HARD

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        resource_usage: Dict[str, List[ScheduledTaskAssignment]] = {}

        for a in assignments:
            for r_id in a.assigned_resource_ids:
                resource_usage.setdefault(r_id, []).append(a)

        for r_id, assigned_list in resource_usage.items():
            n = len(assigned_list)
            for i in range(n):
                for j in range(i + 1, n):
                    t1 = assigned_list[i]
                    t2 = assigned_list[j]
                    if (t1.scheduled_start < t2.scheduled_end) and (t1.scheduled_end > t2.scheduled_start):
                        violations.append(ConstraintViolation(
                            constraint_id=self.rule_id,
                            constraint_type=self.constraint_type,
                            severity=self.severity,
                            message=f"Resource conflict: Resource '{r_id}' is double-booked between Task '{t1.task_id}' and Task '{t2.task_id}' during overlapping windows.",
                            affected_entity_ids=[r_id, t1.task_id, t2.task_id],
                            details={
                                "resource_id": r_id,
                                "task1_window": f"{t1.scheduled_start} - {t1.scheduled_end}",
                                "task2_window": f"{t2.scheduled_start} - {t2.scheduled_end}"
                            }
                        ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )


class ResourceCapabilityMatchRule(BaseConstraintRule):
    """Rule 4: Resources assigned to a task must match the capabilities demanded by the task type."""
    rule_id = "CR-004"
    rule_name = "Resource Capability & Department Match"
    constraint_type = ConstraintType.RESOURCE_CAPABILITY_MATCH
    severity = ConstraintSeverity.HARD

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        resources_map = context.get("resources", {})
        tasks_map = context.get("tasks", {})

        for a in assignments:
            task = tasks_map.get(a.task_id)
            if not task:
                continue

            task_dept = _get_val(task, "department")
            
            for r_id in a.assigned_resource_ids:
                res = resources_map.get(r_id)
                if not res:
                    violations.append(ConstraintViolation(
                        constraint_id=self.rule_id,
                        constraint_type=self.constraint_type,
                        severity=self.severity,
                        message=f"Task '{a.task_id}' references unknown resource '{r_id}'.",
                        affected_entity_ids=[a.task_id, r_id]
                    ))
                    continue

                res_dept = _get_val(res, "department")
                if task_dept and res_dept and (task_dept != res_dept):
                    violations.append(ConstraintViolation(
                        constraint_id=self.rule_id,
                        constraint_type=self.constraint_type,
                        severity=self.severity,
                        message=f"Department mismatch: Task '{a.task_id}' ({task_dept}) cannot use resource '{r_id}' belonging to department '{res_dept}'.",
                        affected_entity_ids=[a.task_id, r_id],
                        details={"task_dept": task_dept, "resource_dept": res_dept}
                    ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )


class TaskPrerequisitesRule(BaseConstraintRule):
    """Rule 5: Predecessor tasks must complete before dependent successor tasks start."""
    rule_id = "CR-005"
    rule_name = "Task Prerequisite Temporal Precedence"
    constraint_type = ConstraintType.TASK_PREREQUISITES
    severity = ConstraintSeverity.HARD

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        assignment_map = {a.task_id: a for a in assignments}
        tasks_map = context.get("tasks", {})

        for a in assignments:
            task = tasks_map.get(a.task_id)
            if not task:
                continue

            prereqs = _get_val(task, "prerequisite_task_ids", []) or []
            for pred_id in prereqs:
                pred_assignment = assignment_map.get(pred_id)
                if pred_assignment:
                    if pred_assignment.scheduled_end > a.scheduled_start:
                        violations.append(ConstraintViolation(
                            constraint_id=self.rule_id,
                            constraint_type=self.constraint_type,
                            severity=self.severity,
                            message=f"Precedence violation: Prerequisite Task '{pred_id}' ends at ({pred_assignment.scheduled_end}), after dependent Task '{a.task_id}' starts at ({a.scheduled_start}).",
                            affected_entity_ids=[a.task_id, pred_id],
                            details={
                                "predecessor_end": str(pred_assignment.scheduled_end),
                                "successor_start": str(a.scheduled_start)
                            }
                        ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )


class TrainMovementConflictRule(BaseConstraintRule):
    """Rule 6: Track section maintenance blocks must not overlap with scheduled trains on the same section without opportunity."""
    rule_id = "CR-006"
    rule_name = "Train Traffic Non-Interference"
    constraint_type = ConstraintType.TRAIN_MOVEMENT_CONFLICT
    severity = ConstraintSeverity.HARD

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        trains_map = context.get("trains", {})
        tasks_map = context.get("tasks", {})

        for a in assignments:
            task = tasks_map.get(a.task_id)
            task_section = a.track_section_id or _get_val(task, "location_section_id")
            
            if not task_section:
                continue

            for t_id, train in trains_map.items():
                train_section = _get_val(train, "track_section_id")
                if train_section and train_section == task_section:
                    t_entry = _get_val(train, "scheduled_entry_time")
                    t_exit = _get_val(train, "scheduled_exit_time")

                    if isinstance(t_entry, str):
                        t_entry = datetime.fromisoformat(t_entry.replace("Z", "+00:00"))
                    if isinstance(t_exit, str):
                        t_exit = datetime.fromisoformat(t_exit.replace("Z", "+00:00"))

                    if t_entry and t_exit:
                        if (a.scheduled_start < t_exit) and (a.scheduled_end > t_entry):
                            priority = _get_val(train, "priority_category", 3)
                            if not a.opportunity_id:
                                violations.append(ConstraintViolation(
                                    constraint_id=self.rule_id,
                                    constraint_type=self.constraint_type,
                                    severity=self.severity,
                                    message=f"Traffic conflict: Task '{a.task_id}' on section '{task_section}' directly conflicts with scheduled Train '{_get_val(train, 'train_number', t_id)}' (Priority {priority}) from {t_entry} to {t_exit}.",
                                    affected_entity_ids=[a.task_id, str(t_id)],
                                    details={"track_section": task_section, "train_entry": str(t_entry), "train_exit": str(t_exit)}
                                ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )


class PowerBlockIsolationRule(BaseConstraintRule):
    """Rule 7: Electrical/OHE tasks requiring power isolation must have verified power block availability."""
    rule_id = "CR-007"
    rule_name = "Power Block Electrical Isolation"
    constraint_type = ConstraintType.POWER_BLOCK_ISOLATION
    severity = ConstraintSeverity.HARD

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        opps_map = context.get("opportunities", {})
        tasks_map = context.get("tasks", {})

        for a in assignments:
            task = tasks_map.get(a.task_id)
            task_dept = _get_val(task, "department")
            requires_power_shutoff = a.requires_power_block or (task_dept == "TRD")

            if requires_power_shutoff and a.opportunity_id:
                opp = opps_map.get(a.opportunity_id)
                if opp:
                    has_power_block = _get_val(opp, "is_power_block_available", True)
                    if has_power_block is False:
                        violations.append(ConstraintViolation(
                            constraint_id=self.rule_id,
                            constraint_type=self.constraint_type,
                            severity=self.severity,
                            message=f"Traction safety violation: Task '{a.task_id}' requires OHE power block shutoff, but Block Opportunity '{a.opportunity_id}' does not have power block clearance.",
                            affected_entity_ids=[a.task_id, a.opportunity_id],
                            details={"opportunity_id": a.opportunity_id}
                        ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )


class CrossDeptSafetyRule(BaseConstraintRule):
    """Rule 8: Incompatible simultaneous maintenance activities on the same section are forbidden."""
    rule_id = "CR-008"
    rule_name = "Cross-Department Simultaneous Safety"
    constraint_type = ConstraintType.CROSS_DEPT_SAFETY
    severity = ConstraintSeverity.HARD

    INCOMPATIBLE_PAIRS = {
        ("TRACK_TAMPING", "POINT_MACHINE_OVERHAUL"),
        ("BALLAST_CLEANING", "SIGNAL_CABLE_LAYING"),
        ("RAIL_GRINDING", "RELAY_ROOM_TESTING"),
    }

    def evaluate(
        self,
        assignments: List[ScheduledTaskAssignment],
        context: Dict[str, Any]
    ) -> ConstraintResult:
        violations: List[ConstraintViolation] = []
        tasks_map = context.get("tasks", {})

        n = len(assignments)
        for i in range(n):
            for j in range(i + 1, n):
                a1 = assignments[i]
                a2 = assignments[j]

                if (a1.scheduled_start < a2.scheduled_end) and (a1.scheduled_end > a2.scheduled_start):
                    t1 = tasks_map.get(a1.task_id)
                    t2 = tasks_map.get(a2.task_id)
                    if t1 and t2:
                        sec1 = a1.track_section_id or _get_val(t1, "location_section_id")
                        sec2 = a2.track_section_id or _get_val(t2, "location_section_id")

                        if sec1 and sec2 and (sec1 == sec2):
                            type1 = _get_val(t1, "task_type", "")
                            type2 = _get_val(t2, "task_type", "")

                            if (type1, type2) in self.INCOMPATIBLE_PAIRS or (type2, type1) in self.INCOMPATIBLE_PAIRS:
                                violations.append(ConstraintViolation(
                                    constraint_id=self.rule_id,
                                    constraint_type=self.constraint_type,
                                    severity=self.severity,
                                    message=f"Safety hazard: Incompatible tasks '{a1.task_id}' ({type1}) and '{a2.task_id}' ({type2}) cannot occur simultaneously on section '{sec1}'.",
                                    affected_entity_ids=[a1.task_id, a2.task_id, sec1],
                                    details={"section_id": sec1, "task1_type": type1, "task2_type": type2}
                                ))

        return ConstraintResult(
            rule_id=self.rule_id,
            rule_name=self.rule_name,
            severity=self.severity,
            passed=(len(violations) == 0),
            violations=violations
        )
