# Learning OS — Progress Log

## Checkpoint

- **Branch:** `main`
- **Base:** empty new-project repo; rebuild under plan contract
- **Current phase:** Phases 0–7 DONE; Phase 8 **BLOCKED** (Cloudflare credentials)
- **Next executable step:** Phase 8 requires Cloudflare account, real D1/R2 IDs, Google OAuth credentials, secrets, and explicit deploy authorization

## Context

- Modular rebuild: dedicated TanStack routes, feature modules, Zod contracts, scoped Query keys
- No central view switch / all-data getState / generic `act` dispatcher (`docs/ARCHITECTURE_AUDIT.md`)
- Curriculum from `reference/roadmap.md` via `pnpm content:build` (91/14/10/11 + 16 MTP)
- Visual authority `reference/index7.html`; harness under `tests/visual/`
- Cloudflare remote credentials: **absent** → Phase 8 **BLOCKED**
- Learner progress not fabricated; seed is owner + empty settings only

## Phase status

| Phase | Status | Notes |
| --- | --- | --- |
| 0 | DONE | Sources checksum-verified; docs; matrix defined |
| 1 | DONE | Vite/Worker, content pipeline, shell, lazy routes |
| 2 | DONE | Consolidated D1 schema (`0000_init.sql`), domain rules, Google login state and session storage |
| 3 | DONE | Owner-only Google sign-in + HttpOnly sessions; e2e login smoke |
| 4 | DONE | Today / Roadmap / Week tabs + APIs |
| 5 | DONE | Lexical rich/plain, Library, Projects, Studio |
| 6 | DONE | Progress, Settings, demo isolation, export |
| 7 | DONE | Build/typecheck/unit/integration/e2e/visual/architecture all pass cleanly |
| 8 | BLOCKED | Missing CF account, bindings, Google OAuth setup, deploy auth |

## Check results (latest)

| Check | Command | Result |
| --- | --- | --- |
| Content | `pnpm content:check` | PASS |
| Typecheck | `pnpm typecheck` | PASS |
| Unit | `pnpm test:unit` | PASS (9 suites, 48 tests) |
| Integration | `pnpm test:integration` | PASS (4 suites, 9 tests running on isolated D1) |
| E2E | `pnpm test:e2e` | PASS (7 browser tests: auth smoke, studio media, UI controls) |
| Visual | `pnpm test:visual` | PASS (matrix harness + manifest; PNGs ignored) |
| Architecture | `pnpm audit:architecture` | PASS |
| Build | `pnpm build` | PASS; no Tailwind/Lucide CDN in dist |
| Deploy | — | **BLOCKED** (no remote Cloudflare credentials) |

## Visual inspection notes

Inspected app vs reference at 1440 light for login, today, roadmap, week-9:

- Shell: sprout + Learning OS serif, 240px sidebar, six nav destinations, Ctrl K, VM profile — match
- Login: split panel, owner-only Google sign-in (PC-1) — match intent
- Today: greeting, current-week card, reviews/gaps/capture/project, 0/91 bar — match patterns; fresh learner vs reference mid-demo is expected content delta
- Roadmap: heat grid, stages/blocks, locking copy — match
- Week: tabs, lock banner, rhythm, sticky bar — match; fixed parent-route redirect loop and locked CTA target week

## Architectural decisions

See `docs/DECISIONS.md`. Week layout route must not redirect (child tab beforeLoad loop); index route redirects `/weeks/:n` → overview.

## Blockers

- Phase 8: Cloudflare account, real D1 database id, R2 bucket, Google OAuth web client, production secrets (`GOOGLE_CLIENT_SECRET`, `SESSION_PEPPER`), `OWNER_EMAIL`, target Worker/domain, explicit deployment authorization for this task

## Dev server

Local: [Learning OS](http://127.0.0.1:43123) (`pnpm dev`, port 43123)

## Completion log

| When | Event |
| --- | --- |
| 2026-10-14 | Phase 0 sources + docs |
| 2026-10-14 | Phases 1–6 modular app |
| 2026-10-14 | Phase 7 polish; week redirect fix |
| 2026-10-16 | Replaced OTP with owner-only Google OAuth (PKCE, ID token validation, owner linking) |
| 2026-10-16 | Merged all incremental migrations into a single `0000_init.sql` baseline |
| 2026-10-16 | Cleaned up all baseline PNG images (~6.4 MB) and added `*.png` to visual `.gitignore` |
| 2026-10-16 | Phase 8 remains BLOCKED (no Cloudflare credentials) |
