# Optimization Engine Specification — SIH26027 IntelliBlock AI

**Document Type:** Multi-Objective Optimization Formulation & Solver Architecture  
**Phase:** 6A, 6B, 6C — Optimization Formulation, Solver & Evaluation  
**Status:** Canonical & Active  
**Version:** 1.0.0  

---

## 1. Mathematical Optimization Formulation

The IntelliBlock AI solver formulates maintenance block allocation as a Multi-Objective Mixed-Integer Optimization Problem (MO-MIP) under hard domain safety constraints.

### 1.1 Decision Variables
Let:
- $T = \{t_1, t_2, \dots, t_N\}$ be the set of uncoordinated multi-department maintenance tasks.
- $O = \{o_1, o_2, \dots, o_M\}$ be the set of traffic gap block possession opportunities.
- $R = \{r_1, r_2, \dots, r_K\}$ be the set of available heavy machines and specialized maintenance gangs.
- $x_{i, j} \in \{0, 1\}$: Binary decision variable indicating whether task $t_i$ is scheduled within opportunity $o_j$.
- $y_{i, k} \in \{0, 1\}$: Binary decision variable indicating whether resource $r_k$ is assigned to task $t_i$.

### 1.2 Objective Function
The solver maximizes a multi-objective weighted fitness index $F(X, Y)$:

$$\max F(X, Y) = w_1 \cdot \text{ThroughputScore} + w_2 \cdot \text{UrgentCompletionScore} + w_3 \cdot \text{BundlingBonus} + w_4 \cdot \text{ResourceEfficiency} - w_5 \cdot \text{OverrunRiskPenalty}$$

Where:
1. **$\text{ThroughputScore}$:** $\frac{\sum_i \sum_j x_{i, j}}{|T|} \times 100$
2. **$\text{UrgentCompletionScore}$:** Percentage of high-priority ($\text{Priority} \ge 8.0$) and emergency tasks scheduled.
3. **$\text{BundlingBonus}$:** Reward for co-locating cross-department tasks in the same opportunity window on the same track section.
4. **$\text{OverrunRiskPenalty}$:** $100 \times \mathbb{E}[\text{OverrunProbability}]$, penalizing assignments that risk line overrun.
5. **$\text{ResourceEfficiency}$:** Percentage of productive heavy machinery utilization without idle deadlocks.

---

## 2. Solver Architecture: Constraint-Guided Heuristic Search

```
UNCOORDINATED TASKS (ENGG, S&T, TRD)
               ↓
OPERATIONAL URGENCY RANKING (Emergency > Priority > Due Date)
               ↓
OPPORTUNITY & RESOURCE MATCHING (Spatial-temporal filter)
               ↓
CROSS-DEPARTMENT BUNDLING DISCOVERY (Co-location heuristics)
               ↓
DETERMINISTIC CONSTRAINT VALIDATION (8 Hard Safety Rules)
               ↓
ACCEPTED OPTIMIZED BLOCK PLAN + MULTI-OBJECTIVE KPI SCORECARD
```

---

## 3. Verified API Contracts

- `POST /api/v1/optimizer/generate-plan`
  - Input: Optional custom multi-objective weights and scenario type.
  - Output: `OptimizedSchedulePlanResponse` containing `blocks`, `kpi_scorecard`, `is_feasible`, `unscheduled_reasons`, and `summary`.
