# Forward Deployed Engineer + Deep Engineering Fundamentals  -  University-Inspired, Execution-Ready 91-Week Roadmap
> **Version 5.0 · 13 October 2026 · Exactly 91 planned teaching weeks, no additional mandatory weeks.** Built from the attached 91-week v2 curriculum. Weekly scope is intentionally selective: these resources are a curated reading menu, not an expectation to complete entire university courses in one week.

## Quick start  -  how to execute this document
**Start here (Week 1):** (1) Create one repository with `app/`, `labs/`, `tests/`, `docs/`, `assessments/`, `evidence/`; (2) choose your fixed 13-hour calendar slots; (3) run the two-hour prerequisite diagnostic; (4) create `evidence/week-01.md` from the template below; (5) start the *Begin with* source for Week 1. You do not need to complete a whole university course. Each numbered week is one bounded core learning unit.

**Every week, in order:** Monday/Tuesday learn and work example problems → Wednesday solve a small unseen exercise → Thursday/Friday implement the week's build and tests → Saturday sit a timed independent assessment, review prior topics, write the evidence record. The same weekly slot contains the block checkpoint when it is the last week in a block.

**Expected output per week:** one reproducible artifact, at least one meaningful correctness check, one identified failure or trade-off, a 5-minute explanation, a fresh transfer prompt, and a scored evidence note. If a week is incomplete, keep it `ATTEMPTED / GAP`, do not unlock the next week, and replace optional/stretch scope with targeted remediation. Advance only after an explicit manual verification. The syllabus remains 91 units, but time spent on an incomplete unit can extend the calendar. Never claim an unattempted or AI-generated answer as independent mastery.

**Resource rule:** `Begin with` is the anchor; `Next / reference` is just-in-time reading. University links under the block are **selected assignments and lecture references**, not a command to complete an entire term in one week. Some course handouts and automatic graders require university credentials: use the public problem statement, adapt the assignment, and write local tests.

## Read this first: what this plan is and is not
This is a **backend + production AI / Forward Deployed Engineer (FDE) roadmap**, not a UX/UI designer specialization. Its purpose is to deepen engineering knowledge and produce independently verifiable work. You already have shipped software; start with a diagnostic and fast-track familiar basics only after passing the same independent test. A fixed 91 weeks cannot guarantee mastery, a job, or expertise in every specialization.

**Non-negotiable constraint:** Blocks 1–14 contain exactly 91 numbered weekly units. **Stage 1 = Weeks 1–47** (client-facing production engineering). **Stage 2 = Weeks 48–91** (specialized internals, training, GPU and inference). No 14 extra flex weeks. Catch-up time comes from optional scope and the existing weekly schedule. If personal circumstances extend the calendar, record it honestly; do not claim 91 elapsed weeks.

## What changed from v2 (and why)
- **91 means 91, not 105.** The original file added 14 flex weeks, contradicting the requested cap. This revision uses one weekly review/buffer slot and a strict core-vs-stretch policy; no new numbered weeks.
- **No mastery by checkbox.** A completed week and demonstrated skill are separate states. Record reproducible evidence and a transfer challenge.
- **Better prerequisite control.** Add a Week 1 baseline for Python, Git, SQL, and programming; Python worker implementation begins in Week 21; complete the Python checkpoint by Week 24. Stage 2 requires C/C++-or-Go fundamentals and GPU readiness checkpoints.
- **Pilot risk acknowledged.** Collect consented questions early; do not claim a pilot will remain active for a year. Schedule at least two status checks and always keep a synthetic/public fallback clearly labeled.
- **Avoid skill theatre.** An exercise should be reproducible, testable, and appropriately scoped. Implementing production-grade Raft, an allocator, and a complete transformer in one week each is unrealistic at 13 hours/week; those weeks explicitly target **small educational subsets**.
- **Curated resources at the point of use.** Each week names its source-backed starting resource; each block provides optional deeper references.
- **Career starts before Week 36.** Light industry calibration and networking begin from Block 1; applications can begin before the last block when you meet the actual role prerequisites.

## Weekly time budget and focus
| Day | Time | Output |
|---|---:|---|
| Mon–Tue | 4 hours | First principles, official docs, worked examples |
| Wednesday | 2 hours | Exercises without a walkthrough; identify misconceptions |
| Thu–Fri | 5 hours | Small project/lab artifact; tests and fault injection |
| Saturday | 2 hours | 45m assessment, 30m spaced retrieval, 30m notes/evidence, 15m buffer |
| Sunday | 0 hours | Rest |
| **Total** | **13 hours/week** | **Minimum planned 1,183 hours for 91 units; retries and extra practice add time** |

**Rule of priority:** Do the **core** exercise, independent test, and evidence first. Read extra materials and attempt stretch tasks only if time remains. A blocked advanced exercise becomes an explicitly recorded limitation, not silent failure. Take up to 15 minutes at the end of each Saturday to redistribute next week’s work while keeping the same week count.

## Assessment system: four independent gates
1. **Recall:** Explain the model from memory in 5 minutes and answer five new conceptual questions. Check against docs, not your feelings.
2. **Build:** Solve a **fresh** task, without following a solution. Official reference docs allowed. Commit working tests.
3. **Debug:** Reproduce and diagnose a failure or an injected bug; write the root cause and verify the fix.
4. **Transfer:** Adapt the solution to one changed constraint (size, concurrency, budget, reliability, privacy), articulating trade-offs.

| Score per dimension | Meaning |
|---|---|
| 0 | Not assessed |
| 1 | Cannot complete without direct help |
| 2 | Completes with hints or substantial assistance |
| 3 | Independent using documentation; evidence is reproducible |
| 4 | Independently adapts to unfamiliar conditions and defends decisions |

**Assessment eligibility:** all four dimensions ≥3/4 *and* executable checks pass where appropriate. **Passing the scores does not automatically verify the week.** Only an explicit learner action after reviewing the evidence marks `VERIFIED`, unlocks the next week, and establishes the retention review date. This is a learning criterion, not a scientifically validated mastery certification. Independently check at least one assignment per block through a peer, mentor, code review, automated test oracle, or reference implementation. For any AI-assisted attempt, record what the AI did; a generated solution is not evidence of independent implementation.

**Retention:** create follow-up questions at +1, +4, +8 and +16 **weeks after explicit manual `VERIFIED` status** (skip offsets before the week exists and schedule those after Week 91 as optional maintenance, not extra course weeks). Retest a different task, not the same memorized test. `DONE` means required work and evidence are submitted but manual verification is pending; `VERIFIED` means the learner explicitly approved the passing evidence; `REVIEW_DUE` and `GAP` are independently tracked flags, not replacements for completion status. A retention failure does not erase past verification but creates a gap to remediate.

**Evidence template:** date · week · concept · commit / artifact URL · independent-or-assisted label · tests run + outcomes · 4 scores · failure reproduced · metric + unit + sample size · limitation · next review date.

## Locked progression and evidence policy (app and manual use)
1. Exactly **91 numbered teaching units**. No inserted flex units. The elapsed calendar time is not capped: a difficult unit can take multiple real weeks.
2. Week `N+1` stays locked until week `N` is **manually** set to `VERIFIED`. The app may calculate assessment eligibility but must never automatically verify or unlock.
3. All four independent gates (Recall, Build, Debug, Transfer) must each reach **3/4 or above**, with executable tests passing and evidence submitted. A strong average cannot compensate for one failed gate.
4. A failed gate generates a `GAP`, targeted practice, and a *new unseen* retry. Keep the active unit number unchanged. No penalty or arbitrary retry limit.
5. Required evidence: commit or artifact reference, reproduction steps, tests and results, metric with context or `not applicable`, recorded help used, a limitation, and a review record. Declare assistance honestly. An AI-authored core solution cannot establish an independent Build score of 3.
6. `PLANNED`, `ATTEMPTED`, `DONE`, `VERIFIED` are the progression states. `REVIEW_DUE` and `GAP` are separate flags. `DONE` does **not** unlock the next week.
7. Retention intervals (+1, +4, +8, +16 weeks) are calculated from **actual manual verification time**, not planned dates. A failed delayed review adds a gap without deleting historical verification.
8. Mandatory prerequisites (Python by Week 24, systems-language before Week 48, data-use consent before real pilot, and GPU readiness or honest simulation labeling) use the same locked criteria.
9. Human review is encouraged at block boundaries but is not fabricated or automatically marked complete. If unavailable, record `NOT EXTERNALLY REVIEWED` and verify against reproducible tests and a documented reference oracle.

**Execution scheduling:** Show planned date, actual verification date and schedule variance as information, not a failure grade. Keep a history of every attempt's four scores and linked `GAP` records. Begin the pilot's independent four-calendar-week clock only when Week 43 is manually activated; retain interruptions, consent state and the `SIMULATED` flag. Week locking is ON by default. Switching it OFF requires explicit confirmation, and every skip or reorder becomes an audited override, never a `VERIFIED` result. Turning locking off does not disable evidence or assessment requirements.

## Early prerequisites and target lane
- At Week 1, run a **2-hour unsupervised diagnostic**: script files from CSV, write a tiny HTTP endpoint with tests, basic SQL joins, read a stack trace, reason about a cache bug. Keep the scores. This sits *inside* Week 1.
- Select a principal language for server work (**Python recommended for AI/backend**, TypeScript acceptable for the API if the Python worker is maintained). Complete Python exceptions, typing, packaging, pytest, virtual environments, async basics by the **Week 24 checkpoint**; front-load gaps into Weeks 17–21.
- Stage 2: before Week 48, pass a **systems language mini-check** (C or C++/Go: memory, pointers/references, synchronization and race detection, builds/tests). If missing, use a minimal educational implementation or simulation rather than misrepresenting advanced projects as complete.
- For Weeks 74–79, choose GPU access within a fixed budget; if unavailable, use traced benchmarks and analytical estimates, explicitly marked `SIMULATION` instead of claiming GPU profiling.
- Review 2 current target-market role postings each month. FDE, backend AI engineer, ML systems, and research engineer have different hiring bars; avoid optimizing for all simultaneously.

## Flagship product and measurable results
**Flagship:** a **support/knowledge workflow for a consenting small business** (or an honestly labeled public/synthetic simulation). Start as a conventional API and data platform; add reliable ingestion, a retrieval-based assistant, and restricted tool actions later. Add a **small standalone webhook replay lab** only if the flagship remains stable. Avoid building many unrelated apps.

**Baseline in Weeks 1–2:** support question categories, volume, time to first response, handling time, escalation rate, common failure cases, and minimum 30–50 consented or explicitly synthetic examples. Keep a train/development/held-out split and lock held-out evaluation cases before prompt/retriever tuning; redact confidential data. Measure evaluation accuracy, refusal/unsafe-action rate, retrieval Recall@k, latency p50/p95, cost/request, response time and sample size. Do not claim causal business impact from a tiny uncontrolled pilot.

**Reliability/legal:** tenant isolation enforced with app-role tests, role checks in business logic, idempotent webhook processing, rollback plan, encrypted secrets, retention policy, user permission for action-taking, and explicit human approval for sensitive writes. Check employment IP/moonlighting obligations and client data consent, without using employer/client data without authorization.

**Execution linkage:** Each weekly Build / experiment maps to a milestone in the project specifications below. Use only the portion relevant to that week.

## Full 91-week curriculum
### Block 1  -  OS, Linux and networking · Weeks 1–5 · Stage 1

**University-style reference shelf (selected, not required in full):** [Stanford CS144 networking labs](https://web.stanford.edu/class/cs144/) (adapt a small network-debugging exercise; full TCP implementation is far beyond this block); [MIT Missing Semester](https://missing.csail.mit.edu/) (lectures and tools).
**Goal/checkpoint:** You can explain what happens from typing a URL to seeing a page, and debug a crashed service from logs alone.

**Primary resources:** [MIT Missing Semester](https://missing.csail.mit.edu/); [OSTEP: Operating Systems Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/); [Linux man-pages project](https://man7.org/linux/man-pages/); [Beej Guide to Network Programming](https://beej.us/guide/bgnet/).

**Week 1: Shell and scripting**
- **Learn (core):** Files, permissions, pipes, grep/sed/awk, bash scripts (Missing Semester lectures).
- **Build / experiment:** Rent a small VPS, create a non-root user, SSH keys only. Book 2-3 pilot discovery calls (weekday evenings or inside this slot).
- **University-style independent assignment (core):** Write an idempotent Bash provisioning audit that checks user, permissions and SSH configuration without modifying the server. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, audit a server with an absent authorized_keys file and demonstrate a safe nonzero exit. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [MIT Missing Semester](https://missing.csail.mit.edu/). **Next / reference:** [OSTEP: Operating Systems Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 2: Processes**
- **Learn (core):** Processes, signals, fork/exec, threads vs processes, systemd, cron, journalctl.
- **Build / experiment:** Run a tiny API as a systemd service with auto-restart. Finish the discovery calls and pick the pilot (weekday).
- **University-style independent assignment (core):** Create a service-unit test harness that starts a trivial process, kills it and records restart behavior. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, replace the program with one exiting successfully; show when Restart policies differ. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [MIT Missing Semester](https://missing.csail.mit.edu/). **Next / reference:** [OSTEP: Operating Systems Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 3: Memory**
- **Learn (core):** Virtual memory, stack vs heap, swap, page cache, OOM killer, free, top, vmstat.
- **Build / experiment:** Cause a memory leak on purpose and watch the OOM killer.
- **University-style independent assignment (core):** Build a bounded-memory process and collect RSS and OOM evidence at two limits. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, distinguish a userspace allocation failure from a kernel OOM termination using logs. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OSTEP: Operating Systems Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/). **Next / reference:** [Linux man-pages project](https://man7.org/linux/man-pages/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 4: Filesystems and I/O**
- **Learn (core):** Inodes, file descriptors, blocking vs async I/O, strace, lsof.
- **Build / experiment:** Trace the API with strace; set up log rotation.
- **University-style independent assignment (core):** Trace file opens in a tiny program and match descriptors to paths and close events. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, diagnose a deliberately leaked descriptor using lsof and strace. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Linux man-pages project](https://man7.org/linux/man-pages/). **Next / reference:** [Beej Guide to Network Programming](https://beej.us/guide/bgnet/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 5: Networking**
- **Learn (core):** TCP/IP, DNS, HTTP, TLS and certificates, SSH, firewalls, curl, ss, dig, tcpdump.
- **Build / experiment:** nginx reverse proxy, Let's Encrypt TLS, firewall rules.
- **University-style independent assignment (core):** Record a TLS request trace with DNS, TCP and HTTP timing and a certificate check. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, diagnose a DNS failure versus an invalid certificate using separate evidence. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Beej Guide to Network Programming](https://beej.us/guide/bgnet/). **Next / reference:** [MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview); [Wireshark user guide](https://www.wireshark.org/docs/wsug_html_chunked/).

### Block 2  -  PostgreSQL · Weeks 6–11 · Stage 1

**University-style reference shelf (selected, not required in full):** [CMU 15-445 Spring 2026 assignments](https://15445.courses.cs.cmu.edu/spring2026/assignments.html) (SQL / indexes / transactions homework); [CMU Database Group courses](https://db.cs.cmu.edu/courses/) (syllabi and lectures).
**Goal/checkpoint:** You can read a query plan, reproduce and fix a race condition, and restore from a backup. JSONB and full-text search wait until Week 35.

**Primary resources:** [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html); [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html); [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html); [PostgreSQL backup and restore](https://www.postgresql.org/docs/current/backup.html).

**Week 6: Modelling and SQL**
- **Learn (core):** Relational modelling, joins, CTEs, window functions.
- **Build / experiment:** Design tenants, documents and conversations tables.
- **University-style independent assignment (core):** Design a three-table ticket schema and write joins and one window-function query verified on fixtures. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, add an optional ticket assignee and show null-safe query behavior. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html). **Next / reference:** [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 7: Constraints and migrations**
- **Learn (core):** Constraints, migration tools, rollback, multi-tenant design options.
- **Build / experiment:** Add migrations and test a rollback.
- **University-style independent assignment (core):** Write forward and reversible schema migrations with constraints and failing invalid-row tests. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, recover when a migration fails after an earlier step on a populated database. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html). **Next / reference:** [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 8: Indexes**
- **Learn (core):** B-tree, composite, partial, GIN, EXPLAIN ANALYZE.
- **Build / experiment:** Seed 1M rows, find a slow query, fix it with an index.
- **University-style independent assignment (core):** Benchmark two queries on seeded data and justify a composite index using EXPLAIN ANALYZE. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change the filter selectivity and demonstrate when the same index loses value. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Use The Index, Luke](https://use-the-index-luke.com/). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 9: Transactions and concurrency**
- **Learn (core):** ACID, MVCC, isolation levels, locks, deadlocks.
- **Build / experiment:** Reproduce a race condition (double booking) and fix it.
- **University-style independent assignment (core):** Reproduce a double-claim race with parallel transactions, then enforce a single winner. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change isolation or locking strategy and rerun the concurrent assertion. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html). **Next / reference:** [PostgreSQL backup and restore](https://www.postgresql.org/docs/current/backup.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 10: Operations**
- **Learn (core):** Backups, WAL-based recovery, point-in-time restore, VACUUM and autovacuum basics, PgBouncer (connection pooling) concepts.
- **Build / experiment:** Backup, then a full restore drill; watch a table bloat and vacuum it.
- **University-style independent assignment (core):** Restore a backup into an empty instance and verify counts plus a checksum. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, recover after intentionally corrupting the backup file; detect rather than claim success. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PostgreSQL backup and restore](https://www.postgresql.org/docs/current/backup.html). **Next / reference:** [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 11: Row-level security**
- **Learn (core):** Roles, grants, row-level security policies for tenants.
- **Build / experiment:** Enable RLS for tenants and prove cross-tenant reads fail.
- **University-style independent assignment (core):** Add tenant-specific RLS policies and negative tests for cross-tenant SELECT and UPDATE. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test the policy under a connection with a missing or incorrect tenant context. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). **Next / reference:** [Use The Index, Luke](https://use-the-index-luke.com/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html); [Use The Index, Luke](https://use-the-index-luke.com/).

### Block 3  -  DevOps and testing · Weeks 12–16 · Stage 1

**University-style reference shelf (selected, not required in full):** [MIT 6.1810 Operating System Engineering](https://pdos.csail.mit.edu/6.1810/) (systems testing inspiration); [Google SRE workbook](https://sre.google/workbook/table-of-contents/) (production reliability exercises).
**Goal/checkpoint:** A push to main deploys with no manual steps, and you can find an injected bug from dashboards alone. No AI work in Blocks 1-4 beyond an optional one-hour Saturday experiment (not counted).

**Primary resources:** [Docker Get Started](https://docs.docker.com/get-started/); [GitHub Actions documentation](https://docs.github.com/en/actions); [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/); [OpenTelemetry documentation](https://opentelemetry.io/docs/).

**Week 12: Docker**
- **Learn (core):** Images, layers, volumes, networking, Compose.
- **Build / experiment:** Containerize the app and database.
- **University-style independent assignment (core):** Build a minimal multi-stage image and test persistent state across container recreation. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, run as non-root and demonstrate a write-permission failure and fix. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Docker Get Started](https://docs.docker.com/get-started/). **Next / reference:** [GitHub Actions documentation](https://docs.github.com/en/actions).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 13: CI and testing**
- **Learn (core):** Git branch and pull-request workflow (it is what triggers CI), GitHub Actions, testing pyramid: unit, integration, migration tests.
- **Build / experiment:** Pipeline that runs tests on every push and PR.
- **University-style independent assignment (core):** Create one unit test, one database integration test and a CI job that fails on regression. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, introduce a broken migration and prove CI stops deployment. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [GitHub Actions documentation](https://docs.github.com/en/actions). **Next / reference:** [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 14: CD and release safety**
- **Learn (core):** Staging, secrets, dependency scanning, automated rollback.
- **Build / experiment:** Auto-deploy to staging then production, with rollback.
- **University-style independent assignment (core):** Implement a staging release with health check and a documented rollback command. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, inject a failed health check and verify traffic remains on the last healthy build. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/). **Next / reference:** [OpenTelemetry documentation](https://opentelemetry.io/docs/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 15: Cloud and infrastructure**
- **Learn (core):** One cloud provider, DNS and HTTPS. Terraform only if the rebuild needs it. Kubernetes: 1 hour of concepts reading, no hands-on.
- **Build / experiment:** Rebuild the server from code; run an infrastructure recovery drill.
- **University-style independent assignment (core):** Write a reproducible server rebuild checklist/script and compare fresh-instance results. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, assume credentials are absent; document secure bootstrapping rather than hardcoding secrets. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [GitHub Actions documentation](https://docs.github.com/en/actions). **Next / reference:** [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 16: Observability**
- **Learn (core):** Logs, metrics, traces, OpenTelemetry, Prometheus/Grafana, alerts, SLOs.
- **Build / experiment:** Dashboard plus one alert; inject a bug and find it.
- **University-style independent assignment (core):** Instrument one API request with logs, metric and trace ID; alert on deliberate errors. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, cause high latency without errors and explain which alert catches it. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OpenTelemetry documentation](https://opentelemetry.io/docs/). **Next / reference:** [Google SRE Books](https://sre.google/books/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [Google SRE Books](https://sre.google/books/); [Terraform tutorials (optional)](https://developer.hashicorp.com/terraform/tutorials).

### Block 4  -  Backend and system design · Weeks 17–24 · Stage 1

**University-style reference shelf (selected, not required in full):** [Stanford CS144](https://web.stanford.edu/class/cs144/) (request lifecycle and correctness); [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) (adapt a test case).
**Goal/checkpoint:** You can design a system on a whiteboard in 45 minutes and defend each trade-off. Python checkpoint (before Week 25), without AI help: build a small Python API with validation, write pytest tests for it, use async code where it fits, and debug with logs and pdb. NumPy and pandas are taught in Weeks 25-27, so they are not part of this checkpoint. To prepare, write the project's background worker (queue consumer, ingestion, parsing) in Python from Week 21. If you miss the checkpoint, remain on Week 24 until the prerequisite is independently passed; do not add a numbered week.

**Primary resources:** [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP); [OWASP API Security Top 10](https://owasp.org/API-Security/); [OAuth 2.0 RFC 6749](https://www.rfc-editor.org/rfc/rfc6749); [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).

**Week 17: API design**
- **Learn (core):** REST conventions, validation, pagination, versioning, error formats, idempotency keys.
- **Build / experiment:** Build the REST API for the project.
- **University-style independent assignment (core):** Specify and implement one paginated REST endpoint with stable errors and validation. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, retest pagination when records are inserted between page requests. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP). **Next / reference:** [OWASP API Security Top 10](https://owasp.org/API-Security/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 18: Identity and access**
- **Learn (core):** Sessions, JWT, OAuth 2.0, RBAC, tenant isolation, least privilege, audit logs.
- **Build / experiment:** Auth plus roles (admin vs staff) and an audit log.
- **University-style independent assignment (core):** Enforce admin and staff permissions across two endpoints with an append-only audit record. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, attempt object-level access across tenants using a valid but underprivileged session. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OWASP API Security Top 10](https://owasp.org/API-Security/). **Next / reference:** [OAuth 2.0 RFC 6749](https://www.rfc-editor.org/rfc/rfc6749).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 19: Third-party integrations**
- **Learn (core):** Webhooks, signature checks, rate limits, retries against flaky APIs.
- **Build / experiment:** Connect the CRM or helpdesk the pilot uses. Start the standalone webhook intake service (capture, verify, log).
- **University-style independent assignment (core):** Verify and persist a signed webhook with replay protection using a local fake provider. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, deliver the same valid event twice and one tampered payload; prove outcomes. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OAuth 2.0 RFC 6749](https://www.rfc-editor.org/rfc/rfc6749). **Next / reference:** [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 20: Caching and traffic**
- **Learn (core):** Redis, CDNs, rate limiting, load balancing.
- **Build / experiment:** Cache hot reads and rate-limit the API.
- **University-style independent assignment (core):** Cache one expensive endpoint and prove invalidation after its underlying write. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, create concurrent cache misses and inspect potential stampede behavior. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OWASP API Security Top 10](https://owasp.org/API-Security/). **Next / reference:** [OAuth 2.0 RFC 6749](https://www.rfc-editor.org/rfc/rfc6749).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 21: Queues and workflows**
- **Learn (core):** Retries, backoff, idempotency, dead-letter queues, outbox pattern, replay.
- **Build / experiment:** Job queue with the consumer written in Python. Test that duplicate webhooks cause no duplicate work. Add retries, dead-letter handling and safe replay to the webhook service.
- **University-style independent assignment (core):** Implement a Python queue consumer with retry, idempotency key and dead-letter record. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, crash after side effect but before acknowledgement; demonstrate no duplicate effect. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [RabbitMQ reliability guides](https://www.rabbitmq.com/docs/reliability). **Next / reference:** [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 22: Data ingestion**
- **Learn (core):** File uploads, document parsing, OCR basics, scheduled syncs, resumable jobs.
- **Build / experiment:** Ingest the client's documents reliably.
- **University-style independent assignment (core):** Implement a resumable parser that stores per-document state and records malformed files. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, retry an interrupted multi-file batch without duplicating completed documents. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [RabbitMQ reliability guides](https://www.rabbitmq.com/docs/reliability). **Next / reference:** [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 23: Distributed data**
- **Learn (core):** Replication, partitioning, consistency, CAP, intro to consensus.
- **Build / experiment:** Read-replica experiment with stale reads.
- **University-style independent assignment (core):** Create a primary/read-replica demonstration and record a stale-read example. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, route a read-after-write request and explain how consistency changes. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Designing Data-Intensive Applications (publisher)](https://dataintensive.net/). **Next / reference:** [Microsoft Azure Architecture: Circuit Breaker](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 24: Failure handling**
- **Learn (core):** Timeouts, circuit breakers, backpressure, retry budgets.
- **Build / experiment:** Add timeouts and a circuit breaker; write the design doc.
- **University-style independent assignment (core):** Add bounded timeouts and a circuit breaker to a flaky dependency simulation. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test half-open recovery and prove the retry budget does not explode. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Designing Data-Intensive Applications (publisher)](https://dataintensive.net/). **Next / reference:** [Microsoft Azure Architecture: Circuit Breaker](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [Cloudflare learning: caching](https://www.cloudflare.com/learning/cdn/what-is-caching/); [RabbitMQ reliability guides](https://www.rabbitmq.com/docs/reliability); [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html); [Designing Data-Intensive Applications (publisher)](https://dataintensive.net/); [Microsoft Azure Architecture: Circuit Breaker](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker); [pytest documentation](https://docs.pytest.org/en/stable/).

### Block 5  -  AI foundations · Weeks 25–32 · Stage 1

**University-style reference shelf (selected, not required in full):** [Stanford CS229](https://cs229.stanford.edu/) (prerequisite-level exercises); [Karpathy Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) (guided implementations); [Stanford CS336](https://cs336.stanford.edu/) (transformers; selectively).
**Goal/checkpoint:** You can explain backprop and attention on a whiteboard, and you have written a small transformer yourself. Eight weeks gives understanding of small models, not deep-learning mastery. Block 11 goes further. Tight weeks (26, 28, 31) may require additional calendar time while retaining the same week number; remove optional/stretch scope before extending time. This block's Thu-Fri work lives in the lab/ folder and connects to the project in Weeks 25, 30 and 32.

**Primary resources:** [3Blue1Brown Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra); [Mathematics for Machine Learning (free book)](https://mml-book.github.io/); [NumPy quickstart](https://numpy.org/doc/stable/user/quickstart.html); [Andrej Karpathy Zero to Hero](https://karpathy.ai/zero-to-hero.html).

**Week 25: Linear algebra**
- **Learn (core):** Vectors, matrices, dot products, why embeddings work. Introduce NumPy this week.
- **Build / experiment:** Compute similarity between the client's documents by hand in NumPy (project link).
- **University-style independent assignment (core):** Compute and rank document cosine similarity in NumPy, validating known vectors by hand. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, use zero vectors and unequal magnitudes; explain normalization behavior. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [3Blue1Brown Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra). **Next / reference:** [Mathematics for Machine Learning (free book)](https://mml-book.github.io/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 26: Calculus and probability**
- **Learn (core):** Gradients, chain rule intuition, distributions, Bayes.
- **Build / experiment:** Plot a loss curve and its gradient (lab).
- **University-style independent assignment (core):** Differentiate a two-parameter loss by hand and check the derivatives numerically. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change the learning rate and explain a divergence using plotted loss. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Mathematics for Machine Learning (free book)](https://mml-book.github.io/). **Next / reference:** [NumPy quickstart](https://numpy.org/doc/stable/user/quickstart.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

- **Minimum to pass (bounded core):** Derive and numerically check gradients for one two-parameter function; no full calculus course. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 27: Learning from data**
- **Learn (core):** Regression, loss functions, gradient descent.
- **Build / experiment:** Linear and logistic regression from scratch (lab).
- **University-style independent assignment (core):** Implement logistic regression gradient updates on a tiny dataset without ML libraries. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, rebalance labels and inspect changes in threshold-dependent precision. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Mathematics for Machine Learning (free book)](https://mml-book.github.io/). **Next / reference:** [NumPy quickstart](https://numpy.org/doc/stable/user/quickstart.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 28: Neural nets**
- **Learn (core):** Backpropagation, micrograd.
- **Build / experiment:** Build micrograd yourself, no AI help on the core (lab).
- **University-style independent assignment (core):** Build a minimal scalar autodiff engine supporting addition, multiplication and backward propagation. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test a shared subexpression and compare gradients to finite differences. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Andrej Karpathy Zero to Hero](https://karpathy.ai/zero-to-hero.html). **Next / reference:** [PyTorch tutorials](https://docs.pytorch.org/tutorials/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

- **Minimum to pass (bounded core):** Correct autodiff for addition, multiplication, repeated variables and one finite-difference check; full micrograd is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 29: PyTorch and training**
- **Learn (core):** Optimizers, overfitting, regularization, train/val/test discipline.
- **Build / experiment:** Train a small classifier, track train vs validation loss (lab).
- **University-style independent assignment (core):** Train a tiny PyTorch classifier with separate train/validation splits and logged seeds. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, inject label noise and show overfitting on the curves. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PyTorch tutorials](https://docs.pytorch.org/tutorials/). **Next / reference:** [Hugging Face NLP course](https://huggingface.co/learn/llm-course/chapter1/1).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 30: Tokens and embeddings**
- **Learn (core):** BPE tokenization, embeddings, makemore.
- **Build / experiment:** Tokenize the client's documents and inspect token counts (project link).
- **University-style independent assignment (core):** Implement simple token-frequency inspection and embedding lookup on project text. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, compare token counts before and after altered whitespace or punctuation. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Hugging Face NLP course](https://huggingface.co/learn/llm-course/chapter1/1). **Next / reference:** [Attention Is All You Need](https://arxiv.org/abs/1706.03762).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 31: Attention and transformers**
- **Learn (core):** Query-key-value, Let's build GPT, the Attention paper.
- **Build / experiment:** Build a tiny transformer (lab).
- **University-style independent assignment (core):** Implement single-head causal attention on a tiny sequence with a tested causal mask. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, alter sequence length and prove future-token information is blocked. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Attention Is All You Need](https://arxiv.org/abs/1706.03762). **Next / reference:** [Hugging Face PEFT](https://huggingface.co/docs/peft/index).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

- **Minimum to pass (bounded core):** One-head masked scaled dot-product attention with shape/masking tests; end-to-end GPT training is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 32: Training stages**
- **Learn (core):** Pretraining vs fine-tuning, scaling laws, SFT, RLHF/DPO concepts, LoRA.
- **Build / experiment:** Small LoRA fine-tune on the client's support text (project link).
- **University-style independent assignment (core):** Run a bounded LoRA adapter experiment on a tiny supported model and compare baseline predictions. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, evaluate one held-out prompt family and identify a regression despite lower train loss. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Hugging Face PEFT](https://huggingface.co/docs/peft/index). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [PyTorch tutorials](https://docs.pytorch.org/tutorials/); [Hugging Face NLP course](https://huggingface.co/learn/llm-course/chapter1/1); [Attention Is All You Need](https://arxiv.org/abs/1706.03762); [Hugging Face PEFT](https://huggingface.co/docs/peft/index).

### Block 6  -  LLM engineering and agents · Weeks 33–40 · Stage 1

**University-style reference shelf (selected, not required in full):** [Stanford CS336](https://cs336.stanford.edu/) (model evaluation and serving); [Full Stack Deep Learning](https://fullstackdeeplearning.com/) (real AI product engineering); [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) (safety tests).
**Goal/checkpoint:** You can answer "how do you know it works?" with data: accuracy, latency and cost, before and after each improvement. Outreach starts around Week 36. Begin applications when evaluation evidence and job fit are sufficient; use existing Week 40 or career-practice time, not an extra flex week.

**Primary resources:** [OpenAI text generation and structured outputs documentation](https://platform.openai.com/docs/guides/structured-outputs); [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices); [pgvector](https://github.com/pgvector/pgvector); [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents).

**Week 33: LLM APIs**
- **Learn (core):** Context windows, sampling, structured outputs, streaming, cost and latency.
- **Build / experiment:** Wire an LLM into the project with structured output and per-call cost logging.
- **University-style independent assignment (core):** Add JSON-schema validation and token-cost logging to one model call with mocked fallback. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, return invalid JSON and a timed-out response; prove bounded failure handling. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OpenAI text generation and structured outputs documentation](https://platform.openai.com/docs/guides/structured-outputs). **Next / reference:** [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 34: Evals**
- **Learn (core):** Golden sets, retrieval metrics, LLM-as-judge, regression tests.
- **Build / experiment:** Build the 30-50 question eval set from the questions collected in Weeks 1-2, plus a regression runner.
- **University-style independent assignment (core):** Write 30 labeled evaluation cases and an executable scorer with per-category breakdown. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, swap five cases to a holdout set and explain uncertainty at small sample size. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices). **Next / reference:** [pgvector](https://github.com/pgvector/pgvector).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 35: RAG**
- **Learn (core):** Chunking, hybrid search (full-text and JSONB, moved here from Block 2), reranking, pgvector with HNSW, embedding vs keyword search.
- **Build / experiment:** Build retrieval over the client's documents and score it against the Week 34 eval set.
- **University-style independent assignment (core):** Build keyword and vector retrieval baselines, comparing hit-at-k on held-out queries. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, ask a paraphrased and an exact-match query; report which retriever fails. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [pgvector](https://github.com/pgvector/pgvector). **Next / reference:** [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 36: Tool calling and agents**
- **Learn (core):** Tool calling, ReAct loop, MCP.
- **Build / experiment:** Give the agent approved tools (order lookup, ticket creation).
- **University-style independent assignment (core):** Implement a tool dispatcher that validates arguments and restricts accessible actions. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, prompt for an unregistered or malformed tool call and verify rejection. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents). **Next / reference:** [Model Context Protocol documentation](https://modelcontextprotocol.io/introduction).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 37: Agent safety**
- **Learn (core):** Prompt injection, tool permissions, human approval for sensitive actions, data leakage.
- **Build / experiment:** Adversarial test suite; approval step for risky actions.
- **University-style independent assignment (core):** Create five prompt-injection attack cases against retrieved documents and test tool permissions. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test an injected instruction inside a tool result and prove approval cannot be bypassed. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OWASP GenAI Security](https://genai.owasp.org/). **Next / reference:** [OpenTelemetry documentation](https://opentelemetry.io/docs/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 38: Tracing and cost control**
- **Learn (core):** Tracing, caching, model routing, token budgets.
- **Build / experiment:** Add traces and a cost-per-conversation metric (builds on Week 33 logging). Start shadow mode: the agent drafts, a human sends.
- **University-style independent assignment (core):** Trace a complete model/tool interaction and compute cost per successful case. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, simulate two retries and show how cost and latency metrics change. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OpenTelemetry documentation](https://opentelemetry.io/docs/). **Next / reference:** [Vercel AI SDK stream UI examples](https://ai-sdk.dev/docs/ai-sdk-ui/overview).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 39: Interface**
- **Learn (core):** Streaming chat UI, file handling, an admin page to review conversations and failed jobs.
- **Build / experiment:** Minimal chat UI plus admin review screen.
- **University-style independent assignment (core):** Build a keyboard-operable review interface showing sources, errors and approval state. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test loading, empty, and failed-request states without a mouse. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Vercel AI SDK stream UI examples](https://ai-sdk.dev/docs/ai-sdk-ui/overview). **Next / reference:** [vLLM documentation](https://docs.vllm.ai/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 40: Serving open models**
- **Learn (core):** vLLM serving basics, measuring tokens/sec.
- **Build / experiment:** Serve an open model on a rented GPU; compare with the API on cost and latency.
- **University-style independent assignment (core):** Serve one small open model and measure tokens per second and request latency under fixed conditions. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change sequence length, document hardware limits and compare to API baseline fairly. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [vLLM documentation](https://docs.vllm.ai/). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [Model Context Protocol documentation](https://modelcontextprotocol.io/introduction); [OWASP GenAI Security](https://genai.owasp.org/); [OpenTelemetry documentation](https://opentelemetry.io/docs/); [Vercel AI SDK stream UI examples](https://ai-sdk.dev/docs/ai-sdk-ui/overview); [vLLM documentation](https://docs.vllm.ai/).

### Block 7  -  FDE delivery and launch · Weeks 41–47 · Stage 1

**University-style reference shelf (selected, not required in full):** [Google SRE workbook](https://sre.google/workbook/table-of-contents/) (incident, on-call, rollout practice); [Stanford d.school Bootcamp Bootleg](https://dschool.stanford.edu/resources/the-bootcamp-bootleg) (discovery/interview techniques).
**Goal/checkpoint:** A published case study with real numbers (Week 46) and a runbook someone else could follow. The live pilot runs 4 weeks, Weeks 43-46. Label every number small-sample.

**Primary resources:** [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/); [Google SRE Workbook](https://sre.google/workbook/table-of-contents/); [GitHub Docs: writing a good README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes); [Google Technical Writing](https://developers.google.com/tech-writing).

**Week 41: Hardening**
- **Learn (core):** End-to-end and load tests, OWASP checklist, encryption at rest, data retention.
- **Build / experiment:** Security review of your own system; fix findings. Confirm the pilot is still engaged (else switch to the fallback).
- **University-style independent assignment (core):** Run an authenticated cross-tenant request suite and an end-to-end fault-recovery rehearsal. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, attempt unauthorized tool use through the chat path and record blocked behavior. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/). **Next / reference:** [Google SRE Workbook](https://sre.google/workbook/table-of-contents/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 42: Customer skills**
- **Learn (core):** Scoping, acceptance criteria, status updates, demos, runbooks.
- **Build / experiment:** Write the discovery doc, acceptance criteria and runbook.
- **University-style independent assignment (core):** Write one-page scope and acceptance criteria from a recorded or simulated stakeholder interview. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change a client constraint and negotiate a measurable scope reduction. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Nielsen Norman Group: usability testing](https://www.nngroup.com/articles/usability-testing-101/). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 43: Go-live**
- **Learn (core):** Deployment and onboarding practice.
- **Build / experiment:** Go live with the pilot business (pilot week 1 of 4). Daily monitoring.
- **University-style independent assignment (core):** Deploy the pilot with consent or simulation labeling; record a baseline and first-day checklist. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, trigger a rollback drill and show no private customer data in logs. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Google SRE Workbook](https://sre.google/workbook/table-of-contents/). **Next / reference:** [GitHub Docs: writing a good README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 44: Incident response**
- **Learn (core):** Incident response basics, post-incident reviews.
- **Build / experiment:** Fix issues from real usage, track metrics (pilot week 2 of 4).
- **University-style independent assignment (core):** Write an incident timeline for an injected outage and verify the documented recovery steps. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, repeat incident with a misleading symptom and revise the runbook. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Google SRE: Postmortem culture](https://sre.google/sre-book/postmortem-culture/). **Next / reference:** [Nielsen Norman Group: usability testing](https://www.nngroup.com/articles/usability-testing-101/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 45: Handover**
- **Learn (core):** Post-launch review, handover checklist, finalising the runbook.
- **Build / experiment:** Compare interim numbers with your Week 1-2 baseline (pilot week 3 of 4).
- **University-style independent assignment (core):** Prepare a handover guide and have a fresh reader reproduce an operational task. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, hide one necessary environment variable and observe handover failure. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Google SRE Workbook](https://sre.google/workbook/table-of-contents/). **Next / reference:** [GitHub Docs: writing a good README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 46: Case study and portfolio**
- **Learn (core):** Presenting technical work.
- **Build / experiment:** Pilot week 4 ends. Compare final results with the baseline. Demo video, README, resume, cleaned-up GitHub.
- **University-style independent assignment (core):** Write a case study with baseline, sample size, observed result and limitations. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, remove one uncertain metric and revise the conclusion without exaggeration. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Google Technical Writing](https://developers.google.com/tech-writing). **Next / reference:** [Google SRE: Postmortem culture](https://sre.google/sre-book/postmortem-culture/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 47: Interview prep**
- **Learn (core):** System design, live coding, AI engineering questions, mock customer calls (tailored to your chosen lane).
- **Build / experiment:** Two mock design interviews and one mock customer call.
- **University-style independent assignment (core):** Complete a timed design interview and document bottlenecks, risks and tradeoffs. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change expected traffic or compliance constraint halfway through the design. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [GitHub Docs: writing a good README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes). **Next / reference:** [Google Technical Writing](https://developers.google.com/tech-writing).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [Google SRE: Postmortem culture](https://sre.google/sre-book/postmortem-culture/); [Nielsen Norman Group: usability testing](https://www.nngroup.com/articles/usability-testing-101/).

### Block 8  -  OS internals · Weeks 48–53 · Stage 2

**University-style reference shelf (selected, not required in full):** [MIT 6.1810 Operating System Engineering](https://pdos.csail.mit.edu/6.1810/) (xv6 and systems labs); [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/) (practice problems).
**Goal/checkpoint:** Stage 2 is for your own depth. Priority order: Blocks 11-14 first, then 8-10 as time allows.

**Primary resources:** [OSTEP free text](https://pages.cs.wisc.edu/~remzi/OSTEP/); [xv6 book and source (MIT)](https://pdos.csail.mit.edu/6.1810/); [Linux namespaces manual](https://man7.org/linux/man-pages/man7/namespaces.7.html); [Linux cgroups manual](https://man7.org/linux/man-pages/man7/cgroups.7.html).

**Week 48: Scheduling**
- **Learn (core):** CPU scheduling policies, context switches.
- **Build / experiment:** Simulate FCFS, SJF, round-robin and MLFQ in code.
- **University-style independent assignment (core):** Implement an FCFS and round-robin scheduler simulator and compare wait times. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, add an I/O-blocking task and explain why scheduling results shift. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OSTEP free text](https://pages.cs.wisc.edu/~remzi/OSTEP/). **Next / reference:** [xv6 book and source (MIT)](https://pdos.csail.mit.edu/6.1810/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 49: Concurrency**
- **Learn (core):** Threads, locks, condition variables, deadlock.
- **Build / experiment:** Build a thread-safe queue.
- **University-style independent assignment (core):** Implement a bounded producer-consumer queue with condition variables and race tests. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, use two producers and consumers; prove no lost or duplicated items. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OSTEP free text](https://pages.cs.wisc.edu/~remzi/OSTEP/). **Next / reference:** [xv6 book and source (MIT)](https://pdos.csail.mit.edu/6.1810/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 50: Virtual memory in depth**
- **Learn (core):** Paging, TLBs, page replacement, malloc design.
- **Build / experiment:** Build a toy memory allocator and test it with a stress program.
- **University-style independent assignment (core):** Build a basic bump allocator with bounds checking and repeatable allocations. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, introduce an out-of-memory request and verify graceful rejection. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OSTEP free text](https://pages.cs.wisc.edu/~remzi/OSTEP/). **Next / reference:** [xv6 book and source (MIT)](https://pdos.csail.mit.edu/6.1810/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 51: Filesystems**
- **Learn (core):** Journaling, crash consistency.
- **Build / experiment:** Build a tiny append-only log store; crash-test it with kill -9.
- **University-style independent assignment (core):** Build an append-only file journal with replay after forced termination. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, kill during a partial append and specify how the reader detects torn records. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [OSTEP free text](https://pages.cs.wisc.edu/~remzi/OSTEP/). **Next / reference:** [xv6 book and source (MIT)](https://pdos.csail.mit.edu/6.1810/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 52: Containers**
- **Learn (core):** Namespaces, cgroups.
- **Build / experiment:** Build a container by hand with namespaces.
- **University-style independent assignment (core):** Run a process with selected Linux namespaces and inspect visible PID/network differences. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, remove a namespace and document exactly which isolation guarantee disappears. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [xv6 book and source (MIT)](https://pdos.csail.mit.edu/6.1810/). **Next / reference:** [Linux namespaces manual](https://man7.org/linux/man-pages/man7/namespaces.7.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 53: System calls and the shell**
- **Learn (core):** xv6 structure, how system calls work.
- **Build / experiment:** Read xv6 syscalls; build a toy shell (fork/exec, pipes, signals).
- **University-style independent assignment (core):** Implement a tiny shell that runs programs and handles a simple pipe. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, send SIGINT during a pipeline; show which processes terminate. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [xv6 book and source (MIT)](https://pdos.csail.mit.edu/6.1810/). **Next / reference:** [Linux namespaces manual](https://man7.org/linux/man-pages/man7/namespaces.7.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.



### Block 9  -  Database internals · Weeks 54–59 · Stage 2

**University-style reference shelf (selected, not required in full):** [CMU 15-445 Spring 2026 assignments](https://15445.courses.cs.cmu.edu/spring2026/assignments.html) (use project descriptions as challenge specifications; do not try entire semester); [CMU Database Group](https://db.cs.cmu.edu/courses/).
**Goal/checkpoint:** A B-tree key-value store with buffer pool and write-ahead log, benchmarked.

**Primary resources:** [CMU Database Group current course list](https://db.cs.cmu.edu/courses/); [CMU 15-445/645 course](https://15445.courses.cs.cmu.edu/); [SQLite file format](https://www.sqlite.org/fileformat2.html); [PostgreSQL WAL internals](https://www.postgresql.org/docs/current/wal-intro.html).

**Week 54: Storage and pages**
- **Learn (core):** Heap files, slotted pages.
- **Build / experiment:** Page manager for a key-value store.
- **University-style independent assignment (core):** Implement a fixed-size slotted-page format that can insert and read small records. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, try an oversized record and a deleted slot; prove bounds safety. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [CMU Database Group current course list](https://db.cs.cmu.edu/courses/). **Next / reference:** [CMU 15-445/645 course](https://15445.courses.cs.cmu.edu/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 55: B-trees**
- **Learn (core):** Insert, split, search.
- **Build / experiment:** B-tree implementation.
- **University-style independent assignment (core):** Implement search and insertion for a small B-tree with leaf splitting. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, insert sorted keys to force splits and verify ordered traversal. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [CMU 15-445/645 course](https://15445.courses.cs.cmu.edu/). **Next / reference:** [SQLite file format](https://www.sqlite.org/fileformat2.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 56: Buffer manager**
- **Learn (core):** Caching pages, eviction policies.
- **Build / experiment:** Add a buffer pool.
- **University-style independent assignment (core):** Build an LRU buffer-pool simulator with pin/unpin semantics and eviction tests. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, pin every page and show behavior when no victim is available. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [CMU 15-445/645 course](https://15445.courses.cs.cmu.edu/). **Next / reference:** [SQLite file format](https://www.sqlite.org/fileformat2.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 57: Query execution**
- **Learn (core):** Planner, join algorithms, cost estimates.
- **Build / experiment:** Add a scan/filter operator to your store; compare join plans in Postgres on your 1M-row data.
- **University-style independent assignment (core):** Implement a scan/filter operator and compare its results with SQL reference output. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test NULL semantics and a predicate on an empty table. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [CMU 15-445/645 course](https://15445.courses.cs.cmu.edu/). **Next / reference:** [SQLite file format](https://www.sqlite.org/fileformat2.html).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 58: WAL and recovery**
- **Learn (core):** Logging, checkpoints, crash recovery.
- **Build / experiment:** Add a write-ahead log and a crash test.
- **University-style independent assignment (core):** Add write-ahead records to a toy store and replay a committed update after crash. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, crash before commit and show why the incomplete change is not applied. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PostgreSQL WAL internals](https://www.postgresql.org/docs/current/wal-intro.html). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 59: Replication**
- **Learn (core):** Streaming replication, failover.
- **Build / experiment:** Finish and benchmark the store.
- **University-style independent assignment (core):** Simulate primary/follower state replication with explicit version numbers. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, disconnect follower and document stale reads and rejoin behavior. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PostgreSQL WAL internals](https://www.postgresql.org/docs/current/wal-intro.html). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.



### Block 10  -  Distributed systems · Weeks 60–65 · Stage 2

**University-style reference shelf (selected, not required in full):** [MIT 6.5840 Distributed Systems](https://pdos.csail.mit.edu/6.824/) (Raft lab and paper-reading style; implement bounded slices); [Raft paper](https://raft.github.io/raft.pdf).
**Goal/checkpoint:** A replicated key-value store that survives killed nodes.

**Primary resources:** [MIT 6.5840 distributed systems](https://pdos.csail.mit.edu/6.824/); [Raft paper](https://raft.github.io/raft.pdf); [Raft visualization](https://thesecretlivesofdata.com/raft/); [Designing Data-Intensive Applications](https://dataintensive.net/).

**Week 60: Time and ordering**
- **Learn (core):** Clocks, logical time, happens-before.
- **Build / experiment:** Lamport clock simulation.
- **University-style independent assignment (core):** Implement Lamport clocks for a three-node message trace. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, reorder independent events and explain what the timestamps do not prove. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [MIT 6.5840 distributed systems](https://pdos.csail.mit.edu/6.824/). **Next / reference:** [Raft paper](https://raft.github.io/raft.pdf).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 61: Replication**
- **Learn (core):** Leaders, followers, quorums.
- **Build / experiment:** Primary-backup key-value store.
- **University-style independent assignment (core):** Implement a simple primary-backup write log with acknowledgements. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, drop an acknowledgement and distinguish retry from duplicate commit. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Designing Data-Intensive Applications](https://dataintensive.net/). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 62: Paxos**
- **Learn (core):** Consensus problem, Paxos basics.
- **Build / experiment:** Trace a Paxos run on paper.
- **University-style independent assignment (core):** Trace a fixed two-proposer Paxos execution on paper with promises and acceptances. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, introduce a higher proposal number and identify forbidden acceptance. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Designing Data-Intensive Applications](https://dataintensive.net/). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 63: Raft: leader election**
- **Learn (core):** Terms, votes, election timeouts.
- **Build / experiment:** Implement leader election.
- **University-style independent assignment (core):** Implement a minimal Raft-style election state machine for three simulated nodes. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, partition votes and assert at most one leader per term under modeled assumptions. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Raft paper](https://raft.github.io/raft.pdf). **Next / reference:** [Raft visualization](https://thesecretlivesofdata.com/raft/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Election only in a deterministic three-node simulation with term and vote invariants; networked Raft is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 64: Raft: log replication**
- **Learn (core):** Log matching, commit rules.
- **Build / experiment:** Add log replication to your store.
- **University-style independent assignment (core):** Extend a simulated leader with a log-match check and majority-commit exercise. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, give followers conflicting suffixes and show how consistency is restored. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Raft paper](https://raft.github.io/raft.pdf). **Next / reference:** [Raft visualization](https://thesecretlivesofdata.com/raft/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Demonstrate log matching and majority commit in a deterministic simulation; production fault tolerance is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 65: Consistency and fault injection**
- **Learn (core):** Consistency models, two-phase commit.
- **Build / experiment:** Kill nodes and verify the store stays correct.
- **University-style independent assignment (core):** Run deterministic fault-injection cases on the replicated-store simulator. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, kill the leader before majority acknowledgment and state which writes are committed. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Designing Data-Intensive Applications](https://dataintensive.net/). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Three documented fault cases checking safety properties in a toy simulation; no production consensus claim. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.



### Block 11  -  Deep learning in depth · Weeks 66–73 · Stage 2

**University-style reference shelf (selected, not required in full):** [Stanford CS336 Spring 2026](https://cs336.stanford.edu/) (model design, data, training); [Stanford CS224n](https://web.stanford.edu/class/cs224n/) (NLP foundations).
**Goal/checkpoint:** A small language model you trained yourself, with loss and compute tracked.

**Primary resources:** [Stanford CS336](https://cs336.stanford.edu/); [Stanford CS224N](https://web.stanford.edu/class/cs224n/); [PyTorch distributed training](https://docs.pytorch.org/tutorials/intermediate/ddp_tutorial.html); [Hugging Face datasets](https://huggingface.co/docs/datasets/index).

**Week 66: Training dynamics**
- **Learn (core):** Optimizers, learning-rate schedules, initialization.
- **Build / experiment:** Compare optimizers on a small model.
- **University-style independent assignment (core):** Train a tiny model using two optimizers and compare validation trajectories at fixed seeds. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change learning-rate schedule and distinguish instability from poor fit. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Stanford CS336](https://cs336.stanford.edu/). **Next / reference:** [Stanford CS224N](https://web.stanford.edu/class/cs224n/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 67: Scaling laws**
- **Learn (core):** Compute, data and parameter trade-offs.
- **Build / experiment:** Reproduce a small scaling curve.
- **University-style independent assignment (core):** Run a tiny model-size versus compute comparison with logged token counts. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, alter training-data size and explain why the observed curve is inconclusive. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Stanford CS336](https://cs336.stanford.edu/). **Next / reference:** [Stanford CS224N](https://web.stanford.edu/class/cs224n/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 68: Modern architectures**
- **Learn (core):** GQA, RoPE, MoE.
- **Build / experiment:** Add RoPE to your tiny transformer.
- **University-style independent assignment (core):** Implement rotary position embedding on a tiny attention tensor with shape tests. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, compare a longer context position and check numerical invariants. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Stanford CS336](https://cs336.stanford.edu/). **Next / reference:** [Stanford CS224N](https://web.stanford.edu/class/cs224n/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 69: Data pipelines**
- **Learn (core):** Dataset building, filtering, deduplication.
- **Build / experiment:** Build a cleaned training set.
- **University-style independent assignment (core):** Build a deduplication and filtering pipeline that reports retained data proportion. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, insert near-duplicates and track leakage across training and validation. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Hugging Face datasets](https://huggingface.co/docs/datasets/index). **Next / reference:** [FlashAttention paper](https://arxiv.org/abs/2205.14135).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 70: Mixed precision and memory**
- **Learn (core):** FP16/BF16, activation memory, checkpointing.
- **Build / experiment:** Measure memory with and without mixed precision (GPU).
- **University-style independent assignment (core):** Measure training memory for one small model at two precision settings. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, force an out-of-memory batch and demonstrate a smaller safe configuration. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Hugging Face datasets](https://huggingface.co/docs/datasets/index). **Next / reference:** [FlashAttention paper](https://arxiv.org/abs/2205.14135).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 71: Data parallel and FSDP**
- **Learn (core):** Gradient sync, sharding.
- **Build / experiment:** Multi-GPU or simulated data-parallel run.
- **University-style independent assignment (core):** Demonstrate data-parallel gradient averaging on CPU with two synthetic workers. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, imbalance worker batch sizes and correct the weighted aggregation. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PyTorch distributed training](https://docs.pytorch.org/tutorials/intermediate/ddp_tutorial.html). **Next / reference:** [Hugging Face datasets](https://huggingface.co/docs/datasets/index).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 72: Tensor and pipeline parallelism**
- **Learn (core):** Splitting models across devices.
- **Build / experiment:** Work out a parallelism plan for a larger model on paper.
- **University-style independent assignment (core):** Create a documented partition plan for a model with per-device memory estimates. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, reduce interconnect throughput and recalculate the communication bottleneck. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PyTorch distributed training](https://docs.pytorch.org/tutorials/intermediate/ddp_tutorial.html). **Next / reference:** [Hugging Face datasets](https://huggingface.co/docs/datasets/index).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 73: Train a small LM**
- **Learn (core):** Full training run.
- **Build / experiment:** Train; track loss and compute used.
- **University-style independent assignment (core):** Run a reproducible short small-LM training loop with checkpoints and loss log. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, resume from a checkpoint and compare the next-step loss to uninterrupted training. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Stanford CS336](https://cs336.stanford.edu/). **Next / reference:** [Stanford CS224N](https://web.stanford.edu/class/cs224n/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** One reproducible tiny language-model training run, checkpoint/restart and train/validation curves; large model training is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [FlashAttention paper](https://arxiv.org/abs/2205.14135).

### Block 12  -  Hardware and accelerators · Weeks 74–81 · Stage 2

**University-style reference shelf (selected, not required in full):** [Stanford CS336](https://cs336.stanford.edu/) (systems performance topics); [NVIDIA CUDA C Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html) (API and hardware concepts); [FlashAttention](https://arxiv.org/abs/2205.14135).
**Goal/checkpoint:** Roofline for your own model and CUDA kernels you wrote and profiled. Weeks 74-79 need a GPU.

**Primary resources:** [NVIDIA CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/); [NVIDIA Nsight Compute docs](https://docs.nvidia.com/nsight-compute/); [Stanford CS336 systems unit](https://cs336.stanford.edu/); [FlashAttention paper](https://arxiv.org/abs/2205.14135).

**Week 74: CPU vs GPU and memory hierarchy**
- **Learn (core):** Registers, SRAM, HBM, DRAM, why data movement dominates.
- **Build / experiment:** Measure memory bandwidth on a GPU.
- **University-style independent assignment (core):** Benchmark a CPU and GPU vector operation with data-transfer time separated. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, vary array size and identify when GPU launch overhead dominates. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [NVIDIA CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/). **Next / reference:** [NVIDIA Nsight Compute docs](https://docs.nvidia.com/nsight-compute/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 75: Roofline model**
- **Learn (core):** Arithmetic intensity, compute vs memory bound.
- **Build / experiment:** Roofline for your own model.
- **University-style independent assignment (core):** Construct a roofline estimate for one measured matrix multiplication. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change arithmetic intensity and predict memory versus compute bounds. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [NVIDIA CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/). **Next / reference:** [NVIDIA Nsight Compute docs](https://docs.nvidia.com/nsight-compute/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 76: CUDA basics**
- **Learn (core):** Threads, blocks, warps, memory spaces.
- **Build / experiment:** Vector add and matrix multiply kernels.
- **University-style independent assignment (core):** Write and verify a basic CUDA vector-add kernel against a CPU reference. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test non-multiple-of-block-length arrays and enforce bounds checks. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [NVIDIA Nsight Compute docs](https://docs.nvidia.com/nsight-compute/). **Next / reference:** [Stanford CS336 systems unit](https://cs336.stanford.edu/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** One bounds-safe vector addition kernel and CPU comparison; GPU unavailable means record a blocked hardware prerequisite, not measured-GPU evidence. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 77: Kernel optimization**
- **Learn (core):** Tiling, coalescing, profiling with Nsight.
- **Build / experiment:** Speed up your matmul and report gains.
- **University-style independent assignment (core):** Optimize a simple CUDA matrix operation and report median runtime before/after. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change matrix shape and explain why speedup may disappear. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [NVIDIA Nsight Compute docs](https://docs.nvidia.com/nsight-compute/). **Next / reference:** [Stanford CS336 systems unit](https://cs336.stanford.edu/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** One measurable kernel improvement with correctness checks and fixed hardware/input; optimized GEMM is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 78: Tensor cores and precision**
- **Learn (core):** FP16, BF16, FP8, INT8.
- **Build / experiment:** Compare speed and accuracy across precisions.
- **University-style independent assignment (core):** Compare two available numerical precisions on a fixed small workload. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, create an input range that reveals accuracy or overflow limits. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [NVIDIA CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/). **Next / reference:** [NVIDIA Nsight Compute docs](https://docs.nvidia.com/nsight-compute/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

- **Minimum to pass (bounded core):** Two supported precisions benchmarked for error and latency; FP8 hardware support is not required. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 79: FlashAttention**
- **Learn (core):** Why SRAM vs HBM matters for attention.
- **Build / experiment:** Benchmark attention and explain it in the write-up.
- **University-style independent assignment (core):** Benchmark standard versus memory-efficient attention where available. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, vary sequence length and record peak-memory impact, without claiming universal speedups. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [FlashAttention paper](https://arxiv.org/abs/2205.14135). **Next / reference:** [TPU original paper](https://arxiv.org/abs/1704.04760).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Memory and timing comparison of an available efficient-attention implementation against baseline; writing FlashAttention from scratch is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 80: TPUs**
- **Learn (core):** Systolic arrays, TPU design.
- **Build / experiment:** Hand-trace a small matrix multiply on a systolic array.
- **University-style independent assignment (core):** Simulate a small systolic matrix multiply and verify the result by hand. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, insert a pipeline delay and identify when outputs become valid. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [TPU original paper](https://arxiv.org/abs/1704.04760). **Next / reference:** [NVIDIA GPU architecture guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 81: NPUs and interconnects**
- **Learn (core):** NPUs, NVLink, InfiniBand.
- **Build / experiment:** Compare accelerator types in a table with sources.
- **University-style independent assignment (core):** Produce a cited architecture comparison of GPU, TPU and NPU bandwidth/interconnect limits. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change deployment power budget and revise the chosen architecture. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Stanford CS336 systems unit](https://cs336.stanford.edu/). **Next / reference:** [FlashAttention paper](https://arxiv.org/abs/2205.14135).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [TPU original paper](https://arxiv.org/abs/1704.04760); [NVIDIA GPU architecture guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/).

### Block 13  -  Energy and scale · Weeks 82–85 · Stage 2

**University-style reference shelf (selected, not required in full):** [Stanford CS336](https://cs336.stanford.edu/) (training/inference cost context); [ML Energy Leaderboard methodology](https://ml.energy/) (measurement considerations); [Google ML systems resources](https://research.google/pubs/).
**Goal/checkpoint:** Joules per token measured across batch sizes and precisions. Weeks 83-84 need a GPU whose power counters you can read.

**Primary resources:** [Energy and computing paper by Horowitz](https://ieeexplore.ieee.org/document/6757323); [NVIDIA Management Library (NVML)](https://developer.nvidia.com/management-library-nvml); [ML energy measurement tool CodeCarbon](https://mlco2.github.io/codecarbon/); [Green Software Foundation](https://greensoftware.foundation/).

**Week 82: Energy per operation**
- **Learn (core):** Cost of arithmetic vs data movement.
- **Build / experiment:** Estimate energy for a matmul from published figures.
- **University-style independent assignment (core):** Estimate arithmetic and memory-access energy for one operation with sourced assumptions. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, double data movement and recompute the energy estimate. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Energy and computing paper by Horowitz](https://ieeexplore.ieee.org/document/6757323). **Next / reference:** [NVIDIA Management Library (NVML)](https://developer.nvidia.com/management-library-nvml).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. 

**Week 83: Measuring power**
- **Learn (core):** GPU power counters, idle vs load.
- **Build / experiment:** Log power draw during inference.
- **University-style independent assignment (core):** Log idle and active GPU power over a bounded inference workload on supported hardware. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, if counters are inaccessible, document inability and verify a published measurement method. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [NVIDIA Management Library (NVML)](https://developer.nvidia.com/management-library-nvml). **Next / reference:** [ML energy measurement tool CodeCarbon](https://mlco2.github.io/codecarbon/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Actual timestamped power samples if counters exist; otherwise complete a reproducible collection script and clearly label external data as modeled/referenced. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 84: Joules per token**
- **Learn (core):** Batch size and precision effects.
- **Build / experiment:** Measure joules per token across batch sizes and precisions.
- **University-style independent assignment (core):** Estimate or measure joules per token with explicit sampling interval and token count. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, change batch size and quantify uncertainty or distinguish modeled from measured values. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [ML energy measurement tool CodeCarbon](https://mlco2.github.io/codecarbon/). **Next / reference:** [Green Software Foundation](https://greensoftware.foundation/).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Calculate joules/token from actual watt-seconds and counted generated tokens, or provide an explicitly labeled estimate if hardware unavailable. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 85: Data-centre scale**
- **Learn (core):** Power, cooling, performance per watt.
- **Build / experiment:** Cost and energy model for serving at scale.
- **University-style independent assignment (core):** Build a simple total-cost/energy model for sustained inference at a named workload. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, vary utilization and cooling overhead; report sensitivity rather than one forecast. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Green Software Foundation](https://greensoftware.foundation/). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.



### Block 14  -  Inference systems · Weeks 86–91 · Stage 2

**University-style reference shelf (selected, not required in full):** [Stanford CS336](https://cs336.stanford.edu/) (inference/serving design); [vLLM documentation](https://docs.vllm.ai/) (runtime and benchmarks); [PagedAttention paper](https://arxiv.org/abs/2309.06180).
**Goal/checkpoint:** A first open-source contribution to an inference project.

**Primary resources:** [vLLM documentation](https://docs.vllm.ai/); [vLLM project source](https://github.com/vllm-project/vllm); [PagedAttention paper](https://arxiv.org/abs/2309.06180); [Hugging Face quantization guide](https://huggingface.co/docs/transformers/main/en/quantization/overview).

**Week 86: KV cache**
- **Learn (core):** Memory sizing: 2 x layers x KV heads x head dim x sequence x batch x bytes.
- **Build / experiment:** Calculate and verify KV memory for a real model.
- **University-style independent assignment (core):** Compute KV-cache memory for a chosen open model from dimensions and dtype. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, double context length and validate predicted scaling. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [vLLM documentation](https://docs.vllm.ai/). **Next / reference:** [vLLM project source](https://github.com/vllm-project/vllm).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 87: Batching and paged attention**
- **Learn (core):** Continuous batching, paged KV cache.
- **Build / experiment:** Benchmark throughput under load.
- **University-style independent assignment (core):** Benchmark request throughput and latency for two batch sizes on one serving setup. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, add one long request and inspect head-of-line blocking. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [vLLM documentation](https://docs.vllm.ai/). **Next / reference:** [vLLM project source](https://github.com/vllm-project/vllm).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Compare p50/p95 latency and throughput under two tested batch sizes on a small serving setup. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 88: Quantization**
- **Learn (core):** Accuracy vs memory vs energy.
- **Build / experiment:** Compare quantized variants.
- **University-style independent assignment (core):** Compare two supported quantizations against a fixed held-out quality and latency sample. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, test an outlier prompt and explain whether the tradeoff changes. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [PagedAttention paper](https://arxiv.org/abs/2309.06180). **Next / reference:** [Hugging Face quantization guide](https://huggingface.co/docs/transformers/main/en/quantization/overview).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** Compare one quantized and one baseline model on a small fixed evaluation set, with quality and memory notes. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 89: Speculative decoding**
- **Learn (core):** Draft and verify.
- **Build / experiment:** Measure the speedup.
- **University-style independent assignment (core):** Implement a toy draft-and-verify speculative-decoding simulator. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, lower acceptance rate and determine when the modeled speedup vanishes. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Hugging Face quantization guide](https://huggingface.co/docs/transformers/main/en/quantization/overview). **Next / reference:** [Speculative decoding paper](https://arxiv.org/abs/2211.17192).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

- **Minimum to pass (bounded core):** A deterministic acceptance/rejection toy model with a verified cost/speedup equation; production decoding is stretch. Passing still requires all four assessment gates and manual verification; optional extensions never substitute for the core.

**Week 90: Scheduling and source reading**
- **Learn (core):** The vLLM scheduler.
- **Build / experiment:** Trace a request through the code.
- **University-style independent assignment (core):** Trace a request path through a pinned inference-server source revision. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, identify where cancellation or queueing is handled and verify against code/tests. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [Speculative decoding paper](https://arxiv.org/abs/2211.17192). **Next / reference:** [GitHub contributing guide](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project).
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Week 91: Open-source contribution**
- **Learn (core):** Issues, tests, review process.
- **Build / experiment:** Submit a fix or documentation improvement.
- **University-style independent assignment (core):** Reproduce a small open-source bug or documentation gap and submit a precise test or proposed patch. Work without a walkthrough or generated core solution; write 2-4 acceptance checks first. Preserve your original Build / experiment task as the week's project milestone.
- **Unseen assessment & transfer:** On a fresh fixture, review maintainer feedback or simulate an alternative fix, recording the review status honestly. Test the result and document why it passes or fails. For 30-45 minutes, use no tutorials or AI-generated solutions; documentation may be consulted. Record separate Recall, Build, Debug and Transfer scores (0-4), assistance and reproducible evidence. For block-ending weeks, include a cumulative checkpoint within the same study slot.
- **Begin with:** [GitHub contributing guide](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project). 
- **Evidence to save:** runnable artifact (or trace/explanation for conceptual weeks), tests or experiment output, one failure or trade-off, five-minute explanation, four-dimension score. For this week, a reproducible small educational demonstration is sufficient; do not claim production completeness.

**Block-end gate (inside the final week, not an extra week):** Re-run one cumulative independent task, test a fault case, update the skills-gap register, and write a 1-page trade-off summary. Failed/unfinished stretch work is recorded and can be pursued after the 91-week core; if foundational, borrow time by reducing optional tasks in the next week.

**Further sources, as needed:** [Speculative decoding paper](https://arxiv.org/abs/2211.17192); [GitHub contributing guide](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project).


## Project specifications and acceptance contracts (part of the existing 91 weeks)

**Scope rule:** These projects are the implementation evidence for the numbered weeks above, **not additional weeks or parallel obligations**. The flagship spans Stage 1. Projects P03–P10 are lab artifacts inside the Stage 1/2 units. P02 is optional. An assignment for a given week should reference the applicable project milestone below; do not build everything at once. Treat acceptance requirements as observable behavior, not a list of buzzwords. If the core tests fail, the week stays locked until independently repaired and manually verified.

**Project-level definition of done:** (1) scoped problem and users; (2) repository and reproducible commands; (3) passing automated tests including negative/failure paths; (4) one independent unseen variation; (5) performance/cost/correctness evidence where relevant; (6) design/risks/limitations; (7) assistance disclosure; (8) manual verification. Honest simulations are legitimate learning artifacts but are never presented as real customer deployments or measured GPU experiments.

### P01. Flagship support and knowledge workflow
- **Curriculum weeks:** 1–47. **Scope:** Core.
- **Purpose and boundary:** A consent-based small-business support workflow, or an explicitly marked simulation. Gradually extend one codebase rather than starting a new app for each unit.
- **Functional requirements:** A user/admin can submit and triage cases, manage knowledge sources, search answers with citations, inspect logs, approve sensitive actions, and recover from failures. Multi-tenant isolation where relevant.
- **Implementation milestones:** W1–5 service and TLS; W6–11 schema, indexing, isolation and restore; W12–16 CI/CD and observability; W17–24 auth, integrations and reliable ingestion; W33–40 retrieval, evals, safe tools and review UI; W41–47 deployment/pilot and case study.
- **Acceptance tests and measurable checks:** Cross-tenant access denied, duplicate webhook idempotent, backups restore cleanly, prompt injection cannot perform unauthorized actions, wrong answers can be flagged, rollback rehearsal succeeds. Record p50/p95 latency, held-out answer quality, cost/request and a clearly labeled sample size.
- **Required evidence:** Demo + README, architecture and threat model, migration and restore scripts, reproducible evaluation runner, consent record or simulation flag, user-visible runbook, and before/after results with limitations.
- **Learning references:** [Source 1](https://sre.google/workbook/); [Source 2](https://owasp.org/API-Security/); [Source 3](https://www.postgresql.org/docs/).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P02. Webhook reliability and replay service
- **Curriculum weeks:** 19–24. **Scope:** Optional independent service; skip if flagship slips.
- **Purpose and boundary:** A small standalone intake and replay service rather than a commercial webhook platform.
- **Functional requirements:** Authenticated intake with signature verification, durable event storage, retries with bounded backoff, idempotency key handling, dead-letter state, operator-only replay and traceable audit events.
- **Implementation milestones:** W19 verify signatures and persist; W20 rate-limit; W21 queue, deduplicate and replay; W22–24 fault injection, observability and design review.
- **Acceptance tests and measurable checks:** Reject invalid signature, do not double-apply on duplicates, survive worker restart and replay without data loss, bound retry attempts, audit each manual replay; measure recovery time and duplicate-effect count.
- **Required evidence:** Minimal API contract, tested worker, fault-injection script, replay command, README, design trade-offs and benchmark logs.
- **Learning references:** [Source 1](https://docs.github.com/en/webhooks/using-webhooks/handling-webhook-deliveries); [Source 2](https://microservices.io/patterns/data/transactional-outbox.html).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P03. Neural network and tiny transformer laboratory
- **Curriculum weeks:** 25–32. **Scope:** Core laboratory.
- **Purpose and boundary:** Small CPU-friendly experiments to explain math and training, not a claim to build a production LLM.
- **Functional requirements:** NumPy similarity and gradients, from-scratch regression, micrograd-style autograd, small PyTorch model, tokenizer, tiny attention-based model and scoped adaptation experiment.
- **Implementation milestones:** W25–27 numerical basics; W28 autodiff; W29 PyTorch validation; W30 tokenization; W31 attention/model; W32 adaptation and limitations.
- **Acceptance tests and measurable checks:** Gradient checks against finite differences; train/validation separation; decreasing loss on controlled data; deterministic seed; inspect shape and mask failures; show ablation or comparison with a baseline.
- **Required evidence:** Notebook/code, training configuration, data provenance, plots with caveats, unit tests and plain-language explanation of backprop and attention.
- **Learning references:** [Source 1](https://karpathy.ai/zero-to-hero.html); [Source 2](https://cs229.stanford.edu/); [Source 3](https://docs.pytorch.org/).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P04. OS internals laboratory: scheduler, allocator, shell
- **Curriculum weeks:** 48–53. **Scope:** Core educational implementations.
- **Purpose and boundary:** Narrow standalone utilities or simulations, not an operating system.
- **Functional requirements:** Implement a scheduler simulation, synchronized queue, small allocator or allocator simulation, append-only crash test, namespace experiment and a toy shell or xv6 syscall exercise.
- **Implementation milestones:** W48 scheduling; W49 concurrency; W50 memory; W51 crash consistency; W52 namespaces; W53 syscalls and shell.
- **Acceptance tests and measurable checks:** Scheduler behavior checked against hand-worked cases, concurrency stress tests, allocator boundary and reuse tests, crash recovery checks, safe process spawning and signal handling. Mark platform-dependent demonstrations.
- **Required evidence:** Tests, trace logs, failure matrix, portability caveats and short comparison to actual kernel behavior.
- **Learning references:** [Source 1](https://pdos.csail.mit.edu/6.1810/); [Source 2](https://pages.cs.wisc.edu/~remzi/OSTEP/).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P05. Educational B-tree key-value store
- **Curriculum weeks:** 54–59. **Scope:** Core educational implementation.
- **Purpose and boundary:** Small persistent store to understand pages, buffer management and recovery; avoid production database claims.
- **Functional requirements:** Page layout and serialization, B-tree lookup/insert and split, cache eviction, simple iterator/filter, append-only WAL with recovery, basic benchmark.
- **Implementation milestones:** W54 pages; W55 B-tree; W56 buffer pool; W57 scans; W58 WAL/recovery; W59 tests and benchmarking.
- **Acceptance tests and measurable checks:** Property tests against an in-memory reference map; restart/persistence tests; randomized inserts; split corner cases; corruption and crash-injection tests. Compare throughput with fixed hardware and input sizes.
- **Required evidence:** File format design, correctness harness, crash-test logs, README and benchmark methodology.
- **Learning references:** [Source 1](https://15445.courses.cs.cmu.edu/); [Source 2](https://www.postgresql.org/docs/current/wal-intro.html).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P06. Replicated key-value store laboratory
- **Curriculum weeks:** 60–65. **Scope:** Core educational subset.
- **Purpose and boundary:** A bounded replication and Raft experiment; full fault-tolerant production consensus is out of scope.
- **Functional requirements:** Lamport-clock simulation, primary-backup prototype, consensus traces, leader election, constrained log replication and deterministic fault tests.
- **Implementation milestones:** W60 clocks; W61 replication; W62 Paxos trace; W63 leader election; W64 log replication; W65 failure tests.
- **Acceptance tests and measurable checks:** Verify one leader per term in tested scenarios, no committed-entry divergence under modeled failures, correct replay following restarts, and documented known deviations from full Raft. Use deterministic schedules and assertions.
- **Required evidence:** Simulation harness, invariant checks, event traces, model limitations and paper-based comparison.
- **Learning references:** [Source 1](https://pdos.csail.mit.edu/6.824/); [Source 2](https://raft.github.io/raft.pdf).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P07. Train a small language model
- **Curriculum weeks:** 66–73. **Scope:** Core scaled experiment.
- **Purpose and boundary:** A small reproducible LM training experiment at available budget; no claim of frontier-scale training.
- **Functional requirements:** Build a clean documented corpus, training loop, optimizer comparison, architecture variation, memory accounting and small training run with held-out validation.
- **Implementation milestones:** W66 optimizers; W67 scaling sample; W68 architecture; W69 data; W70 precision/memory; W71 parallelism demonstration; W72 planning; W73 train and report.
- **Acceptance tests and measurable checks:** Prevent train/validation contamination, use reproducible seeds and token counts, report loss and compute cost, compare at least one baseline, run NaN and OOM handling tests.
- **Required evidence:** Training code, config, dataset card, loss curves, compute ledger, reproducibility notes and limitations.
- **Learning references:** [Source 1](https://stanford-cs336.github.io/spring2025/); [Source 2](https://docs.pytorch.org/).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P08. GPU kernels and performance laboratory
- **Curriculum weeks:** 74–81. **Scope:** Core when GPU available; simulation is labeled.
- **Purpose and boundary:** Bounded kernels and measurements, explicitly simulated where physical profiling is inaccessible.
- **Functional requirements:** Bandwidth measurement, roofline estimate, vector add and tiled matrix multiplication, profiling, precision comparison, attention benchmark, TPU systolic-array trace and accelerator comparison.
- **Implementation milestones:** W74 memory bandwidth; W75 roofline; W76–77 kernels; W78 precision; W79 attention; W80 TPU; W81 interconnect comparison.
- **Acceptance tests and measurable checks:** Correctness within declared numerical tolerance, warmups and repetitions, hardware details, bandwidth and latency methodology, CPU/reference comparison, report speedups only against documented baselines.
- **Required evidence:** Kernel source, benchmark harness, profiler exports or simulated tags, reproducible charts and hardware limitations.
- **Learning references:** [Source 1](https://docs.nvidia.com/cuda/); [Source 2](https://arxiv.org/abs/2205.14135).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P09. Energy per token measurement
- **Curriculum weeks:** 82–85. **Scope:** Core analysis; real energy only if counters available.
- **Purpose and boundary:** Quantify, or honestly estimate, energy and serving efficiency on a repeatable workload.
- **Functional requirements:** Published energy-cost estimation, GPU idle/load power logging where available, energy integration across inference workload, batch/precision comparison and data-center model.
- **Implementation milestones:** W82 methodology; W83 power measurements; W84 joules per token; W85 data-center model.
- **Acceptance tests and measurable checks:** Subtract or separately report idle power, sample counters over run time, document counter permissions and uncertainty, compare workloads at fixed token output, never label estimates as physical measurements.
- **Required evidence:** Power logs or estimation model, units, assumptions, repeated run summary and uncertainty statement.
- **Learning references:** [Source 1](https://developer.nvidia.com/management-library-nvml); [Source 2](https://www.nvidia.com/en-us/data-center/).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### P10. Inference serving and open-source contribution
- **Curriculum weeks:** 86–91. **Scope:** Core learning; contribution submission not merge-guaranteed.
- **Purpose and boundary:** Investigate real inference bottlenecks and contribute an appropriately scoped patch, test or documentation improvement.
- **Functional requirements:** Measure KV cache, batching, quantization, speculative decoding and scheduler behavior; identify a reproducible issue and prepare a targeted upstream change.
- **Implementation milestones:** W86 KV sizing; W87 batching; W88 quantization; W89 speculative decoding; W90 source reading; W91 contribution submission.
- **Acceptance tests and measurable checks:** Benchmark p50/p95 latency and throughput under fixed workloads, verify output quality where relevant, show reproducer + regression test for code fix, follow project contribution guidelines. No invented merged-PR result.
- **Required evidence:** Benchmarks, code trace, reproducer, issue/PR link when available, review feedback and final technical case study.
- **Learning references:** [Source 1](https://docs.vllm.ai/); [Source 2](https://github.com/vllm-project/vllm/blob/main/CONTRIBUTING.md).
- **Exit condition:** Demonstrate the bounded milestone in its mapped week, pass the four gates, attach evidence and **manually verify**; otherwise keep the relevant week locked. Any project-wide completion claim must pass all core acceptance checks.

### Project test and evidence record (copy for each milestone)
```md
Project ID:
Mapped curriculum week:
Task and acceptance checks written before implementation:
Implementation commit/artifact:
Setup and one-command reproduction:
Positive-path tests and output:
Negative/failure-path tests and output:
Measured quantity, units, machine and sample size (or N/A):
Independent unseen variation + result:
Help used, including AI (or none):
Risk, known gap and limitation:
Review source (human / test oracle / reference / not externally reviewed):
Recall __/4 | Build __/4 | Debug __/4 | Transfer __/4
Manual verification: pending / confirmed at ____
Retention due on actual confirmation date +1/+4/+8/+16 weeks:
```

### Stage 1 pilot acceptance contract
- **Real pilot only with authorization:** a consenting client, documented allowed data, retention, and safe action boundaries. Otherwise label the project `SIMULATED` throughout UI, README, portfolio, and case study.
- **Before shipping:** baseline captured; eval cases separated from training/tuning; redaction performed; least-privilege permissions and human approval tested; rollback and restore tried; escalation route agreed.
- **During pilot:** record at least the actual number of cases, agent suggestion acceptance, escalation, incorrect/unsafe suggestions, latency and cost; distinguish shadow mode from autonomous action.
- **After pilot:** compare against baseline with denominators and caveats. A 4-week tiny sample supports a *descriptive case study*, not guaranteed causal business impact.


## University-inspired examination protocol  -  applied inside the 91 weeks
**Why this exists:** Public courses such as [Stanford CS144](https://web.stanford.edu/class/cs144/) combine labs, quizzes, exams and discussion; [CMU 15-445](https://15445.courses.cs.cmu.edu/spring2026/assignments.html) includes cumulative programming assignments; and [MIT 6.5840](https://pdos.csail.mit.edu/6.824/) uses readings, labs and exams. The roadmap adapts these practices, not their workload or university credentials.

- **Open-note weekly practice:** documentation, textbooks and debugging tools are allowed; cite or note the sources. Walkthroughs are used only *before* the independent attempt.
- **Closed-solution weekly check:** 30–45 minutes, from an unseen variant, no generated code or conversational AI; standard language references are allowed if logged. Grade using execution/observed behavior and a written answer key prepared beforehand, not confidence.
- **Block-end mini-exam:** use the last week's Saturday session for (i) 15 minutes cumulative concept questions, (ii) 20 minutes a fresh debugging or implementation challenge, (iii) 10 minutes reasoning about trade-offs. Replace, don't add to, the weekly exam. Record gaps.
- **External critique:** seek one human code/design review per block via colleagues, communities, open source or mentor. Not guaranteed; if unavailable, say `NOT EXTERNALLY REVIEWED`, use automatic tests and an independent reference implementation and do not call it peer-verified.
- **Paper seminar (advanced blocks):** for assigned papers, write five answers: problem, assumptions, mechanism, evidence, limitation. Attempt one measurable mini-reproduction where feasible.
- **Plagiarism and AI-use policy:** no copying solutions; do not pass off code completions as your own. AI can explain concepts after the independent attempt and critique afterwards, but it cannot author the scored solution. Capture prompts/help honestly in the evidence log.
- **Failure policy:** unsuccessful checks stay visible. Remain on the current locked week, target the failed gate with a new problem, and reassess before unlocking the next week. Defer stretch exercises before cutting essential prerequisites. The fixed 91 units are a syllabus cap, *not a guarantee that everyone will finish in exactly 91 elapsed calendar weeks*.

## Copy/paste templates  -  make assessment repeatable

### `evidence/week-NN.md`
```md
# Week NN  -  Topic
Date completed:
Status: PLANNED / ATTEMPTED / DONE / VERIFIED
Flags: REVIEW_DUE yes/no; GAP yes/no
Manual verification confirmed by learner (date/time):
Primary source and exact pages/lectures:
Prerequisite check:
Learning objective in my own words:
Assignment specification and acceptance checks:
Repository commit / reproducible command:
Tests: pass / fail with outputs:
Failure injected, root cause, verified fix:
Fresh transfer condition:
Five-minute explanation (notes or recording):
Assessment: Recall __/4, Build __/4, Debug __/4, Transfer __/4
Help used: independent / docs-only / assisted (specify)
External review: reviewer + notes / NOT EXTERNALLY REVIEWED
Known limitations and next action:
Reviews scheduled: +1w __ ; +4w __ ; +8w __ ; +16w __
Career evidence: link/metric or none
```

### `assessments/block-NN.md`
```md
# Block NN cumulative assessment
Timebox: 45 minutes, replacing final weekly test
Questions/fixture selected in advance (not seen during learning):
Concept answers and reference key:
Challenge input, expected behavior, reproducible command:
Observed results and tests:
Scores (0-4 each), pass only when each >=3:
Unresolved prerequisite gaps:
External feedback status:
Decision: ELIGIBLE / GAP / PARTIAL; learner manual confirmation required for VERIFIED
Next review date:
```

### `docs/papers/paper-name.md`
```md
Paper and original URL:
Question addressed:
Important assumptions:
Main mechanism / diagram:
Strongest experimental result (with sample, hardware and caveat):
One limitation or counterexample:
My small replication/derivation (or why not feasible):
```

## At-a-glance 91-week resource routing
| Block | Weeks | University anchor | Practical companion |
|---|---|---|---|
| 1 Linux/networking | 1–5 | MIT Missing Semester; Stanford CS144 (selected networking tasks) | OSTEP, man-pages, Beej |
| 2 PostgreSQL | 6–11 | CMU 15-445 SQL/index/transaction problems | PostgreSQL official docs |
| 3 DevOps/testing | 12–16 | MIT 6.1810 testing mindset | Docker/GitHub Actions/OpenTelemetry docs, Google SRE |
| 4 Backend/design | 17–24 | Stanford CS144 selective systems tasks | OWASP and framework reference docs |
| 5 AI foundations | 25–32 | Stanford CS229, CS336 selective exercises | Karpathy Zero to Hero, PyTorch |
| 6 Agents | 33–40 | Stanford CS336 topics; Full Stack Deep Learning | Provider/MCP docs, OWASP LLM |
| 7 FDE launch | 41–47 | Stanford d.school discovery practices | Google SRE Workbook |
| 8 OS internals | 48–53 | MIT 6.1810 xv6 labs | OSTEP |
| 9 DB internals | 54–59 | CMU 15-445 project specifications | PostgreSQL source/docs |
| 10 Distributed systems | 60–65 | MIT 6.5840 papers and Raft exercises | Raft paper, DDIA |
| 11 Deep learning | 66–73 | Stanford CS336, CS224n | PyTorch docs |
| 12 Accelerators | 74–81 | Stanford CS336 model-systems topics | CUDA documentation, FlashAttention |
| 13 Energy | 82–85 | Stanford CS336 cost context | Measurement papers and power tools |
| 14 Inference | 86–91 | Stanford CS336 serving topics | vLLM source, PagedAttention |

**Course access caveat:** Public university pages may show only the syllabus or partial assignments; automated graders, videos, discussion boards and solutions may require enrollment. The linked materials are reading/assignment references, not formal enrollment or a claim that these exercises carry academic credit.

## Milestones and acceptance evidence
| Week | Minimum defensible evidence |
|---:|---|
| 5 | Server deployed with TLS; you can debug from logs |
| 11 | 1M-row schema, a race condition fixed, a restore drill done, RLS working |
| 16 | Push-to-deploy with monitoring |
| 24 | Reliable ingestion pipeline, webhook service, defended design doc. Python checkpoint passed and first mock interview within Week 24 |
| 32 | You can explain backprop and attention; you built a tiny transformer |
| 40 | Working agent with eval numbers. Outreach began Week 36; first role-matched applications by Week 40 if ready |
| 46 | Four-week pilot complete, case study published |
| 47 | Interview-ready |
| 53 / 59 / 65 | Allocator and toy shell / B-tree store / replicated store |
| 73 / 81 / 85 | Small LM trained / roofline and CUDA kernels / joules per token measured |
| 91 | First open-source contribution to an inference project |

**Scope clarification:** Some milestone names in the original v2 sound stronger than one week of effort supports. For example, “replicated key-value store” means an educational demonstration with a documented fault model and automated invariants, *not* a hardened production database; “open-source contribution” can mean a well-scoped, reproducible PR submitted for review, not guaranteed merger.

## Pilot execution and career cadence
- **Weeks 1–2:** discovery with 2–3 prospects or openly state `SIMULATED`; baseline and frozen initial cases. Do not build a year-long dependency on a business that has not committed.
- **Weeks 17–24:** validate the domain requirements again; use real integration credentials only with permission. Prepare a recovery and deletion plan.
- **Weeks 33–40:** offline evals, adversarial tests and shadow mode first; outreach and interviews may begin as soon as skills meet actual posting requirements.
- **Weeks 41–46:** staged release and up to four weeks of limited pilot, where consent and usage exist; otherwise label a simulated case study. Report small-sample uncertainty.
- **Week 47:** mock interviews and case-study release. Stage 1 should provide job-application evidence; stage 2 is optional specialization for roles that require it.
- **Weeks 48–91:** publish only real experiments; choose a systems/ML-infrastructure specialty as new evidence emerges, without padding the calendar with a second full-time curriculum.

## Resource use: how not to drown in courses
Pick **one anchor resource per week**, then use official documentation when implementation demands it. Do **not** attempt to complete MIT 6.5840, CMU 15-445, Stanford CS336, all of OSTEP, and all assigned papers simultaneously. University assignments can far exceed the 13-hour budget. For research papers, focus on the claims, assumptions, one diagram/derivation, and a small reproduction. Some linked course homepages change annually; select the newest publicly accessible materials or retain an archived edition where labs are stable.

## Resource verification and scope notes (13 October 2026)
- Cross-checked representative live primary sources including the [CMU Database Group course directory](https://db.cs.cmu.edu/courses/), [MIT 6.5840 course](https://pdos.lcs.mit.edu/6.824/), [Stanford CS336](https://cs336.stanford.edu/), and the [NVIDIA CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/). These confirm topic fit, but not the exact assignment workload for this self-study schedule.
- Links throughout are official documentation, course project homepages, or original papers wherever practical. A linked resource may update or reorganize after this version; recheck its current section before studying.
- Where the original roadmap promises a high-complexity outcome after one week (CUDA kernels, Raft, full LM training, power metrics), the goal is a **limited validated educational exercise**; performance numbers and hardware measurements must be real, with environment and methodology recorded.
- This roadmap is an engineering curriculum; a serious UX/UI career path would require a separate user research, interaction design, accessibility, prototyping, and usability-testing syllabus.

**Additional primary-source verification:** [Stanford CS144 Fall 2026 course page](https://web.stanford.edu/class/cs144/) lists checkpoints, quizzes and exams; [CMU 15-445 Spring 2026 assignments](https://15445.courses.cs.cmu.edu/spring2026/assignments.html) lists homework and cumulative systems projects; [MIT 6.5840 Spring 2026](https://pdos.lcs.mit.edu/6.824/index.html) specifies reading, labs and exams; [Stanford CS336 Spring 2026](https://cs336.stanford.edu/) describes implementation-focused model training and limits AI solution use. These justify the learning design, not equivalence to taking those university courses.
