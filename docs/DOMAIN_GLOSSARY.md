# Domain Glossary — Railway Maintenance & Block Planning

This glossary defines key domain terms in clear, accessible language. It serves as a single source of truth for software engineers, domain analysts, and project stakeholders.

---

## Glossary Terms

### 1. Asset
- **Definition:** A physical component of the railway infrastructure that must be maintained to ensure safe train operations.
- **Example:** A specific rail track segment, a switch/turnout point, an overhead electric wire (OHE), or a signalling track circuit.
- **Why Our Application Needs It:** Tracks the condition, maintenance history, and urgency of work for every individual hardware element on the railway line.

### 2. Railway Corridor
- **Definition:** A continuous geographical rail line connecting major stations or junctions, consisting of one or more track lines.
- **Example:** The 140 km New Delhi to Agra rail corridor.
- **Why Our Application Needs It:** Acts as the high-level spatial container for organizing maintenance requests, train traffic, and line availability.

### 3. Track Section
- **Definition:** A specific, bounded segment of track within a corridor, usually between two adjacent stations or signals.
- **Example:** The Up Line track segment between Ghaziabad (GZB) and Sahibabad (SBB) stations (5.2 km).
- **Why Our Application Needs It:** Represents the exact physical area that must be isolated from train traffic when maintenance occurs.

### 4. Maintenance Task
- **Definition:** A specific piece of work required to inspect, repair, or upgrade an asset.
- **Example:** Heavy track tamping using a tamper machine on Track Section 4.
- **Why Our Application Needs It:** Represents a work request submitted by a department that needs to be scheduled into a valid block window.

### 5. Defect
- **Definition:** Physical wear, damage, or fault discovered on an asset that degrades its safety or performance.
- **Example:** A hairline crack detected in a rail joint or a worn-out signal point motor.
- **Why Our Application Needs It:** Determines task urgency and failure risk, influencing how quickly a task must be scheduled.

### 6. Overdue Maintenance
- **Definition:** Maintenance work that has passed its planned or maximum safe due date without being executed.
- **Example:** A 6-month track inspection that is currently at month 7 without completion.
- **Why Our Application Needs It:** High-risk overdue tasks must be prioritized by the optimization engine to prevent asset failure or safety speed restrictions.

### 7. Department
- **Definition:** An operational division within the railway organization responsible for a specific category of infrastructure.
- **Example:** Engineering (Civil/Track), Signal & Telecom (S&T), or Traction Distribution (TRD).
- **Why Our Application Needs It:** Tracks who requested work, what specialized resources are required, and enables cross-departmental coordination.

### 8. Engineering (Civil / Track)
- **Definition:** The department responsible for physical track structure, rails, sleepers, ballast bed, bridges, and civil works.
- **Example:** Replacing worn wooden sleepers with concrete sleepers using a track laying machine.
- **Why Our Application Needs It:** Engineering tasks typically require long track closures and heavy machinery, forming the anchor for maintenance blocks.

### 9. Signal & Telecom (S&T)
- **Definition:** The department responsible for train control signals, point machines, track circuits, axle counters, and communication networks.
- **Example:** Testing and recalibrating electronic interlocking point motors at a station junction.
- **Why Our Application Needs It:** S&T tasks ensure safe train separation and point switching; many S&T tasks can be bundled alongside track work.

### 10. Traction Distribution (TRD / Electrical)
- **Definition:** The department responsible for overhead electric catenary wires (OHE), substations, and electrical power supply to trains.
- **Example:** Inspecting OHE contact wire thickness and replacing insulators using an overhead tower car.
- **Why Our Application Needs It:** TRD work requires switching off electrical power ("power block"), which can be synchronized with physical track closures.

### 11. Train Movement
- **Definition:** The planned or actual run of a specific train along a corridor across time.
- **Example:** Train #12301 (Howrah Rajdhani Express) passing through the Kanpur-Prayagraj section between 02:15 AM and 03:30 AM.
- **Why Our Application Needs It:** Defines when track sections are occupied by traffic, revealing where maintenance block windows can be safely inserted.

### 12. Passenger Train
- **Definition:** A scheduled train carrying passengers operating on a fixed timetable with high priority.
- **Example:** Vande Bharat Express or a regional suburban commuter train.
- **Why Our Application Needs It:** Passenger train schedules are strict; maintenance planning must minimize delays to passenger services.

### 13. Goods / Freight Train
- **Definition:** A train transporting industrial goods or commodities (coal, steel, containers) that often operates on flexible dispatch schedules.
- **Example:** A 58-wagon coal rake moving from a mining zone to a power plant.
- **Why Our Application Needs It:** Freight trains provide operational flexibility because their paths can be adjusted or held in loops during maintenance blocks.

### 14. Timetable
- **Definition:** The master schedule defining expected arrival, departure, and pass-through times for all scheduled trains on a corridor.
- **Example:** The official Working Time Table (WTT) of a railway division.
- **Why Our Application Needs It:** Serves as the baseline traffic schedule against which maintenance block opportunities are discovered.

### 15. Block (Traffic Block)
- **Definition:** Temporarily stopping train traffic on a track section so workers and machines can operate safely on or near the tracks.
- **Example:** Closing the Down Line between Station A and Station B to all trains for 3 hours on Tuesday morning.
- **Why Our Application Needs It:** It is the core access mechanism our software plans and optimizes.

### 16. Maintenance Block
- **Definition:** A granted block window specifically allocated for executing planned infrastructure maintenance.
- **Example:** A 2.5-hour track tamping block granted to the Civil Engineering department.
- **Why Our Application Needs It:** Represents the unit of output that our decision-support engine recommends to operational controllers.

### 17. Integrated Maintenance Block
- **Definition:** A single maintenance block window during which multiple compatible tasks from different departments are performed simultaneously on the same track section.
- **Example:** Using a 3-hour track closure to perform Civil track tamping, S&T point machine overhauling, and TRD wire inspection together.
- **Why Our Application Needs It:** Combining compatible tasks into one block minimizes total line closures and maximizes overall track asset availability.

### 18. Block Window
- **Definition:** A continuous interval of time on a specific track section during which line access is available for maintenance.
- **Example:** 01:00 AM to 04:00 AM on Section 12 (3-hour window).
- **Why Our Application Needs It:** Defines the time boundaries into which candidate maintenance tasks can be fitted.

### 19. Block Duration
- **Definition:** The total elapsed time of a block window from start to end.
- **Example:** 180 minutes.
- **Why Our Application Needs It:** The system compares task duration against block duration to ensure work can be safely completed within the window.

### 20. Resource
- **Definition:** Personnel, heavy machinery, or specialized tools required to perform a maintenance task.
- **Example:** A Ballast Cleaning Machine (BCM) or a certified 6-person OHE maintenance crew.
- **Why Our Application Needs It:** Ensures that a recommended block plan is actually feasible based on physical equipment and crew availability.

### 21. Crew
- **Definition:** A specialized team of skilled railway workers assigned to execute specific maintenance activities.
- **Example:** S&T Signal Maintenance Gang #3 based at Allahabad Depot.
- **Why Our Application Needs It:** Prevents scheduling tasks when required workers are already committed to work elsewhere.

### 22. Machine
- **Definition:** Heavy motorized railway maintenance vehicles that operate on tracks to perform automated track work.
- **Example:** Track Tamping Machine (TTM), Tower Wagon, or Rail Grinding Train.
- **Why Our Application Needs It:** Heavy machines are expensive, scarce assets; our software must schedule their movements and avoid double-booking them.

### 23. Task Priority
- **Definition:** A calculated score reflecting how urgently a maintenance task needs to be performed relative to other tasks.
- **Example:** Priority 9.2/10 for a severe track defect vs Priority 3.1/10 for routine grass clearing.
- **Why Our Application Needs It:** Guides the optimization engine to select high-value, critical work when block time is limited.

### 24. Asset Criticality
- **Definition:** An index representing how important a specific asset is to overall network safety and train operations.
- **Example:** High criticality for a main-line junction switch vs lower criticality for a yard siding track.
- **Why Our Application Needs It:** Ensures that failure-prone assets on high-density lines receive maintenance priority.

### 25. Maintenance Duration
- **Definition:** The total time required to perform a maintenance task, including setup, active work, and site clearance.
- **Example:** 120 minutes (20 mins setup + 80 mins work + 20 mins site clearance).
- **Why Our Application Needs It:** Crucial parameter for matching candidate tasks into available block windows.

### 26. Overrun
- **Definition:** When a maintenance block takes longer than its planned duration, extending into time allocated for train traffic.
- **Example:** A block planned for 2 hours actually takes 2 hours and 35 minutes (35-minute overrun).
- **Why Our Application Needs It:** AI models estimate overrun probability so the optimizer can add safety buffers and prevent train delays.

### 27. Buffer
- **Definition:** Extra safety time added before or after a maintenance block to absorb minor work delays or setup variations.
- **Example:** A 15-minute buffer added at the end of a 2-hour block window before the next scheduled passenger train.
- **Why Our Application Needs It:** Protects train timetables from unexpected maintenance overruns.

### 28. Asset Availability
- **Definition:** The percentage of time a track asset is fully operational and available for train traffic without speed restrictions.
- **Example:** A track section operating at 96.5% availability over a month.
- **Why Our Application Needs It:** Serves as a primary objective metric that our system seeks to maximize.

### 29. Downtime
- **Definition:** The time during which a track section or asset is unavailable for normal train traffic due to maintenance or defects.
- **Example:** 4 hours of planned maintenance closure + 1 hour of unplanned defect repair = 5 hours downtime.
- **Why Our Application Needs It:** Minimizing unnecessary downtime is key to efficient railway operations.

### 30. Conflict
- **Definition:** An operational overlap where two incompatible events attempt to use the same space or resource at the same time.
- **Example:** Requesting a track maintenance block on Section A while a passenger train is scheduled to pass through Section A at the exact same time.
- **Why Our Application Needs It:** The optimization engine detects and resolves all conflicts to produce valid plans.

### 31. Dependency
- **Definition:** A relationship where one task or event cannot happen until another task or event is finished.
- **Example:** Track ballast cleaning must occur before track tamping can begin.
- **Why Our Application Needs It:** Enforces correct sequence ordering in generated block plans.

### 32. Feasible Schedule
- **Definition:** A proposed block plan that satisfies all hard physical, operational, resource, and safety constraints.
- **Example:** A schedule where no trains collide with blocks, no machines are double-booked, and all crew constraints are respected.
- **Why Our Application Needs It:** Only feasible schedules can be presented to railway controllers for operational approval.

### 33. Replanning
- **Definition:** Generating an updated block schedule when real-world conditions change unexpectedly during execution.
- **Example:** Re-adjusting afternoon block times after a morning train delay shifts traffic windows.
- **Why Our Application Needs It:** Ensures the system adapts dynamically to live disruptions rather than failing.
