# Curriculum Coverage Matrix

Authority: `reference/roadmap.md` (SHA-256 `91f6581cfe57d985881617bd7cba43da8bd8d8dee852e909d4b9d789fcf9e595`).

Generated content: `content/roadmap.json` via `pnpm content:build`. Drift check: `pnpm content:check`.

## Coverage summary

| Section | Schema | Screens | Checks |
| --- | --- | --- | --- |
| Meta / version / hours | `meta` | Settings variance, Progress totals | content:check |
| Stages 1–2 (47/48) | `stages` | Roadmap stage accordions | content:check |
| 14 blocks | `blocks[]` | Roadmap, Week Overview | content:check |
| 91 weeks | `weeks[]` | Week tabs, Roadmap heat | content:check + e2e |
| 16 bounded-core MTP | `weeks[].minimumToPass` | Week Build/Verify | content:check |
| P01–P10 | `projects[]` | Projects | content:check |
| 11 milestone rows | `milestones[]` | Progress, Roadmap | content:check |
| Assessment gates policy | `policies.assessment` | Week Verify | domain tests |
| Locking / evidence policy | `policies.locking` | Settings, locked weeks | domain tests |
| Prerequisites (diagnostic, Python, systems, GPU, consent) | `policies.prerequisites` | Overview / Settings / Pilot | domain tests |
| Evidence template | `policies.templates.evidence` | Library template action | e2e |
| Block assessment template | `policies.templates.blockAssessment` | Library template action | e2e |
| Paper note template | `policies.templates.paper` | Library template action | e2e |
| Project record template | `policies.templates.project` | Projects / Library | e2e |
| Examination protocol | `policies.examination` | Library read-only | coverage |
| Pilot / career cadence | `policies.pilot`, `policies.career` | Settings pilot | domain/e2e |
| Resource routing table | `resourceRouting` | Roadmap / Library | content:check |
| Full sanitized roadmap | `content/roadmap.full.md` | Library / Roadmap drawer | e2e |

## Bounded-core weeks

26, 28, 31, 63, 64, 65, 73, 76, 77, 78, 79, 83, 84, 87, 88, 89 — each must appear in `weeks[].minimumToPass` and surface in Week Build + Verify eligibility.

## App vs learner work

Importing this curriculum does **not** execute P01–P10, rent GPUs, or mark weeks verified. Learner progress tables start empty.
