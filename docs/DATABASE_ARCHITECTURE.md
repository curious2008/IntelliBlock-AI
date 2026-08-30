# Database Architecture Specification — SIH26027 IntelliBlock AI

**Document Type:** Database System Architecture & Migration Strategy  
**Phase:** 4A — Database Architecture Hardening & Supabase-Ready Migration Foundation  
**Status:** Canonical & Active  
**Version:** 1.0.0  

---

## 1. Overview & Architectural Principles

IntelliBlock AI maintains a strict separation between the API/Application Service Layer, the ORM/Data Access Layer, and the physical Database Engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     REACT + TYPESCRIPT FRONTEND                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON (/api/v1)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        FASTAPI BACKEND GATEWAY                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       APPLICATION & DOMAIN SERVICES                    │
│   (AI Service, Scenario Engine, Constraint Engine, Optimizer Service) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       REPOSITORY / DATA ACCESS LAYER                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  SQLALCHEMY ORM (Canonical Domain Models)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                     DATABASE ENGINE ABSTRACTION                        │
│   • Local Dev / Testing: SQLite (intelliblock.db / in-memory)          │
│   • Production / Managed: PostgreSQL via Supabase                      │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Architecture Rules:
1. **Single ORM Source of Truth:** `app.models.domain` defines all canonical SQLAlchemy models.
2. **Deterministic Migrations via Alembic:** Schema changes are versioned, documented, and applied through Alembic migration scripts (`backend/alembic/versions/`).
3. **No Automatic Destructive Startup:** Application startup (`lifespan`) connects to the existing schema and does NOT drop tables or reseed data automatically.
4. **Decoupled Seeding & Scenarios:** Seeding is performed explicitly via `scripts/seed_db.py` or API scenario generation endpoints (`/api/v1/scenarios/generate`).
5. **Driver Portability:** Database connections are driven by `settings.DATABASE_URL`. Both SQLite (`sqlite:///...`) and PostgreSQL (`postgresql://...` / `postgresql+psycopg2://...`) are supported transparently without modifying application code.

---

## 2. Canonical Relational Data Model

The system defines 11 canonical entities across track topology, operations, rolling stock, maintenance, and audit records:

| Table Name | Primary Key | Purpose | Foreign Keys / Key Relationships |
|---|---|---|---|
| `departments` | `department_code` (VARCHAR(10)) | Master engineering departments (ENGG, ST, TRD) | Has many Assets, Tasks, Resources |
| `corridors` | `corridor_id` (VARCHAR(50)) | Railway route master & total length | Has many Sections, Assets, Trains, Opportunities |
| `track_sections` | `section_id` (VARCHAR(50)) | Spatial block section topology & speed limits | Belongs to Corridor; Has many Assets |
| `assets` | `asset_id` (VARCHAR(50)) | Physical railway infrastructure assets & condition | Belongs to Corridor, Section, Department; Has many Tasks |
| `maintenance_tasks` | `task_id` (VARCHAR(50)) | Work orders with duration bounds & prerequisites | Belongs to Asset, Department |
| `train_movements` | `train_id` (VARCHAR(50)) | Timetabled train movements & scheduled windows | Belongs to Corridor |
| `resources` | `resource_id` (VARCHAR(50)) | Heavy machinery (BCM, TTM) & specialized gangs | Belongs to Department |
| `block_opportunities`| `opportunity_id` (VARCHAR(50)) | Traffic gap windows for maintenance line possession| Belongs to Corridor |
| `freight_forecasts` | `forecast_id` (VARCHAR(50)) | Probabilistic goods train traffic density | Belongs to Corridor |
| `execution_records` | `execution_id` (VARCHAR(50))| Historical execution audit (planned vs actual) | References task_id, plan_id |
| `scenario_runs` | `run_id` (VARCHAR(50)) | Audit log of synthetic scenario generation runs | Master scenario run registry |

---

## 3. Migration & Seeding Lifecycle

### 3.1 Alembic Migration Management
- **Configuration:** `backend/alembic.ini` + `backend/alembic/env.py`
- **Initial Revision:** `b7dee1a14ac3_initial_canonical_schema.py`
- **Apply Migrations:**
  ```bash
  alembic upgrade head
  ```
- **Check Migration Status:**
  ```bash
  alembic current
  ```

### 3.2 Seeding CLI
- **Execute Seed Command:**
  ```bash
  python scripts/seed_db.py --scenario NORMAL --seed 42
  ```
- **Wipe and Reseed:**
  ```bash
  python scripts/seed_db.py --scenario COMBINED_STRESS_TEST --seed 99 --force
  ```

---

## 4. PostgreSQL / Supabase Readiness Verification

1. **Type Compatibility:** All column types (`String`, `Integer`, `Float`, `Boolean`, `DateTime`, `JSON`, `Text`) are standard SQLAlchemy constructs compatible with PostgreSQL 15+.
2. **Timezone Handling:** Datetime defaults use UTC (`datetime.now(timezone.utc)`), preventing timezone drift.
3. **Transaction Safety:** Scoped sessions (`SessionLocal`) with explicit rollback semantics are used across all service handlers.
4. **Credential Isolation:** Database credentials reside exclusively in server-side environment variables (`DATABASE_URL`), never in the frontend bundle.
