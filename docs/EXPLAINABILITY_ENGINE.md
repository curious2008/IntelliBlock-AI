# Decision Rationale & Explainability Engine — SIH26027 IntelliBlock AI

**Document Type:** Human-in-the-Loop Explainability & Decision Support Specification  
**Phase:** 9A, 9B, 9C — Decision Rationale Modeling, Explainability Engine & Controller UX  
**Status:** Canonical & Active  
**Version:** 1.0.0  

---

## 1. Why Transparent Explainability is Crucial for Indian Railways Operations

In high-stakes railway operations, "black-box" decisions cannot be trusted by Section Controllers, Chief Controllers, or Permanent Way Engineers:
- Every block possession approved halts traffic and carries safety liability.
- Controllers must understand **WHY** a specific block window was selected, **WHAT** alternatives were rejected, and **WHAT** specific cross-department risks or power requirements exist.

IntelliBlock AI maintains a Human-in-the-Loop architecture:
$$\text{AI Predicts} \longrightarrow \text{Optimization Decides} \longrightarrow \text{Constraint Validates} \longrightarrow \text{Explainability Justifies} \longrightarrow \text{Human Approves}$$

---

## 2. Decision Reasoning Architecture

For every scheduled block possession and overall master schedule, the Explainability Engine generates:
1. **Primary Operational Rationale:** Plain language justification connecting priority score, line capacity gap, and track possession.
2. **Coordinated Bundling Gain:** Quantified explanation of cross-department synergy and saved track possessions.
3. **Decision Factor Hierarchy:** Weighted breakdown of factors (Asset Criticality, Traffic Gap, Machine Allocation, Power Block Permit).
4. **Rejected Alternatives Audit:** Explicit records of alternative windows evaluated and the exact constraint or timetable penalty that disqualified them (e.g. "Rejected to protect Vande Bharat timetable headway").
5. **Section Controller Advisory:** Actionable operational precautions (e.g. caution orders on adjacent lines, site clear verification).

---

## 3. Verified API Contracts & UI Interaction

- `POST /api/v1/explainability/explain-active-plan`: Returns comprehensive `PlanExplanationReportResponse`.
- Human Planner UI: Interactive "Why This Slot?" expandable reasoning trees and dedicated "Executive Plan Rationale & Strategic Trade-Offs" view at `/plans`.
