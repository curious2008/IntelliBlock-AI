import pytest
from app.generator.engine import SyntheticDataGenerator
from app.generator.config import SCENARIO_METADATA


def test_generator_determinism():
    # Same scenario + same seed = identical dataset output
    gen1 = SyntheticDataGenerator("NORMAL", seed=42)
    ds1 = gen1.generate()

    gen2 = SyntheticDataGenerator("NORMAL", seed=42)
    ds2 = gen2.generate()

    assert len(ds1["tasks"]) == len(ds2["tasks"])
    assert ds1["tasks"][0].task_id == ds2["tasks"][0].task_id
    assert ds1["tasks"][0].priority_score == ds2["tasks"][0].priority_score


def test_generator_variation():
    # Same scenario + different seed = distinct valid dataset
    gen1 = SyntheticDataGenerator("NORMAL", seed=42)
    ds1 = gen1.generate()

    gen2 = SyntheticDataGenerator("NORMAL", seed=99)
    ds2 = gen2.generate()

    assert ds1["tasks"][0].priority_score != ds2["tasks"][0].priority_score


@pytest.mark.parametrize("scenario_type", list(SCENARIO_METADATA.keys()))
def test_all_eight_scenarios_integrity(scenario_type):
    # Generates and validates each of the 8 scenarios without throwing DataValidationError
    gen = SyntheticDataGenerator(scenario_type, seed=42)
    dataset = gen.generate()

    assert len(dataset["corridors"]) >= 2
    assert len(dataset["sections"]) >= 6
    assert len(dataset["assets"]) >= 30
    assert len(dataset["tasks"]) >= 30
    assert len(dataset["trains"]) >= 30
    assert len(dataset["resources"]) >= 8
    assert len(dataset["opportunities"]) >= 10


def test_multi_department_overlap_cluster():
    # Verify multi-department overlap scenario contains co-located requests
    gen = SyntheticDataGenerator("MULTI_DEPARTMENT_OVERLAP", seed=42)
    dataset = gen.generate()
    tasks = dataset["tasks"]

    # Check tasks targeting the same section SEC-GZB-SBB-UP across ENGG, ST, TRD
    target_section_tasks = [t for t in tasks if t.location_section_id == "SEC-GZB-SBB-UP"]
    depts_in_section = set(t.department for t in target_section_tasks)

    assert "ENGG" in depts_in_section
    assert "ST" in depts_in_section
    assert "TRD" in depts_in_section
