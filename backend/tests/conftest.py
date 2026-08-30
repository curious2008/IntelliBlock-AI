"""
Test configuration for IntelliBlock AI test suite.

Ensures:
  - Test environment variables set BEFORE app imports.
  - Dedicated local test SQLite database for test suite isolation.
  - AI model_store singleton loaded once per test session.
"""
import os
import sys

# Force test database URL BEFORE any app imports
os.environ["DATABASE_URL"] = "sqlite:///./test_intelliblock.db"
os.environ["ENVIRONMENT"] = "testing"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base, engine, SessionLocal
from app.services.ai.registry.model_store import model_store
from app.generator.engine import SyntheticDataGenerator


@pytest.fixture(scope="session", autouse=True)
def setup_test_suite():
    """Session setup: Load AI models, create test schema, seed test scenario."""
    # 1. Load AI models
    model_store.load_all()

    # 2. Setup test DB schema and seed base scenario
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        generator = SyntheticDataGenerator(scenario_type="NORMAL", seed=42)
        dataset = generator.generate()
        db.add_all(dataset["departments"])
        db.add_all(dataset["corridors"])
        db.add_all(dataset["sections"])
        db.add_all(dataset["assets"])
        db.add_all(dataset["tasks"])
        db.add_all(dataset["trains"])
        db.add_all(dataset["resources"])
        db.add_all(dataset["opportunities"])
        db.add_all(dataset["freight_forecasts"])
        db.commit()
    finally:
        db.close()

    yield

    # Cleanup test db
    test_db_file = os.path.abspath("test_intelliblock.db")
    if os.path.exists(test_db_file):
        try:
            os.remove(test_db_file)
        except Exception:
            pass
