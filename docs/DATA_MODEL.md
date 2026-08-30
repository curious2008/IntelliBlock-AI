# Core Data Model & Schema Contracts — SIH26027

This document defines the 8 core entities that constitute the unified data layer of the Intelligent Railway Maintenance Block Decision-Support System.

---

## 1. Asset Entity

Represents a physical infrastructure asset (track segment, turnout, OHE wire segment, signal point motor) requiring monitoring and upkeep.

```json
{
  "asset_id": "AST-DEL-KNP-TK-0142",
  "asset_name": "Up Line Track Segment Km 142.0 to 144.5",
  "asset_type": "TRACK_SEGMENT",
  "department": "ENGG",
  "corridor_id": "COR-DEL-KNP",
  "track_section_id": "SEC-GZB-SBB-UP",
  "location_km_start": 142.0,
  "location_km_end": 144.5,
  "criticality_index": 8.5,
  "condition_score": 6.2,
  "operational_status": "ACTIVE",
  "installation_date": "2018-04-12",
  "last_maintenance_date": "2026-02-10",
  "next_due_date": "2026-09-01"
}
```

### Field Definitions & Justifications
- `asset_id` *(String, Primary Key)*: Unique identifier for the asset across the division.
- `asset_name` *(String)*: Human-readable description.
- `asset_type` *(Enum: `TRACK_SEGMENT`, `TURNOUT`, `SIGNAL_POINT`, `TRACK_CIRCUIT`, `OHE_CATENARY`, `BRIDGE`)*: Classifies the physical asset for domain rules.
- `department` *(Enum: `ENGG`, `ST`, `TRD`)*: Department owning primary maintenance responsibility.
- `corridor_id` *(String, Foreign Key)*: Corridor where the asset is located.
- `track_section_id` *(String, Foreign Key)*: Specific track section bounding the asset.
- `location_km_start` / `location_km_end` *(Float)*: Kilometric position along the line, vital for spatial spatial conflict checks.
- `criticality_index` *(Float, 1.0–10.0)*: Importance score based on line speed, traffic density, and failure impact.
- `condition_score` *(Float, 1.0–10.0)*: Health score derived from inspection logs or wear metrics.
- `operational_status` *(Enum: `ACTIVE`, `RESTRICTED_SPEED`, `DEGRADED`, `OUT_OF_SERVICE`)*: Current operational state.
- `installation_date` / `last_maintenance_date` / `next_due_date` *(ISO Date)*: Asset age and lifecycle maintenance tracking fields.

---

## 2. Maintenance Task Entity

Represents a specific work request submitted by a department for an asset.

```json
{
  "task_id": "TSK-2026-0830-001",
  "asset_id": "AST-DEL-KNP-TK-0142",
  "department": "ENGG",
  "task_type": "TRACK_TAMPING",
  "description": "Routine track tamping using TTM machine following ballast cleaning",
  "priority_score": 7.8,
  "is_emergency": false,
  "due_date": "2026-09-05",
  "estimated_duration_mins": 120,
  "minimum_duration_mins": 90,
  "maximum_duration_mins": 180,
  "required_resources": ["RES-TTM-04", "RES-CREW-ENGG-02"],
  "preferred_time_window": {
    "earliest_start": "2026-09-01T00:00:00Z",
    "latest_finish": "2026-09-05T06:00:00Z"
  },
  "location_corridor_id": "COR-DEL-KNP",
  "location_section_id": "SEC-GZB-SBB-UP",
  "prerequisite_task_ids": ["TSK-2026-0828-012"],
  "compatible_task_types": ["OHE_INSPECTION", "POINT_OVERHAUL"],
  "status": "REQUESTED"
}
```

### Field Definitions & Justifications
- `task_id` *(String, Primary Key)*: Unique task order identifier.
- `asset_id` *(String, Foreign Key)*: Target asset to be maintained.
- `department` *(Enum: `ENGG`, `ST`, `TRD`)*: Submitting department.
- `task_type` *(String)*: Specific work category (e.g., `TRACK_TAMPING`, `OHE_INSPECTION`, `SIGNAL_TEST`).
- `priority_score` *(Float)*: Calculated task priority used by the optimizer.
- `is_emergency` *(Boolean)*: Flag for high-priority emergency safety repairs.
- `due_date` *(ISO Date)*: Target deadline before maintenance becomes overdue.
- `estimated_duration_mins` / `minimum_duration_mins` / `maximum_duration_mins` *(Integer)*: Duration bounds used to evaluate block window fit and buffer sizing.
- `required_resources` *(Array of Strings, Foreign Keys)*: List of crew or machine IDs required.
- `preferred_time_window` *(Object)*: Operational bounds requested by the department.
- `location_corridor_id` / `location_section_id` *(String, Foreign Keys)*: Spatial location of the work.
- `prerequisite_task_ids` *(Array of Strings)*: Hard task dependencies (e.g., ballast cleaning must precede tamping).
- `compatible_task_types` *(Array of Strings)*: Tasks from other departments that can be bundled into the same block window.
- `status` *(Enum: `REQUESTED`, `PLANNED`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `DEFERRED`, `CANCELLED`)*: Lifecycle state.

---

## 3. Train Movement Entity

Represents scheduled passenger trains and forecasted goods/freight train movements along a corridor.

```json
{
  "train_id": "TRN-12301",
  "train_number": "12301",
  "train_name": "Howrah Rajdhani Express",
  "train_type": "PASSENGER_SUPERFAST",
  "corridor_id": "COR-DEL-KNP",
  "direction": "DOWN",
  "scheduled_entry_time": "2026-09-01T02:15:00Z",
  "scheduled_exit_time": "2026-09-01T03:45:00Z",
  "priority_category": 1,
  "delay_minutes": 0,
  "status": "SCHEDULED"
}
```

### Field Definitions & Justifications
- `train_id` *(String, Primary Key)*: System identifier for the train run.
- `train_number` / `train_name` *(String)*: Official IR train designation.
- `train_type` *(Enum: `PASSENGER_PREMIUM` [Rajdhani/Vande Bharat], `PASSENGER_EXPRESS`, `PASSENGER_SUBURBAN`, `FREIGHT_CONTAINER`, `FREIGHT_BULK`)*: Governs traffic priority and delay penalty weight.
- `corridor_id` *(String, Foreign Key)*: Corridor traversed by the train.
- `direction` *(Enum: `UP`, `DOWN`)*: Traffic direction on multi-track lines.
- `scheduled_entry_time` / `scheduled_exit_time` *(ISO Datetime)*: Planned occupancy interval for the corridor section.
- `priority_category` *(Integer, 1–5)*: Strict train hierarchy rank (1 = highest priority passenger, 5 = low priority freight).
- `delay_minutes` *(Integer)*: Current live delay tracked during operation.
- `status` *(Enum: `SCHEDULED`, `RUNNING`, `HELD_AT_STATION`, `COMPLETED`, `CANCELLED`)*: Execution state.

---

## 4. Corridor Entity

Represents a defined railway corridor and its constituent track sections.

```json
{
  "corridor_id": "COR-DEL-KNP",
  "name": "New Delhi - Kanpur Trunk Corridor",
  "start_location": "New Delhi (NDLS)",
  "end_location": "Kanpur Central (CNB)",
  "total_length_km": 440.0,
  "track_configuration": "DOUBLE_LINE",
  "sections": [
    {
      "section_id": "SEC-GZB-SBB-UP",
      "name": "Ghaziabad - Sahibabad Up Line",
      "length_km": 5.2,
      "max_permissible_speed_kmh": 130
    }
  ],
  "operational_status": "NORMAL"
}
```

### Field Definitions & Justifications
- `corridor_id` *(String, Primary Key)*: Corridor identifier.
- `name` / `start_location` / `end_location` *(String)*: Geographical identifiers.
- `total_length_km` *(Float)*: Total length in kilometers.
- `track_configuration` *(Enum: `SINGLE_LINE`, `DOUBLE_LINE`, `QUADRUPLE_LINE`)*: Dictates spatial line isolation rules during maintenance.
- `sections` *(Array of Section Objects)*: Nested list of physical track sections.
- `operational_status` *(Enum: `NORMAL`, `RESTRICTED`, `BLOCKED`)*: Overall corridor health state.

---

## 5. Block Opportunity Entity

Represents a candidate time-space window on a corridor where track access is available for maintenance.

```json
{
  "opportunity_id": "BLK-OPP-20260901-004",
  "corridor_id": "COR-DEL-KNP",
  "track_section_id": "SEC-GZB-SBB-UP",
  "window_start": "2026-09-01T01:00:00Z",
  "window_end": "2026-09-01T04:00:00Z",
  "maximum_duration_mins": 180,
  "availability_status": "AVAILABLE",
  "affected_line_direction": "UP",
  "is_power_block_available": true,
  "restriction_notes": "Window fits between Goods Train #F-44 and Passenger Train #12452"
}
```

### Field Definitions & Justifications
- `opportunity_id` *(String, Primary Key)*: Unique identifier for the line access window.
- `corridor_id` / `track_section_id` *(String, Foreign Keys)*: Target spatial location.
- `window_start` / `window_end` *(ISO Datetime)*: Start and end timestamp of available access.
- `maximum_duration_mins` *(Integer)*: Total continuous window duration.
- `availability_status` *(Enum: `AVAILABLE`, `PARTIALLY_RESERVED`, `ALLOCATED`, `CANCELLED`)*: Current allocation state of the window.
- `affected_line_direction` *(Enum: `UP`, `DOWN`, `BOTH`)*: Line direction isolated by the window.
- `is_power_block_available` *(Boolean)*: Indicates if OHE electrical power can be isolated during this window.
- `restriction_notes` *(String)*: Contextual notes on surrounding train traffic.

---

## 6. Resource Entity

Represents maintenance crews, specialized machinery, or equipment base.

```json
{
  "resource_id": "RES-TTM-04",
  "resource_name": "Plasser Track Tamping Machine TTM-04",
  "resource_type": "MACHINE",
  "department": "ENGG",
  "capability": "TRACK_TAMPING",
  "home_depot_location": "Allahabad Depot",
  "current_location_section_id": "SEC-ALD-MIR-UP",
  "available_from": "2026-08-30T00:00:00Z",
  "available_until": "2026-09-15T00:00:00Z",
  "status": "READY"
}
```

### Field Definitions & Justifications
- `resource_id` *(String, Primary Key)*: Unique resource identifier.
- `resource_name` *(String)*: Human-readable name.
- `resource_type` *(Enum: `CREW`, `MACHINE`, `EQUIPMENT`)*: Resource category.
- `department` *(Enum: `ENGG`, `ST`, `TRD`)*: Department owning the resource.
- `capability` *(String)*: Primary operational skill/function.
- `home_depot_location` / `current_location_section_id` *(String)*: Spatial location tracking to enforce transit constraints.
- `available_from` / `available_until` *(ISO Datetime)*: Temporal availability window.
- `status` *(Enum: `READY`, `IN_USE`, `UNDER_MAINTENANCE`, `IN_TRANSIT`)*: Operational readiness state.

---

## 7. Department Entity

Represents an engineering department submitting maintenance demands.

```json
{
  "department_code": "ENGG",
  "department_name": "Civil & Track Engineering",
  "contact_officer": "Sr. DEN (Co-ordination)",
  "priority_weight": 1.0
}
```

### Supported Departments
- `ENGG`: Civil & Track Engineering
- `ST`: Signal & Telecommunication Engineering
- `TRD`: Traction Distribution (Electrical OHE) Engineering

---

## 8. Execution Record Entity

Represents actual historical or live execution logs of a scheduled maintenance block task.

```json
{
  "execution_id": "EXE-20260901-089",
  "plan_id": "PLN-20260901-001",
  "task_id": "TSK-2026-0830-001",
  "planned_start": "2026-09-01T01:15:00Z",
  "planned_end": "2026-09-01T03:15:00Z",
  "actual_start": "2026-09-01T01:22:00Z",
  "actual_end": "2026-09-01T03:40:00Z",
  "delay_start_mins": 7,
  "overrun_mins": 18,
  "completion_status": "COMPLETED_WITH_OVERRUN",
  "resources_utilized": ["RES-TTM-04", "RES-CREW-ENGG-02"],
  "variance_reason": "Machinery hydraulic pressure drop delayed site clearance by 18 minutes"
}
```

### Field Definitions & Justifications
- `execution_id` *(String, Primary Key)*: Execution record identifier.
- `plan_id` / `task_id` *(String, Foreign Keys)*: Links to the generated block plan and original task.
- `planned_start` / `planned_end` *(ISO Datetime)*: Schedule target timestamps.
- `actual_start` / `actual_end` *(ISO Datetime)*: Realized execution timestamps.
- `delay_start_mins` *(Integer)*: Start variance.
- `overrun_mins` *(Integer)*: Duration overrun variance, fed back into AI overrun prediction models.
- `completion_status` *(Enum: `COMPLETED_ON_TIME`, `COMPLETED_WITH_OVERRUN`, `PARTIALLY_COMPLETED`, `ABORTED`)*: Execution result status.
- `resources_utilized` *(Array of Strings)*: Audit list of resources used.
- `variance_reason` *(String)*: Human notes on cause of variance.
