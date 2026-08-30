# Project Scope & Boundaries — Intelligent Railway Maintenance Block Decision-Support System

**Problem Statement ID:** SIH26027  
**Title:** AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways  
**Category:** Software | **Theme:** Transportation & Logistics  

---

## 1. Scope Overview

This document explicitly defines the functional boundaries, prototype capabilities, and operational limits of the Intelligent Railway Maintenance Block Decision-Support System for Indian Railways. Defining these boundaries ensures that engineering efforts remain focused on solving the core decision-support and optimization problem without scope creep into physical train control or unauthorized live system integrations.

---

## 2. In-Scope Capabilities

The prototype and system architecture explicitly include:

### 2.1 Multi-Department Maintenance Planning
- Unified collection and tracking of maintenance requests across three primary Indian Railways engineering departments:
  - **Civil/Track Engineering:** Track tamping (TTM), ballast cleaning (BCM), rail grinding, rail renewal (TRR), turnout renewal (TSR), bridge inspection.
  - **Signal & Telecom (S&T):** Point machine overhauling, axle counter maintenance, track circuit testing, signal gantry maintenance.
  - **Traction Distribution (TRD / Electrical):** OHE contact wire inspection, insulator washing, tower wagon inspection, power block switching.
- Identification of compatible tasks for **integrated shadow block bundling** (e.g., executing TRD OHE inspection and S&T point overhaul concurrently inside a track tamping block window).

### 2.2 Train-Aware & Timetable-Sensitive Planning
- Modeling passenger train schedules, including train hierarchies (Vande Bharat / Rajdhani / Shatabdi vs Superfast vs Express vs Suburban passenger trains).
- Incorporating goods/freight train movement forecasts and directional traffic density.
- Accounting for required headways, minimum block buffers, and recovery margins in passenger timetables.

### 2.3 Corridor & Block Availability Management
- Identification of naturally occurring low-density traffic windows ("shadow windows").
- Mapping single-line, double-line, and multi-track section constraints.
- Handling speed restrictions: Permanent Speed Restrictions (PSR) and Temporary Speed Restrictions (TSR) caused by deferred maintenance.

### 2.4 Resource-Aware Scheduling
- Allocation of specialized heavy track machinery (e.g., CSMB, BCM, TTM, DGS, Tower Cars).
- Tracking machine availability, home depot locations, and transit speeds between work sites.
- Crew availability modeling (specialized maintenance gangs, machine operators, OHE power block supervisors).

### 2.5 Maintenance Prioritization & Asset Criticality
- Multi-factor priority scoring based on asset condition, safety urgency, days deferred, track category (Group A/B routes vs branch lines), and risk of failure.

### 2.6 AI/ML-Assisted Predictions
- **Duration Prediction:** Machine learning models estimating actual task completion time based on historical asset parameters, work quantum, and weather/site conditions.
- **Overrun Probability Estimation:** Predicting the risk of a block exceeding its approved duration.
- **Compatibility Clustering:** Machine learning/rules-based classification of mutually compatible cross-departmental tasks.

### 2.7 Constraint-Based Optimization Engine
- Multi-objective solver enforcing:
  - **Hard Operational Constraints:** Absolute safety headways, single-track occupancy lock, machine uniqueness, OHE power isolation boundaries.
  - **Soft Optimization Objectives:** Minimizing passenger train delays, maximizing total track asset availability, maximizing shadow block co-location, minimizing deferral of high-criticality work.

### 2.8 Explainability & Decision Rationale
- Natural language explanations detailing why a specific block schedule was selected.
- Constraint relaxation and trade-off visualization showing how conflicting departmental requests were resolved.

### 2.9 Alternative Plans & Trade-off Selection
- Generation of Pareto-optimal alternative schedules (e.g., Plan A: Maximize Asset Availability vs Plan B: Zero Passenger Train Delay vs Plan C: Balanced Trade-off).

### 2.10 What-if Scenario Simulation
- Interactive simulation of operational disruptions (e.g., 30-minute train delay, machine breakdown, emergency track block request) to evaluate schedule resilience.

### 2.11 Dynamic Replanning
- Real-time detection of block execution overruns or traffic perturbations.
- Automated generation of dynamic schedule repairs with minimal downstream disruption.

### 2.12 Baseline Benchmarking & Evaluation
- Quantitative comparison against traditional manual block scheduling baselines using key metrics:
  - Total Track Availability Hours gained
  - Passenger Train Delay Minutes saved
  - Shadow Block Co-location Ratio (%)
  - Schedule Adherence (%)

---

## 3. Out-of-Scope Boundaries

To maintain focus and adhere to real-world operational safety and security boundaries, the following are strictly **OUT OF SCOPE**:

1. **Actual Railway Signalling & Interlocking Control:** The system will not interface with physical solid-state interlocking (SSI), relay rooms, or track circuits to physically alter signals or throw points.
2. **Autonomous Train Driving & Direct Dispatching:** The system does not control train throttle, braking, or automatic train protection (ATP) systems (e.g., Kavach).
3. **Safety-Critical Autonomous Decisions:** The application is purely a **Decision-Support System (DSS)**. All block approvals, track possessions, and traffic diversions require explicit human sign-off by qualified Railway Controllers and Engineers.
4. **Physical Railway Hardware & Embedded Sensors:** The project does not involve manufacturing custom IoT sensors, trackside hardware, or physical machine telemetry devices.
5. **Real-Time Live Indian Railways System Integrations:** The prototype will NOT attempt unauthorized connections to live proprietary Indian Railways internal networks or production APIs (TMS, SMMS, TDMS, COA, BDMS, FOIS). Clean mock data adapters and file import schemas will be used.
6. **Full-Physics 3D Railway Simulation:** The project will not build 3D visual train simulators, physics engine wheel-rail dynamics, or flight-simulator-style visual environments.
7. **Nationwide Network Optimization in Single Pass:** The initial prototype focuses on divisional and corridor-level block planning (e.g., a 100-200 km high-density double-line section) rather than simultaneous 68,000 km network-wide optimization.

---

## 4. Summary Matrix

| Feature / Capability | Status | Implementation Mode |
|---|---|---|
| Multi-Dept Block Coordination (Civil, S&T, TRD) | **IN SCOPE** | Core Domain Logic |
| Shadow Block Window Bundling | **IN SCOPE** | Optimization Algorithm |
| AI Duration & Overrun Prediction | **IN SCOPE** | Predictive ML Pipeline |
| Constraint Optimization Engine | **IN SCOPE** | Multi-Objective Solver |
| Explainable Decision Trees & Rationale | **IN SCOPE** | Explainability Service |
| What-if Simulation & Dynamic Replanning | **IN SCOPE** | Discrete Event Simulation |
| Quantitative Baseline Comparison | **IN SCOPE** | Analytics Engine |
| Physical Signalling & Point Interlocking | **OUT OF SCOPE** | N/A |
| Autonomous Unassisted Block Granting | **OUT OF SCOPE** | N/A (Human-in-the-Loop) |
| Live Proprietary IR Network Access | **OUT OF SCOPE** | Mock Adapters & Synthetics |
| 3D Graphics / Hardware Telemetry | **OUT OF SCOPE** | N/A |
