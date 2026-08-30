# System Architecture — Intelligent Railway Maintenance Block Decision-Support System

**Problem Statement ID:** SIH26027  
**Title:** AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways  
**Category:** Software | **Theme:** Transportation & Logistics  

---

## 1. Product Goal

Indian Railways (IR) is one of the world's largest rail networks, running thousands of passenger and freight trains daily on high-density corridors. Maintenance of track, signals, overhead electrification (OHE), and bridges is vital for safety and operational efficiency. However, taking a maintenance "block" (isolating a section of track from traffic) disrupts train schedules. Currently, block planning suffers from:

- **Departmental Silos:** Engineering (Civil/Track), Signal & Telecom (S&T), and Traction Distribution (TRD/OHE) plan maintenance independently, leading to multiple separate traffic blocks on the same section.
- **Suboptimal Capacity Utilization:** Opportunities to bundle compatible tasks into integrated maintenance blocks during naturally low-traffic windows are missed.
- **Manual & Dynamic Friction:** Block granting relies heavily on manual coordination between Section Controllers and Maintenance Supervisors, often leading to ungranted blocks, overruns, or major passenger train detentions.

**The Solution:**  
This application is an **Explainable, Adaptive Railway Maintenance Block Decision-Support System**. It unifies multi-department maintenance demands, passenger timetables, freight forecasts, track section availability, and resource constraints into a unified railway state. It utilizes AI/ML for task duration, overrun risk, and asset failure predictions, coupled with a rigorous constraint optimization engine to generate optimal, conflict-free, task-bundled block schedules with clear explanations, alternative trade-off options, and real-time dynamic replanning.

---

## 2. Target Users

### Primary User
- **Railway Maintenance Block Planner (Divisional / Zonal Level):** Responsible for evaluating weekly and daily block requests across departments, resolving conflicts, optimizing line access windows, and generating official block schedules for operational approval.

### Secondary Users
- **Department Maintenance Managers & Engineers (Civil, S&T, TRD):** Submit work requests, specify asset criticality, machine/crew requirements, task compatibility, and safety dependencies.
- **Operations & Control Personnel (Chief Controller / Section Controller):** Review recommended block schedules against real-time train movement, approve/grant blocks, monitor line occupancy, and handle live traffic perturbations.
- **Field Supervisors & Machine Operators:** Receive approved block windows, log actual work execution, update task status, and report unexpected overruns or machine breakdowns.
- **Zonal / Railway Board Management:** Review asset availability metrics, block utilization efficiency, train delay impacts, and cross-departmental coordination KPIs via high-level analytics.

---

## 3. Major System Modules

The system is structured into 12 distinct, modular components, each handling a specific domain responsibility:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   1. DASHBOARD UI                                      │
└───────────────────────────┬────────────────────────────────┬───────────────────────────┘
                            │                                │
┌───────────────────────────▼────────────────────┐ ┌─────────▼───────────────────────────┐
│     2. RAILWAY STATE & DATA INTEGRATION        │ │         4. TRAIN & TIMETABLE VIEW     │
│   (Unified Topology, Mock Adapter Layer)       │ │     (Passenger Schedules, Freight)     │
└───────────────────────────┬────────────────────┘ └─────────┬───────────────────────────┘
                            │                                │
┌───────────────────────────▼────────────────────┐ ┌─────────▼───────────────────────────┐
│       3. MAINTENANCE MANAGEMENT                │ │   5. CORRIDOR & BLOCK AVAILABILITY    │
│  (Multi-Dept Demands, Criticality, Tags)       │ │    (Section Windows, Headways, PSRs)  │
└───────────────────────────┬────────────────────┘ └─────────┬───────────────────────────┘
                            │                                │
┌───────────────────────────▼────────────────────┐ ┌─────────▼───────────────────────────┐
│        6. RESOURCE MANAGEMENT                  │ │           7. AI INSIGHTS              │
│  (Crews, Machines [BCM/CSMB], Materials)       │ │    (Duration, Overrun Risk, Compat.)  │
└───────────────────────────┬────────────────────┘ └─────────┬───────────────────────────┘
                            │                                │
┌───────────────────────────▼────────────────────┴───────────▼───────────────────────────┐
│                               8. BLOCK OPTIMIZATION ENGINE                             │
│                    (Constraint Solver & Task Bundling Engine)                  │
└───────────────────────────┬────────────────────────────────┬───────────────────────────┘
                            │                                │
┌───────────────────────────▼────────────────────┐ ┌─────────▼───────────────────────────┐
│          9. EXPLAINABILITY ENGINE              │ │        10. WHAT-IF SIMULATION         │
│   (Natural Rationale & Trade-off Trees)        │ │  (Disruption Injector, Timetable Test) │
└───────────────────────────┬────────────────────┘ └─────────┬───────────────────────────┘
                            │                                │
┌───────────────────────────▼────────────────────┐ ┌─────────▼───────────────────────────┐
│        11. DYNAMIC REPLANNING                  │ │       12. ANALYTICS & EVALUATION      │
│  (Live Variance Tracking & Schedule Repair)    │ │   (Asset Availability vs Baseline)    │
└────────────────────────────────────────────────┘ └─────────────────────────────────────┘
```

### Module Responsibilities & Relationships

1. **Dashboard:** Provides executive visibility into upcoming block schedules, asset availability trends, departmental requests, live block execution status, and conflict alerts.
2. **Railway State & Data Integration:** Maintains the spatial track topology (stations, block sections, line numbers, directions, yards) and acts as the data access layer. Uses mock adapters for legacy IR systems (TMS, SMMS, TDMS, COA, BDMS).
3. **Maintenance Management:** Captures, categorizes, and prioritizes work orders across Civil, S&T, and TRD departments. Tracks required window durations, safety speed restrictions (PSR/TSR), asset criticality index, and task dependencies.
4. **Train & Timetable View:** Models passenger timetable schedules, train priorities (Rajdhani/Express vs Suburban vs Goods), headway requirements, buffer times, and goods train movement forecasts.
5. **Corridor & Block Availability:** Identifies traffic gap opportunities on specific line sections, calculates corridor throughput capacity, and maps track possession windows.
6. **Resource Management:** Tracks availability, movement speeds, and depot locations of heavy track machinery (BCM, TTM, CSMB, DGS, Tower Wagons) and specialized crews across divisions.
7. **AI Insights:** Provides ML-based predictive estimates:
   - *Task Duration Predictor:* Estimates true duration based on historical asset condition and scope.
   - *Overrun Probability Estimator:* Predicts likelihood of exceeding allocated block time.
   - *Compatibility & Task Bundling Classifier:* Identifies tasks across departments that can safely co-exist within the same track possession window.
8. **Block Optimization Engine:** Solves the core multi-objective constrained scheduling problem. Formulates hard constraints (safety headways, single-track direction locks, machine uniqueness, OHE power isolation limits) and soft constraints (delay minimization, task bundling maximization, priority weighting) to generate feasible schedules.
9. **Explainability Engine:** Translates optimization choices into human-understandable narratives. Explains why a specific plan was chosen, why certain requests were shifted/deferred, and presents trade-off matrices for alternative plans.
10. **What-if Simulation Engine:** Allows planners to test hypothetical scenarios (e.g., train delay of 45 mins, emergency rail-break repair, machine breakdown) and evaluate schedule resilience before committing.
11. **Dynamic Replanning Engine:** Monitors live execution variance during block windows. If a block overruns or a train is delayed, it dynamically triggers incremental schedule repair with minimal ripple effect on downstream traffic.
12. **Analytics & Evaluation Engine:** Compares system performance against traditional manual block planning baselines across KPIs such as Track Availability %, Train Delay Minutes, Compatible Task Co-location Ratio, and Plan Adherence.

---

## 4. High-Level Modular Tech Architecture

The architecture enforces strict decoupling between the Presentation, API, Domain Services, Optimization/AI Core, and Data Persistence layers:

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND LAYER                                      │
│                  Web SPA Dashboard (Modern HTML5 / JavaScript / React)                │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ HTTP / WebSocket REST API
┌──────────────────────────────────────────▼────────────────────────────────────────────┐
│                                    BACKEND API GATEWAY                                │
│                   API Routing, Data Validation, Request Middleware                    │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼────────────────────────────────────────────┐
│                                  DOMAIN SERVICES LAYER                                │
│  ┌─────────────────────────────┬──────────────────────────────┬────────────────────┐  │
│  │  Maintenance Service        │  Train / Timetable Service   │ Corridor Service   │  │
│  ├─────────────────────────────┼──────────────────────────────┼────────────────────┤  │
│  │  Resource Service           │  AI Prediction Service       │ Optimizer Service  │  │
│  ├─────────────────────────────┼──────────────────────────────┼────────────────────┤  │
│  │  Simulation Service         │  Explainability Service      │ Analytics Service  │  │
│  └─────────────────────────────┴──────────────────────────────┴────────────────────┘  │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼────────────────────────────────────────────┐
│                             OPTIMIZATION & AI ALGORITHM ENGINE                        │
│   • MILP / Constraint Solver (OR-Tools / PuLP / Custom Heuristic Engine)              │
│   • Predictive Models (Duration, Risk, Compatibility Classifier)                      │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼────────────────────────────────────────────┐
│                                DATA & STORAGE LAYER                                   │
│   • Relational Persistence (Core Entities, Schedules, Audits, Work Orders)            │
│   • Graph / Spatial In-Memory Cache (Network Topology, Track Sections, Headways)      │
│   • Mock Data Adapter Repository (Simulated TMS, SMMS, TDMS, COA Data Pipelines)      │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow Pipeline

Data flows sequentially through a pipeline with strict validation and human oversight:

```
  [ Maintenance Demands ]     [ Passenger Timetable ]     [ Freight Forecast ]     [ Resource Status ]
         (Engg/S&T/TRD)          (Fixed Schedules)        (Dynamic Estimates)      (Crews & Machines)
               │                         │                         │                        │
               └─────────────────────────┼─────────────────────────┴────────────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │         UNIFIED RAILWAY STATE         │
                     │  (Corridor Topology & Occupancy Map)  │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │            AI PREDICTIONS             │
                     │  (Duration, Overrun Risk, Clusters)   │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │   MAINTENANCE OPPORTUNITY DISCOVERY   │
                     │  (Traffic Gaps & Shadow Block Windows)│
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │     CONSTRAINT OPTIMIZATION ENGINE    │
                     │   (Hard & Soft Constraint Solving)    │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │    RECOMMENDED PLAN & ALTERNATIVES    │
                     │  + Natural Language Explanation Tree  │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │       HUMAN REVIEW & APPROVAL         │
                     │   (Planner Sign-Off / What-if Test)   │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │    EXECUTION TRACKER / SIMULATION     │
                     │  (Live Progress & Variance Monitoring)│
                     └───────────────────┬───────────────────┘
                                         │
                         [ Disruption / Overrun Detected ]
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │          DYNAMIC REPLANNING           │
                     │   (Incremental Schedule Repair)       │
                     └───────────────────────────────────────┘
```

---

## 6. Architectural Principles

1. **Modular Architecture:** Clear boundary separation across services allowing independent development, testing, and replacement of individual modules.
2. **Explainable AI & Decisions:** No black-box outputs. Every recommended block plan includes detailed rationale, constraint relaxation logs, and explicit trade-off justifications.
3. **Strict Constraint Enforcement:** Optimization algorithms enforce hard physical and operational constraints (safety headways, power isolation, single machine assignment) unconditionally. AI predictions support parameter estimation without violating hard constraints.
4. **Human-in-the-Loop:** Final decision authority rests with the human Railway Maintenance Planner. The system acts as a decision-support assistant presenting recommended and alternative plans.
5. **No Fake Live Integrations:** The prototype clearly separates data access interfaces from storage. Built-in Mock Data Adapters provide realistic synthetic Indian Railways datasets while maintaining clean API contracts for future integration with TMS, SMMS, TDMS, COA, and BDMS.
6. **Data-Source Agnostic:** Internal domain models are decoupled from external raw formats, enabling seamless switching between simulated data, CSV/JSON uploads, and future production APIs.
7. **Simulation & What-if First:** The architecture natively supports sandbox simulation, enabling stress-testing of schedules against synthetic disruptions prior to operational approval.
8. **Reproducible & Audit-Ready:** Every optimization run records inputs, seed states, active constraint weights, and outputs for complete historical auditability.
9. **Scalable Infrastructure:** Designed to scale from single-section corridor planning to multi-divisional zonal network optimization.
10. **Comprehensive Testability:** Domain logic, constraint rules, and AI predictors feature automated unit, integration, and scenario regression test suites.
