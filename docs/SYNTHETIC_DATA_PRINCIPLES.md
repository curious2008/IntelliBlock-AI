# Synthetic Data Principles & Benchmark Scenarios — SIH26027

This document defines the principles governing synthetic data generation for prototype testing and outlines the 8 core benchmark operational scenarios.

---

## 1. Synthetic Data Principles

Because internal Indian Railways systems (TMS, SMMS, TDMS, COA) are unavailable, our prototype utilizes synthetic data. To ensure meaningful evaluation, synthetic data must reflect **coherent operational domain relationships** rather than random numbers.

### Core Domain Dependencies

```
┌─────────────────────────┐      ┌─────────────────────────┐
│     ASSET CONDITION     ├─────►│ MAINTENANCE URGENCY/RISK│
└─────────────────────────┘      └─────────────────────────┘
┌─────────────────────────┐      ┌─────────────────────────┐
│     TASK COMPLEXITY     ├─────►│  EXPECTED TASK DURATION │
└─────────────────────────┘      └─────────────────────────┘
┌─────────────────────────┐      ┌─────────────────────────┐
│   RESOURCE AVAILABILITY ├─────►│   SCHEDULE FEASIBILITY  │
└─────────────────────────┘      └─────────────────────────┘
┌─────────────────────────┐      ┌─────────────────────────┐
│   TRAIN TRAFFIC DENSITY ├─────►│  AVAILABLE BLOCK WINDOWS│
└─────────────────────────┘      └─────────────────────────┘
┌─────────────────────────┐      ┌─────────────────────────┐
│ HISTORICAL EXECUTION LOG├─────►│  AI OVERRUN PREDICTION  │
└─────────────────────────┘      └─────────────────────────┘
```

1. **Asset Condition → Urgency:** Low condition scores and aged assets produce higher defect severity ratings and shorter due-date windows.
2. **Task Scope → Duration:** Heavy work quantum (e.g., 5 km tamping) scales required minimum and estimated block durations logically.
3. **Train Density → Block Opportunities:** High-density passenger timetables result in shorter, fewer candidate block windows, forcing tighter task bundling.
4. **Historical Execution → Overrun Probability:** Synthetic task history includes realistic variance distributions (e.g., log-normal duration overruns) to train and evaluate AI overrun predictors.
5. **Spatial Continuity:** Station order, section lengths, and machine transit speeds adhere to physical spatial logic (e.g., a machine moving between adjacent stations at 30 km/h transit speed).

---

## 2. Benchmark Operational Scenarios

To thoroughly test the decision-support engine, synthetic data generators will produce 8 distinct scenario packages:

### Scenario 1: Normal Operations
- **Description:** Baseline corridor traffic with standard passenger timetables, 10–12 routine maintenance requests across Civil, S&T, and TRD, and adequate resource availability.
- **Purpose:** Verifies standard schedule generation and basic task bundling.

### Scenario 2: Heavy Traffic Density
- **Description:** Peak corridor utilization with tight passenger train headways and frequent freight movements, leaving very narrow natural traffic gaps (30–60 mins).
- **Purpose:** Tests the optimizer's ability to find micro-windows and defer low-priority work without delaying passenger trains.

### Scenario 3: High Maintenance Demand
- **Description:** Large backlog of 25+ maintenance requests, including multiple overdue tasks across departments competing for corridor access.
- **Purpose:** Evaluates prioritization algorithms and multi-objective trade-offs under severe track capacity constraints.

### Scenario 4: Resource Shortage
- **Description:** High task volume but constrained machinery (only 1 tamping machine available for the entire corridor) and limited specialized crews.
- **Purpose:** Tests resource-constrained scheduling and machine routing logic.

### Scenario 5: Multi-Department Overlapping Requests
- **Description:** Civil, S&T, and TRD departments independently request blocks on the exact same track section during the same 24-hour horizon.
- **Purpose:** Tests compatible maintenance-task bundling logic to merge overlapping requests into a single integrated block window.

### Scenario 6: Maintenance Overrun Disruption
- **Description:** A scheduled 120-minute block experiences an unexpected 35-minute execution overrun due to machine breakdown.
- **Purpose:** Evaluates the dynamic replanning engine's ability to recalculate downstream block windows and minimize train delays.

### Scenario 7: Emergency Maintenance Task
- **Description:** An unscheduled, critical rail defect (Priority 9.9) is detected on a main-line section during peak hours, requiring immediate block isolation.
- **Purpose:** Tests emergency task insertion, schedule preemption, and real-time plan adjustment.

### Scenario 8: Combined Stress-Test Scenario
- **Description:** Complex scenario combining heavy passenger traffic, multi-departmental overlapping requests, resource scarcity, and a mid-execution block overrun.
- **Purpose:** Comprehensive benchmark to evaluate full system resilience, explainability, and dynamic replanning capabilities.
