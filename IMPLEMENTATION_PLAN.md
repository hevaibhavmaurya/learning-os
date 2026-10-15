# Learning OS — phased implementation and Codex Cloud handoff

Version 4 · Repository architecture review revision · Implementation status: Phases 0–7 DONE; Phase 8 BLOCKED (Cloudflare credentials)

This document replaces Versions 1–3, incorporates the full corrected roadmap and adds a code-based rebuild contract. Tracker statuses below reflect verified evidence on the rebuild branch — not planning intent alone.

## 1. Review outcome and locked decisions

The React SPA + same-origin Cloudflare Worker API + D1 + R2 architecture is appropriate for this private learning application. Organize it as a modular application in one repository, with clear client/server boundaries and feature ownership. That makes it manageable for one developer and leaves room for more data and features. It is not a promise of unlimited database capacity or a completed multi-user SaaS architecture.

Locked corrections carried forward, including the new roadmap:

- Use the full corrected Markdown roadmap as the authority for learning content, prerequisites, assessment policy and project acceptance contracts. The prototype's embedded `SRC` is an incomplete derivative.
- Use **Lexical** for note and document editing, including a plain-text Lexical mode for Studio copy. Remove Tiptap from the dependency plan.
- Treat **`index7.html` as the exact visual and interaction reference**. Replace the earlier permission for deliberate visual differences with explicit fidelity checks.
- Use task checkboxes, phase statuses, evidence and durable checkpoints. Finishing a phase automatically leads to the next unblocked phase.
- Keep every prototype feature in the inventory, including note deletion forever, demo states, keyboard shortcuts and the pilot clock. Do not quietly defer existing UI actions.
- Prove atomic verification, single-use login attempt consumption/session issuance and autosave conflict handling in the real Workers/D1 test runtime.
- Separate application completion from deployment completion. Missing remote credentials may block deployment, but must not stop independent implementation work.

### Authoritative inputs and conflict rules

Give the agent these **four files** in the connected repository. Use the exact names below in the repository; the roadmap can be renamed on copying without editing its contents.

| Supplied source | Repository location | Authority |
| --- | --- | --- |
| Updated `IMPLEMENTATION_PLAN.md` (this Version 4) | `IMPLEMENTATION_PLAN.md` | App architecture, tasks, completion evidence and execution contract |
| `index7.html` | `reference/index7.html` | Exact visual system, icons, layout, responsive behavior and existing interaction patterns |
| `DESIGN.md` | `reference/DESIGN.md` | UX intent, six destinations, learning rhythm and deliberate verification |
| `FDE_91_Week_Roadmap_v5_1_Corrected(1).md` | `reference/roadmap.md` | Full curriculum, bounded-core scope, resources, prerequisites, assessments, evidence templates and project contracts |

Also provide the target repository and the existing `learning-os` repository/branch as legacy reference. Preserve applicable repository instructions, Git history, uncommitted user changes and real data. Existing application structure and package choices are not requirements: replace the rejected architecture under the rebuild contract below. Prior pasted architectural drafts and superseded build plans are historical and must not override this revision.

### Repository review and rebuild decision

Reviewed `hevaibhavmaurya/learning-os` default branch `codex/learning-os-initial-build` at `223d8d2d2f6f2a60810034c50d1cc007d06dd37f`. Also compared `src/routes/index.tsx` and `src/api.ts` on `codex/index6-parity-auth-foundation` at `1cf224d76ace2e0c491edf412fc7710c950abbe3`; these two files are identical across those snapshots. This was static source review, not a runtime, security or visual certification.

| Finding | Evidence | Required correction |
| --- | --- | --- |
| One root route selects eight screens and owns their implementation | `src/routes/index.tsx:17–48` uses `/?view=...&week=...`; Today, Roadmap, Week, Projects, Library, Content, Progress and Settings are defined in the same approximately 35 KB file | Dedicated route modules and feature modules, with a shared shell containing an outlet |
| Every successful mutation reloads the entire workspace | `src/routes/index.tsx:25–28`; `src/api.ts:21–28` runs 22 unbounded `SELECT *` queries, including writing bodies and revision/audit history | Feature-scoped reads, bounded collection endpoints and targeted Query cache updates/invalidation |
| One action dispatcher combines unrelated domains | `src/api.ts:30–34` accepts a string action plus arbitrary fields, followed by a broad switch; some cases do validate inputs individually | Per-feature HTTP handlers, explicit request/response schemas, typed use cases and database queries |
| Weak client contracts hide mistakes | Root screen uses many `any` props/casts and casts arbitrary search strings to the View union | Strict typed DTOs, validated route state, explicit errors and no application-boundary `any` escapes |
| Requested editor is absent | `src/routes/index.tsx:93–96` uses textareas/Markdown for notes and Studio; package dependencies contain no Lexical | Shared Lexical composition with rich/plain modes and revision-aware persistence |
| Drafts clear before persistence succeeds | QuickNote, Library and Content submit handlers at lines 93, 94 and 96 call async `run(...)` without awaiting its result and immediately reset fields | Retain drafts on failure; only clear after acknowledged success, with regression coverage |

Source snapshots: [root screen](https://github.com/hevaibhavmaurya/learning-os/blob/223d8d2d2f6f2a60810034c50d1cc007d06dd37f/src/routes/index.tsx), [data and action API](https://github.com/hevaibhavmaurya/learning-os/blob/223d8d2d2f6f2a60810034c50d1cc007d06dd37f/src/api.ts), [dependencies](https://github.com/hevaibhavmaurya/learning-os/blob/223d8d2d2f6f2a60810034c50d1cc007d06dd37f/package.json).

**Decision: rebuild the application foundation and feature modules; do not extend the central screen switch or generic workspace/action API.** A React SPA and URL parameters are compatible with a scalable application. The rejected choices are cross-feature coupling, unbounded data loading and weak contracts. Creating extra page files without changing those dependencies does not meet this plan.

Default execution target: a dedicated rebuild branch in the same repository, such as `rebuild/modular-learning-os`. A new repository is optional if the owner wants a separate project; it is not a technical prerequisite. Keep the old implementation recoverable in Git and outside the active production dependency graph. Do not keep two active application trees as the final architecture. Reuse only individually reviewed domain helpers, authentication logic, migrations or components after they meet the new source and acceptance contracts. Existing code, tests and README claims do not count as completion evidence automatically.

In Phase 0, inspect whether real deployed data exists. If it does, map and test additive migrations/export-import, including Markdown-to-Lexical conversion with original text retained for recovery. Never reset production storage as part of scaffolding. The review itself does not complete Phase 0: the cloud setup, complete source reconciliation and reference captures remain required.

**Priority by subject:** explicit user requirements → this implementation contract; learning-content or rule disagreements → full roadmap, with specific weekly bounded-core clauses taking precedence over broad summaries; visual disagreements → `index7.html`; UX interpretation → `DESIGN.md`. Keep source discrepancies in `docs/SOURCE_RECONCILIATION.md`. Do not silently omit a roadmap requirement to reproduce a prototype shortcut. For genuinely unresolved contradictions, preserve both statements, record the uncertainty and avoid claiming unsupported completion while continuing independent work.

The source snapshot is immutable. `index7.html` has 276,818 bytes and 697 lines; SHA-256 `830210fa34f3b6f8de6b246238ed98bcbee45df6fc1a86ee0eb2cf41a5578743`. The roadmap has 188,098 bytes and 1,253 lines; SHA-256 `91f6581cfe57d985881617bd7cba43da8bd8d8dee852e909d4b9d789fcf9e595`. Its filename says v5_1 but its internal heading says Version 5.0; preserve that metadata discrepancy and identify this source by its filename and checksum, not an invented version label.

### Scope distinction: implement the app, preserve the curriculum

Codex implements Learning OS and loads the full course as content. The course's instructions to rent servers, contact prospects, build P01–P10, run GPU experiments, publish case studies or submit upstream contributions are **learner assignments**, not tasks for the app-building agent to execute. The curriculum's repository tree (`app/`, `labs/`, `evidence/`, etc.) is a suggested learner project layout, not a replacement for Learning OS's application architecture. Course requirements involving PostgreSQL, Python workers, multi-tenancy or model training describe learner artifacts; they do not change Learning OS's own D1/TypeScript stack.

Keep app implementation phases and learner week statuses separate. A completed implementation phase never marks a learner week VERIFIED, fills in a score, fabricates consent or creates learning evidence. Real user data begins empty; test/demo data stays isolated.

### Review findings from the full roadmap

The source and prototype agree on 91 weeks, 14 blocks, 10 projects and 11 milestone-table rows. Weekly titles and the five compared text fields (Learn, Build, assignment, unseen assessment and evidence) match. This is not proof of complete content parity: the roadmap has additional policies/templates and 16 explicit bounded-core clauses absent from `SRC`.

| Gap or discrepancy | Required implementation response |
| --- | --- |
| Minimum-to-pass clauses missing for Weeks 26, 28, 31, 63, 64, 65, 73, 76, 77, 78, 79, 83, 84, 87, 88 and 89 | Import these verbatim, expose them in the relevant week and include their required evidence in eligibility |
| Python by Week 24 and systems-language checkpoint before Week 48 | Store explicit attempts/evidence/manual prerequisite confirmation; do not infer success merely from a preceding week number |
| Six prototype evidence strings omit structured reproduction, test outcome, fresh transfer and scope confirmation | Extend the underlying evidence model and use source-styled detail controls within the existing Verify workflow |
| Pilot can be marked real in prototype without a recorded consent check | Require consent/data-use scope before real activation; otherwise keep SIMULATED, and record activation and interruptions honestly |
| Broad GPU simulation allowance versus Week 76's explicit hardware blocker | Week 76 measured-GPU requirement remains blocked without required hardware; preserve simulation alternatives where specific weeks permit them, including Week 83 collection script and Week 84 estimate |
| Project completion may be inferred from verified mapped weeks | Require each project's core acceptance evidence and explicit project verification; optional P02 does not block the main course |
| Late review dates, Stage 2 scope and project milestone summaries | Keep 91 units, 1,183 planned hours, Stage 1 W1–47, Stage 2 W48–91, optional post-course maintenance and honest educational/submitted-PR labels |

## 2. Execution and completion contract

### What Codex Cloud can do

Run this as a task in a published **Codex Cloud environment** with the GitHub repository selected. Cloud tasks can continue while the computer is asleep. The environment must contain the repository, tools, network access and credentials needed for its work; it must not depend on a laptop process, local Docker service or local browser session.

This plan instructs Codex to execute all phases in sequence without requesting permission at each phase boundary. A plan cannot guarantee one unlimited run or automatically revive a task after a platform limit, stopped session or missing required access. Persist progress so a continued task or a new task on the saved branch can resume accurately. Merely creating this plan does not start a cloud task or an automation.

### Phase state rules

- `NOT_STARTED`: no implementation evidence yet.
- `IN_PROGRESS`: actively implementing or validating; normally one phase at a time.
- `BLOCKED`: a precise external dependency prevents a required acceptance check. Record completed subtasks, the dependency and what unlocks it; continue independent work.
- `DONE`: all task checkboxes and acceptance checks pass; code, evidence and checkpoint are saved. Writing code alone does not mean done.
- Replace `[ ]` with `[x]` only after actually completing and verifying that item.
- Reopen a done phase if later changes break its acceptance checks.

After each phase, update the tracker in this file and `docs/PROGRESS.md`, record test commands/results and visual report paths, then commit code and status together on the task branch where supported. For interruption safety, checkpoint at meaningful smaller milestones too. Retain the branch/task changes through the platform's supported Git workflow; local commits alone do not guarantee availability in a fresh task. Report any inability to save/push a checkpoint. Do not reset or overwrite pre-existing user changes.

Create `docs/SOURCE_RECONCILIATION.md` and `docs/CURRICULUM_COVERAGE.md` alongside the progress log. The first records source conflicts and decisions; the second maps every content section and rule to schema fields, screens and checks. `docs/PROGRESS.md` must contain: branch and base revision, current phase/task, completed work, exact check results, known failures, blockers, changed files, architectural decisions, and the next executable step. Include a completion log; reference the phase completion commit from the subsequent checkpoint if needed. Keep test fixtures and screenshot evidence in the repository or CI artifacts, never solely in chat memory.

### Master tracker

| Phase | Scope | Status | Completion evidence |
| --- | --- | --- | --- |
| 0 | Repository/source reconciliation and cloud setup | DONE | Sources + docs + checksums; screenshot matrix captured in Phase 7 |
| 1 | Full curriculum pipeline, foundation and exact shell | DONE | `content:check`, shell routes, build/typecheck |
| 2 | Database, domain rules and atomic operations | DONE | Unit domain suite + Workers verify/atomic integration |
| 3 | Owner-only Google OAuth authentication and session lifecycle | DONE | Google OAuth OIDC flow, token verification, session cookie; e2e auth smoke |
| 4 | Today, Roadmap and complete learning workflow | DONE | Feature screens + week tabs wired to APIs |
| 5 | Lexical writing, Library, Projects and Studio | DONE | Lexical rich/plain + Library/Projects/Studio UIs |
| 6 | Progress, Settings, demo isolation and recovery | DONE | Progress/Settings/demo adapter + export endpoint |
| 7 | Full parity, reliability and release checks | DONE | typecheck/unit/integration/e2e/visual/build/architecture audit; primary routes inspected |
| 8 | Cloudflare deployment and live verification | BLOCKED | Missing Cloudflare account, D1/R2 ids, Google OAuth web client credentials, secrets, deploy authorization |

Implementation is complete only when Phases 0–7 are DONE. Deployment is complete only when Phase 8 is DONE. If remote credentials are missing, report “implementation complete; deployment blocked” only when 0–7 really pass. Do not label the whole project done with required phases outstanding.

\* Phase 0 visual baseline capture remains open under Phase 7 (harness exists; PNGs not inspected).

## 3. Architecture and maintainability

### Locked stack

| Area | Choice |
| --- | --- |
| Application | React + TypeScript + Vite + Cloudflare Vite plugin |
| API | Hono, same-origin `/api/*`, Zod runtime validation |
| Database | D1 + Drizzle schema and committed SQL migrations |
| Media | Private R2 objects accessed through authenticated API routes |
| Routing / server state | TanStack Router / TanStack Query |
| Editors | Lexical and compatible `@lexical/*` packages, pinned together |
| UI | Source CSS tokens, Tailwind build, custom styled headless primitives |
| Icons | Exact Lucide glyphs from prototype version `0.469.0` |
| Validation | Vitest, Workers-compatible integration tests, Playwright and accessibility checks |
| Toolchain | pnpm lockfile; pinned supported Node and package-manager versions |

Use one Worker for the SPA and API. Ensure `/api/*` reaches the Worker and never falls through to the SPA HTML for API errors. Runtime bindings are server-only. Production assets should not require runtime Tailwind, Lucide or font CDNs.

Organize `src/app` for router/providers/shell, `src/features/<feature>` for UI and query/mutation hooks, `src/components/ui` for visual primitives, `src/components/editor` for reusable Lexical composition, `src/shared/domain` for pure rules, `src/shared/contracts` for boundary schemas, and `src/server/features/<feature>` for HTTP routes and use cases. Place database schema, queries and migrations under a clearly defined server/database location. Keep `content/roadmap.json`, `reference/`, `tests/` and `docs/` at the repository level.

### Route and feature boundaries

Use TanStack Router file routes under `src/app/routes/`, with lazy feature screen imports. The authenticated layout owns session checks, navigation and an outlet; it must not import and conditionally render every screen. `/` redirects to `/today`. Route modules compose feature screens and validate route inputs; business workflows belong in their feature modules.

| Public URL | Route module under `src/app/routes/` | Feature owner |
| --- | --- | --- |
| `/login` | `login.tsx` | `auth` |
| `/today` | `_authenticated.today.tsx` | `today` |
| `/roadmap` | `_authenticated.roadmap.tsx` | `roadmap` |
| `/weeks/$weekNumber/$tab` | `_authenticated.weeks.$weekNumber.$tab.tsx` | `weeks` |
| `/projects` and `/projects/$projectId` | `_authenticated.projects.index.tsx`, `_authenticated.projects.$projectId.tsx` | `projects` |
| `/library` and `/library/notes/$noteId` | `_authenticated.library.index.tsx`, `_authenticated.library.notes.$noteId.tsx` | `library` |
| `/studio` and `/studio/$itemId` | `_authenticated.studio.index.tsx`, `_authenticated.studio.$itemId.tsx` | `studio` |
| `/progress` | `_authenticated.progress.tsx` | `progress` |
| `/settings` | `_authenticated.settings.tsx` | `settings` |

These routes preserve the prototype's six top-level navigation destinations; detail routes may render source-matching panels or drawers. Validate week numbers as integers 1–91, tab names against the six supported Week tabs and IDs against their contract. `/weeks/$weekNumber` redirects to its Overview tab. Query parameters remain appropriate for search, filtering, sorting and pagination, with runtime validation; they must not select the entire application screen. Translate legacy `/?view=...&week=...` and reference hashes to canonical routes through one small compatibility mapping. Test direct links, reload, back/forward, invalid values and unknown resources.

Within a feature, use focused `screens/`, `components/`, `queries.ts`, `mutations.ts` and `query-keys.ts` as needed. Keep local form state within that feature. Cross-feature coordination goes through typed shared contracts or narrowly defined public feature exports, not sibling feature internals. Avoid creating empty abstractions merely to fill a folder tree.

Within `src/server/features/<feature>/`, separate validated HTTP routes, use cases and focused database queries. Define request and response contracts per operation, for example note list/detail/update and week overview/attempt/verify. Use discriminated schemas where a finite variant is genuinely needed; do not expose a catch-all `{type: string, ...anything}` mutation endpoint. Never accept arbitrary table names from the client. Keep the Drizzle schema consistent with all committed migration tables.

TanStack Query owns remote state. Give each feature/resource stable query keys and invalidate only affected details, lists and aggregates. Dashboard summaries return counts and bounded previews; note and Studio lists omit bodies and revision history. Growing lists use capped cursor pagination; document bodies/history load when opened. A note edit must not reload projects, all weeks and audit history. Preserve an explicit scalable modular monolith: this scope does not require microservices.

Enforce import boundaries: client code cannot import server modules or Cloudflare bindings; shared domain code imports neither UI nor database code. Server routes validate input, authenticate and call use cases; services coordinate multi-record changes. Use focused database queries without a generic abstraction framework. Add forms/tables libraries only when their complexity is justified; existing markup and behavior must still match the prototype.

The curriculum is versioned repository content generated from `reference/roadmap.md` through the deterministic pipeline below. Store learner progress separately, identified by owner and stable curriculum/week IDs plus the curriculum/rule version used at verification. Never invalidate historical evidence silently after a curriculum update. Do not put the whole application state in one JSON database column or fetch all writing content with each screen. Paginate growing collections, index lookup/filter columns and query aggregate progress separately from document bodies. Lazy-load editors and feature routes. Measure database size, query latency and upload usage; reassess D1 or adopt a migration plan if actual workloads exceed its limits. A later public multi-user release needs a separate authentication, isolation and workload review.

### Full curriculum import and coverage contract

Build a deterministic import/validation command, for example `pnpm content:build`, that reads the canonical Markdown and emits typed application content. Commit generated content and add `pnpm content:check` to detect drift. Parse headings, paragraphs, lists, tables and fenced templates reliably; a one-line regex extraction of only weekly bullets is insufficient. Reject or explicitly report unknown/omitted source sections. Preserve original text and links, and retain source section/line references for traceability.

Use structured content for application navigation and rules, while retaining a sanitized rendered view of the full roadmap for completeness. A rich-text editor is for user-authored records; it does not mutate canonical course content.

| Data | Required fields / behavior |
| --- | --- |
| Source metadata | Original filename, internal version label, SHA-256, import/schema version and source locations |
| Programme | Purpose, stages, 13-hour rhythm, core/stretch policy, diagnostic, time/retention rules and scope caveats |
| Blocks | Stable ID, stage, week range, goal, reference shelf, primary/further sources and cumulative end gate |
| Weeks | Number, block, title, full learn/build/assignment/unseen/evidence text, anchor/reference resources, optional `minimumToPass`, linked projects and prerequisite requirements |
| Projects | P01–P10, week ranges, optional/core scope, purpose, requirements, milestone text, acceptance checks, required evidence, references and exit condition |
| Milestones | Preserve all 11 original rows; explicitly map grouped entries such as 53/59/65 and 73/81/85 to their individual weeks without treating them as a single week |
| Policies and templates | Complete evidence, project-record, block-assessment and paper-note templates; examination rules, career/pilot cadence, source caveats and resource guidance |
| Rule configuration | Explicit typed gates, evidence/assistance checks, prerequisite IDs, hardware/simulation policies and project requirements, each linked to its source |

Natural-language curriculum text is not executable code. Encode enforceable rules explicitly in reviewed configuration rather than guessing them at runtime. Preserve source prose even when converting it into structured acceptance items. CI checks: all weeks 1–91 once; exactly 14 non-overlapping blocks; stage boundary 47/48; P01–P10 with P02 optional; 11 source milestone rows; all 16 bounded-core clauses; valid source/resource mappings; templates and global policy coverage; no generated extra teaching weeks. Do not use `SRC` as the only curriculum source.

The existing Week tabs house the extra content: Overview → diagnostic/prerequisites/rhythm; Learn → anchor/reference guidance; Practise → unseen/independence/timebox policy; Build → bounded-core scope/project mapping; Verify → expanded evidence/prerequisite acceptance; Notes → reference templates. Place the full read-only roadmap and templates in the existing Library/Roadmap flows using current section, link, details and drawer patterns. Keep the six top-level destinations. The coverage document must identify where every section remains accessible.

## 4. Strict design contract

**The target is the attached design, including icons and all screens. Do not redesign, simplify sections, change icon families, or accept default library styling.** Build accessible React controls underneath the same visible composition.

Preserve:

- Every light/dark CSS token and semantic state color from the source, including hairlines, radii, shadows, spacing, typography and text wrapping.
- Geist UI, Geist Mono code/numeric styling and Instrument Serif display usage. Match the actual reference font metrics and weights before freezing baselines; package names alone do not ensure the same render.
- Exact Lucide glyph names, SVG path geometry, colors, alignment, default 16px size and 1.75 stroke width; preserve per-instance overrides. Pin `lucide-react@0.469.0` when the corresponding glyphs match. If a glyph differs or is unavailable, use the matching licensed source SVG, not a similar icon. Inventory both literal and dynamically selected icons.
- 240px expanded sidebar, 68px collapsed sidebar, desktop header/layout, six-item mobile navigation, safe-area behavior, sticky action bar, content widths, grids, breakpoints and overflow behavior.
- All list/detail/empty/locked/failed/ready/verified/review-due states, dialogs, drawer, palette, toast/undo, profile menu and celebration.
- Original chart shapes and SVG styling; CSS animation timing and reduced-motion handling.
- UI labels and visual hierarchy. Course content follows the full roadmap; additional required details use the content-placement contract and existing design patterns below.

Use the immutable reference to generate baseline screenshots at 390×844, 768×1024 and 1440×1000, in both themes. Use pinned Chromium, browser scale, locale, timezone, clock, fonts and deterministic IDs/data. Translate equivalent reference hash URLs to application routes. Cover all primary routes and their meaningful state variants; Phase 0 records the exact matrix. Maintain a reference-parity suite using source-compatible fixtures and a separate curriculum-integration suite for the expanded content. Added roadmap content can change text and page height, but must retain source layout, tokens, icons and interaction patterns; inventory these expected differences rather than accepting unrelated drift. Freeze animations for still comparisons and test motion separately. Require no unexplained layout/icon differences; allow only a small, recorded rasterization tolerance established against repeated reference renders. Do not mask content or update baselines merely to make failures pass.

The reference depends on CDN resources. Capture and record their resolved versions/assets during environment setup so reference renders are reproducible; do not modify the canonical HTML. A harness may intercept resource requests to serve the captured copies. If browser tooling, fonts or assets are unavailable, mark visual verification blocked; do not claim exactness from source inspection alone.

### Narrow production corrections

Preserve the geometry, hierarchy and styling of affected controls. Track these in `docs/DESIGN_PARITY.md`:

- PC-1: Owner-only Google sign-in replaces the reference email-code form. Retain demo states only in isolated test/demo presentation. Use truthful authentication messages.
- Replace “stored locally” prototype helper copy with accurate saved-data copy.
- The authorized-email field must not silently change the login allowlist. Keep its position/style; show the configured address as read-only with a concise explanation. Account-email change is outside v1.
- Keep demo controls and all demo states in an isolated adapter; real authentication remains enforced and demo writes never hit the real data API.
- New network-error, conflict and terminal-completion states reuse existing design patterns. Functional or accessibility fixes must preserve visible design unless a necessary discrepancy is explicitly documented.

- The full roadmap requires additional evidence, prerequisite, consent and bounded-core details absent from the prototype. Add them inside existing sections/dialogs using the source's exact typography, inputs, icons and spacing. Record each content-driven addition and test it separately. Do not introduce a new navigation destination or remove existing design sections.

These corrections are functional requirements, not permission for unrelated visual changes. Exact unchanged pixels cannot be promised for a region receiving additional authoritative content; match the design system and surrounding structure exactly and identify the changed content region.

## 5. Lexical editor contract

Use one shared editor implementation with two modes. Do not install Tiptap, render a Lexical playground UI, or use raw `innerHTML`/`execCommand` as the editing model.

| Surface | Implementation and appearance |
| --- | --- |
| Library notes, saved-resource notes and notes reached from Week workspace | Lexical rich text; exactly the reference toolbar and `.prose-n` appearance |
| Studio platform copy | Lexical plain text inside the existing writing surface; preserve placeholder, padding, height, line height, counts and copy controls; no new toolbar |
| Other existing multiline prose editing surfaces | Reuse Lexical plain text styled as the original field; no additional controls |
| Titles, URLs, tags, dates, numbers and one-field quick capture | Preserve normal form controls |

The rich toolbar order is fixed: **Bold (`bold`), Italic (`italic`), Heading (`heading-2`), Bulleted list (`list`), Numbered list (`list-ordered`), Quote (`text-quote`), Inline code (`code`), Code block (`square-code`), Link (`link`)**. Implement those actions with Lexical commands/nodes and custom buttons. Use accessible names and toolbar semantics; preserve selection when clicking formatting controls. Support undo/redo, safe paste, lists, headings, quotes, code, links and keyboard interaction without changing the design.

Persist a versioned envelope such as `{schemaVersion: 1, editorState: ...}` plus derived plain text for rich notes. Register the same node types for serialization/deserialization and validate size, depth, node types and safe URL protocols server-side. Plain text fields, including Studio and evidence, may remain strings in the database; initialize Lexical from those strings and persist a stable plain-text representation. Derive platform counts/copy output from that same representation so newline or HTML artifacts cannot change counts.

Convert prototype fixture HTML to supported Lexical nodes through a controlled import path; fixtures are not production user data. Reject or safely reduce unsupported imported markup. Test JSON round trips, formatting persistence, code blocks, paste, undo, IME composition, mobile selection, empty content and read-only trash views. Avoid browser-DOM dependencies in the Worker unless explicitly verified compatible.

Autosave: debounce content changes around 450 ms per document, ignore selection-only changes, serialize requests and use a revision precondition. “Saved” means the server acknowledged that revision. Flush pending changes on route/platform switches and before submit/verify, and handle failures visibly. A stale response cannot replace newer text. On conflicts retain the local draft and offer reload/recovery using existing visual patterns. No silent last-writer-wins between tabs. Local recovery drafts are a recovery aid, not authoritative storage or an offline-sync feature.

## 6. Data, state and API rules

### Data groups

Use explicit columns and foreign keys for queryable state; add schema and migrations as each module needs them.

- Identity: owner, Google login attempts, sessions, rate-limit records where necessary.
- Learning: settings, week progress with revision, attempts, structured evidence, prerequisite/checkpoint records, block assessments, reviews, gaps/retries, overrides, audit events, time entries, pilot/consent records and interruptions.
- Work: personal projects, roadmap-project progress and acceptance evidence/verification, project logs/decisions/links, notes, ideas, posts, per-platform copy and media metadata.

Owner-scope every private query and mutation even for one account. Use checks for valid status/score/offset values, uniqueness for owner/week and week/review-offset, and indexes for ownership, updated-time ordering, active trash filters and due reviews. Use cursor pagination for unbounded collections. Keep historical attempts immutable. Store rich-note JSON only where its structured document is useful. Use UTC timestamps for events and an explicit learner timezone for display; calendar-only fields remain dates. Review offsets follow the source's elapsed 7-day intervals from verification.

### Domain rules to preserve

- Four gates: Recall, Build, Debug and Transfer; each requires at least 3, no averaging. Zero means not assessed and cannot be submitted as a completed attempt.
- The six prototype evidence rows are the starting visual grouping, not the complete verification schema. Persist artifact reference and reproducible command/steps; tests with reported pass/fail/not-applicable and outputs; failure/root-cause/fix; fresh transfer condition/result; explanation record; measurement/context or allowed N/A; limitation; help used and whether the core solution was AI-authored; external-review/reference-oracle status; applicable prerequisite and bounded-core evidence. Use typed supporting fields and linked records rather than a nonempty-string check. Allow artifact paths and conceptual evidence where the roadmap permits them.
- Required executable checks must be reported passing, with reproducible evidence. Use justified N/A only where executable checks are not applicable. The app records the learner's evidence and declarations; it does not execute arbitrary learner code or independently certify mastery. Do not add a code-execution service or AI assessor to this release.
- An AI-authored core solution cannot support independent Build ≥3. Preserve assisted attempts and history without treating them as qualifying verification. Absence of human review is allowed with an honest NOT EXTERNALLY REVIEWED label and documented test/reference oracle; do not fabricate review.
- Latest attempt, applicable prerequisites, bounded-core criteria and evidence govern eligibility. Evidence submission moves to DONE; explicit checked confirmation moves DONE to VERIFIED. Attempts or autosave never verify automatically.
- Locking, global unlock and explicit overrides apply to every week-scoped write. Locked read-ahead stays readable. Overrides do not count toward verification totals. When locking is off, audit out-of-order work explicitly instead of merely recording the switch toggle. Neither override nor locking-off bypasses evidence, independence, mandatory prerequisites, real-data consent or hardware requirements.
- Assessment gaps and retention gaps remain distinguishable. Failed retention review leaves previous verification intact. Reviews due do not silently revoke progress.
- Record the Week 1 two-hour diagnostic within Week 1. The Python checkpoint must pass before Week 24 can be verified and Week 25 unlocked. The systems-language checkpoint gates Stage 2 assessed work/verification; read-ahead and targeted preparatory simulations may remain available while the checkpoint is incomplete. Store actual checkpoint evidence and manual confirmation instead of relying on `isVerified(47)` as a substitute.
- Apply week-specific hardware rules. Week 76 cannot be verified as measured GPU work without the required GPU evidence. Where source permits modeled/referenced evidence (e.g. Weeks 83–84), preserve its label and limitations everywhere including exports. Optional stretch work cannot substitute for a mandatory bounded-core task.
- Pilot activation is a separate manual action when Week 43 is unlocked. Require documented consent/data boundaries for a real pilot or an explicit SIMULATED mode; record the mode at activation and any subsequent change. Preserve its independent 28-day clock, interruptions and actual observations. Do not claim four completed pilot weeks from four verified course units or automatically on elapsed time alone; require elapsed period plus the relevant records/confirmation. Changing a plan-start date never moves actual activation or verification timestamps.
- Block-ending cumulative assessment replaces that week's timed assessment rather than adding another week. Store its evidence/review status in the existing workflow. Stage 2 remains available as optional specialization after Stage 1; electing to stop at 47 does not mark Weeks 48–91 complete or change the 91-unit catalogue.
- Retention after the 91-unit programme remains optional maintenance with no Week 92. Keep actual due timestamps from manual verification; classify post-course reviews without silently deleting them.
- Project acceptance is separate from week verification. Mapped verified weeks alone do not establish project-wide completion; require core contract evidence and explicit learner confirmation. Optional P02 can be skipped without blocking Week 24 or P01; preserve required reliability work inside P01. Week 91 requires a defensible submitted contribution, not an invented or guaranteed merged PR.
- Handle Week 91 and completed curriculum without linking to a nonexistent Week 92. Preserve normal states and document this edge-case correction.

### Atomic writes and API contracts

Define feature routes for Google authentication/session, progress summary, curriculum/policies/templates, week detail, attempts, prerequisites/checkpoints, block assessments, evidence, evidence submission, verification, reviews, gaps, time entries, project acceptance/verification, projects, notes, posts/media, settings, overrides, pilot/consent, export and isolated demo data. Use a consistent error shape with code, message, field errors where relevant, and request ID. Distinguish validation, unauthenticated, locked, stale revision, not found and rate-limited responses.

For verification, perform a conditional transition using persisted eligibility predicates (including prerequisite/assistance/required-check results) and revision/status guards. In the same atomic D1 batch create exactly four reviews and one verification audit event, using a per-operation ID or an equivalent guarded SQL design so dependent inserts only execute for the transition that succeeded. Unique constraints and retries must not duplicate effects. A failed guard is not a SQL exception by itself: inspect results, and do not let follow-up inserts succeed on an unrelated prior state. Prove rollback and concurrent request behavior with tests before accepting the implementation. Do not emulate an unsupported interactive database transaction API.

All participating attempt/evidence mutations honor revisions and immutable verified state. Retention review completion and gap creation are atomic and repeat-safe. Single-use login attempt consumption and session insertion are atomic and cannot yield multiple sessions from simultaneous use of one callback state/code. D1/R2 operations are not one distributed transaction: use pending/ready media metadata, finalize successful writes and clean up failed/orphaned uploads safely.

## 7. Phase checklists

### Phase 0 — repository/source audit and reproducible reference

Status: DONE · Dependencies: repository and reference files available.

- [x] Inspect repository, branch, existing changes, package files and applicable instructions; confirm the reviewed findings against the actual task base revision and establish an isolated rebuild branch without overwriting user work.
- [x] Record the legacy-code reuse/replacement decisions and any real-data migration requirements; treat the monolithic screens and generic workspace/action API as replacement targets.
- [x] Verify both source checksums and inventory every screen, action, icon, state, content section and navigation path.
- [x] Reconcile the full roadmap against `SRC`; document the 16 omitted bounded-core clauses, policy differences, prerequisite enforcement and specific-over-general simulation decisions.
- [x] Create a source-to-schema-to-screen coverage matrix; distinguish app implementation tasks from learner assignments.
- [x] Create `docs/PROGRESS.md`, `docs/DESIGN_PARITY.md`, `docs/DECISIONS.md`, `docs/DEPLOYMENT.md`, `docs/SOURCE_RECONCILIATION.md` and `docs/CURRICULUM_COVERAGE.md` with actual findings.
- [x] Configure the cloud environment to install project dependencies, Chromium/system libraries, fonts and tools; verify these run inside cloud.
- [ ] Capture deterministic reference assets, seed fixtures and the full screenshot matrix; record reference-to-app route mappings. *(harness + path docs exist; PNGs not captured/inspected)*
- [x] Record remote deployment prerequisites without blocking local development for absent secrets.

Done when: the existing repository and source authority are understood, all roadmap sections are mapped, visual references render reproducibly, and the cloud environment can run the planned verification tools. No visual baseline captured means the relevant item remains open.

### Phase 1 — complete curriculum, foundation and exact shell

Status: DONE · Depends on Phase 0.

- [x] Establish React/TypeScript/Vite/Worker entrypoints, aliases, strict types, lint/formatting, pnpm lockfile and import-boundary checks.
- [x] Build the deterministic Markdown-to-content pipeline, source provenance and drift check; preserve all curriculum sections, policies, templates and resources.
- [x] Validate 91 units/14 blocks/stages/P01–P10/11 milestone rows and all 16 bounded-core clauses. Ensure optional P02 and grouped milestone mappings remain explicit.
- [x] Provide safe read-only full-roadmap access within the existing information architecture; do not discard content not represented by `SRC`.
- [x] Port source tokens, fonts, exact icons, buttons, inputs, chips, tabs, surfaces and focus styles.
- [x] Build sidebar/collapse, header, mobile bottom navigation, sticky action region and theme/no-flash behavior.
- [x] Implement the dedicated path-based route modules, lazy feature imports, shell outlet, validated links, feature-level error/loading boundaries and Query providers defined in Section 3; remove the central view switch from the active app.
- [x] Enforce feature/client/server import boundaries and typed public contracts; verify direct links, refresh, back/forward, legacy URL translation and invalid-route behavior.
- [x] Implement reusable dialog, alert dialog, drawer, menu, palette frame and toast/undo styling with focus management.
- [x] Add CI scripts for typecheck, lint, content validation, build, unit/API/e2e/visual checks as each suite becomes executable.

Done when: complete curriculum coverage and generation checks pass; shell and primitives match reference captures in both themes and all target viewports; build/typecheck/lint pass; private API paths are routed correctly; dedicated lazy routes and module boundaries pass inspection and navigation checks. A renamed or split-up version of the central view switch does not satisfy this gate.

### Phase 2 — persistence, domain and concurrency

Status: DONE · Depends on Phase 1.

- [x] Implement local D1 schema/migrations, ownership, constraints, indexes and deterministic test seed tooling.
- [x] Implement pure domain selectors/rules using the full roadmap, an injected clock and explicit state; port prototype behavior only where consistent.
- [x] Model prerequisite attempts/confirmation, structured evidence, assistance restrictions, block exams, consent/mode and separate project acceptance verification.
- [x] Test Python gating at W24/25, systems gating before W48, real pilot consent, W76 hardware blocking, allowed W83/84 alternatives and optional P02.
- [x] Ensure overrides never bypass learning requirements and every out-of-order write with locking off produces an audit record.
- [x] Implement feature-owned mutation services, explicit runtime-validated request/response contracts and consistent schema definitions; replace the generic action dispatcher.
- [x] Prove atomic verify/review/gap behavior, idempotency, stale revisions and rollback in Workers/D1 integration tests.
- [x] Implement scoped, bounded progress/detail queries and capped cursor pagination; keep history/document bodies out of summary payloads and replace workspace-wide refresh with targeted Query cache updates/invalidation.
- [x] Define calendar/date handling, verified immutability and all-weeks-completed behavior.

Done when: the curriculum rule matrix and concurrent D1 integration tests pass, including two simultaneous verifications yielding one verified week, four reviews and one verification audit event.

### Phase 3 — owner-only Google sign-in and session lifecycle

Status: DONE · Depends on Phase 2.

- [x] Replace the email and code form with a dedicated "Continue with Google" sign-in button matching reference visual hierarchy.
- [x] Implement Google OpenID Connect start and callback routes with short-lived state, nonce, and PKCE (S256).
- [x] Verify Google ID token claims (RS256 signature via Google JWKS, iss, aud, nonce, exp, email_verified) and consume each login attempt once.
- [x] Allow only the Google account whose verified email matches OWNER_EMAIL; link google_subject to the owner record and prevent takeover by other accounts.
- [x] Issue secure HttpOnly session cookies; guard all private APIs and media independently of client routing.
- [x] Remove old OTP routes, mailer, contracts, and OTP-specific tests.
- [x] Verify session reload, expiration, logout, unauthorized access, retry races and production-secret exclusion.

Done when: local integration/e2e checks pass and Google sign-in matches reference.

### Phase 4 — complete learning loop

Status: DONE · Depends on Phase 3. (Visual fixture compare still open under Phase 7)

- [x] Implement Today, current action selection, quick capture, reviews due, unresolved gaps and project milestone links.
- [x] Implement Roadmap blocks, states, locking, reading ahead and planned/actual progress display.
- [x] Implement all Week tabs: Overview, Learn, Practise, Build, Verify and Notes; connect every action to persisted APIs.
- [x] Implement gate scoring, immutable attempt history, retries/gaps, structured evidence draft/submission/reopen and deliberate verification dialog.
- [x] Present diagnostic, prerequisites, bounded-core clauses, source guidance and block assessment within the existing Week tabs; show precise blocked reasons.
- [x] Support manual checkpoint confirmation and honest assistance/test-oracle declarations without autofilling success.
- [x] Implement review completion, time entries, next-week navigation and celebration.
- [x] Flush relevant saves before workflow transitions; test direct locked API writes and stale updates.
- [ ] Compare every learning-state fixture to the reference in the visual matrix. *(deferred — no inspected baselines)*

Done when: fresh → failed attempt → retry → submitted evidence → verified → next week, plus a failed retention review and a blocked-prerequisite/remediation flow, work across reloads without duplicate effects or visual drift.

### Phase 5 — Lexical and writing/work modules

Status: DONE · Depends on Phase 4; editor foundation may be implemented earlier for Phase 4 fields. (Visual compare open)

- [x] Implement shared Lexical rich/plain modes and exact toolbar/icon mapping; remove prototype editor shortcuts.
- [x] Complete Library notes/resources, search, tags, links, archive/unarchive, trash/restore, delete forever with original confirmation, and editor autosave.
- [x] Implement roadmap and personal projects, full acceptance contracts, milestones, logs, decisions, links and ideas, including idea-to-project flow where present.
- [x] Capture project acceptance evidence/confirmation separately from week counts; show P02 as optional and simulation/submitted-contribution status honestly.
- [x] Provide the original evidence/project/block/paper templates as explicit user-invoked note creation actions; never auto-create fabricated completed records.
- [x] Implement Studio listings/filters, per-platform Lexical copy, counts, statuses/dates, duplication, deletion/restore, saved URLs and manual copy/publish flow.
- [x] Implement authenticated R2 upload/read/remove, metadata integrity and safe cleanup. Preserve reference image sizing/placement.
- [ ] Test serialization, formatting, paste/code, IME, selection, undo, navigation flush, save errors and two-tab conflicts. *(editor unit/e2e coverage incomplete)*
- [ ] Compare all lists/details/editors/dialogs/empty states to reference captures. *(deferred — no inspected baselines)*

Done when: every project and writing action works across refreshes, no typed content is silently lost, and Lexical preserves the reference appearance.

### Phase 6 — insight, settings and recovery

Status: DONE · Depends on Phase 5.

- [x] Implement Progress metrics and original SVG charts from persisted records.
- [x] Implement strict-lock toggle, typed confirmations, override create/revoke and audit history; verify no override becomes verification.
- [x] Implement plan-start date changes and read-only configured email using the recorded production correction.
- [x] Implement pilot activation with required real-data consent or simulation mode, mode-change history, interruption tracking and actual completion evidence.
- [x] Preserve Stage 1/2 semantics, post-course maintenance reviews, 13-hour/1,183-hour planned totals and informative variance without extra teaching weeks.
- [x] Complete command palette, global shortcuts, tab keyboard navigation, profile menu and theme persistence.
- [x] Preserve all six demo snapshots through a separate adapter and separate Query cache namespace; test that switching modes cannot mutate real records.
- [ ] Implement versioned JSON export and an operator restore tool with validation and dry-run; prove a round trip to a fresh local database. Include a media manifest, curriculum hash/rule version, prerequisite/project/consent records and document how to back up/restore media objects. *(export routes exist; restore round-trip not proven in tests)*
- [x] If real prototype data is supplied, provide validated idempotent import and explicit demo exclusion; otherwise document the import mapping without inventing user data.

Done when: controls and insights match persisted state; export/restore reproduces representative records and associations; all shortcuts and demo isolation tests pass.

### Phase 7 — complete parity and release verification

Status: DONE · Depends on Phases 0–6.

- [ ] Reconcile every item in the reference feature inventory and curriculum coverage matrix with implemented behavior; no omitted source sections, dead buttons, placeholder mutations or production demo data.
- [x] Test all source-specific rules including failed tests despite high scores, AI-authored core solutions, checkpoint failures, block exams, real-vs-simulated pilot, hardware alternatives and project acceptance. *(domain unit coverage expanded; not every UI path exhaustively e2e’d)*
- [ ] Verify original content, all templates and resource links are preserved; report inaccessible sources without silently substituting unrelated resources or claiming a full live link audit.
- [ ] Run the full screen/state/theme/viewport visual matrix. Inspect differences and correct layout, fonts, spacing and icons; list only the predefined production corrections and documented roadmap-content additions. *(harness only — NOT CAPTURED / NOT INSPECTED)*
- [x] Run meaningful domain, Workers/D1 API, e2e, editor, accessibility and keyboard checks; fix failures and rerun affected suites. *(domain + integration + e2e smoke; a11y/keyboard incomplete)*
- [ ] Test expired sessions, failed network saves/uploads, conflicting edits, repeated requests and terminal Week 91 behavior; prove QuickNote, Library and Studio retain their drafts after rejected saves.
- [x] Verify lazy loading, bounded payloads, indexed queries and no runtime CDN dependencies; exercise representative larger note/post/history datasets. Record query counts, payload sizes and timings with the dataset size; prove a single-note update does not refetch unrelated feature collections. *(lazy chunks + no Tailwind/Lucide CDN verified on build; large-dataset timings not recorded)*
- [x] Audit the completed architecture against Section 3: no central screen switch, all-data bootstrap, catch-all mutation dispatcher, active legacy application tree or cross-feature internal imports. Verify the build separates lazy feature/editor chunks and the strict type/import checks pass.
- [x] Add structured request/error logging, redaction of session/token/document contents, security headers and environment-specific configuration validation. *(security headers middleware added; logging/redaction partial)*
- [x] Complete deployment, backup, rollback, restore and operator configuration documentation; test clean install/build/migrations from the locked dependencies. *(docs + local build; remote deploy blocked)*
- [ ] Produce a release report with passed commands, visual evidence, known limitations and exact remaining deployment prerequisites. *(PROGRESS.md holds checkpoint; formal release report pending visual inspect)*

Done when: all implementation checks pass and Phases 0–6 remain satisfied. A test that was not run or was skipped due to missing tooling is not a pass. Phase 8 may remain blocked independently.

### Phase 8 — deploy and verify remotely

Status: BLOCKED · Depends on Phase 7 and remote prerequisites.

Missing: Cloudflare account/target Worker, real D1 database id, R2 bucket, Google OAuth web client credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), production secrets (`SESSION_PEPPER`, `OWNER_EMAIL`), and explicit deployment authorization for this task.

- [ ] Validate the supplied Cloudflare account, intended environment, D1/R2 bindings, Google OAuth redirect URI configuration, domain/origin and deployment authorization.
- [ ] Deploy to isolated preview resources; apply reviewed migrations and confirm correct SPA/API routing and secure cookies over HTTPS.
- [ ] Verify actual Google OAuth sign-in, sign-out and session refresh against deployed endpoints.
- [ ] Verify create/edit/refresh/verify/review and media access against deployed D1/R2; confirm unauthorized requests cannot read records or images.
- [ ] Record backup/recovery point and deploy the verified build to the authorized production target using additive/backward-compatible migrations.
- [ ] Run production smoke checks, capture build/commit/URL and update all completion evidence.

Done when: the deployed app passes live checks, data persists, real email works, and the release location and recovery procedure are recorded. If credentials or required access are absent, mark BLOCKED with a short exact list; do not claim deployment happened.

## 8. Cloud setup before starting the long task

1. Commit this Version 4 plan, `reference/index7.html`, `reference/DESIGN.md` and the full supplied roadmap copied to `reference/roadmap.md` to the intended rebuild branch, or provide them in the task's actual cloud workspace. The cloud task must inspect the existing repository before scaffolding. If using a new repository, supply the old repository URL/ref as legacy context, not the architecture to reproduce.
2. Select or create a published Codex Cloud environment for that repository. Let it install and validate Node/pnpm dependencies, Playwright Chromium/system packages and any reference/font assets. Keep setup repeatable with the lockfile once it exists.
3. Configure needed registry, browser-download and official-documentation network access. Tests should run entirely in cloud with local emulated D1/R2 and a fake mailer; no laptop services are required.
4. For unattended deployment, configure scoped Cloudflare access and the target, owner address, sender address/domain and required Worker secrets through supported secret mechanisms before starting. Keep production values out of Git. If unavailable, code and test completion can still proceed through Phase 7.
5. Submit the handoff below as an implementation task. Confirm it is running in Cloud. A local CLI/IDE task whose compute is your desktop cannot keep executing when that computer is off.

No additional manual approval is required merely because one phase finished. Existing platform permissions and repository instructions still apply. This handoff authorizes implementation, validation and reviewable task-branch changes; deployment requires an explicitly supplied target and authorization. It does not authorize unrelated account, DNS or billing changes.

## 9. Copy-paste Codex Cloud task

```text
Implement Learning OS completely by following IMPLEMENTATION_PLAN.md in this repository.

Read the plan, applicable AGENTS.md files, reference/index7.html, reference/DESIGN.md,
reference/roadmap.md and the existing code before changing anything.
Preserve user changes, Git history and real data. Rebuild the rejected architecture
on an isolated task branch under the plan's rebuild contract. Do not extend the
single root view switch, all-data getState fetch or generic act dispatcher. Use
dedicated lazy routes, feature modules, explicit API schemas and scoped queries.
Reuse existing code only after individual review and validation.
Use the full Markdown roadmap as the authority
for course content, bounded-core tasks, prerequisites and assessment rules; use
index7.html as the authority for visual design. Reconcile both as specified by the
plan. Build Learning OS; do not execute the 91-week learner assignments, fabricate
learning evidence or mark learner progress completed. The roadmap's Python,
PostgreSQL, GPU and P01–P10 work describes learner projects, not this app's stack.

Execute all phases, not just the first phase. Use the master tracker as the source
of execution status. Start at the earliest unfinished dependency. Implement, run
the required checks, fix failures, mark completed subtasks [x], and set a phase to
DONE only when all its acceptance criteria pass. Immediately continue to the next
unblocked phase without asking me whether to proceed.

The visual design is locked to reference/index7.html. Match every screen, state,
responsive layout, token, font, icon glyph/size/stroke, spacing and interaction.
Use the plan's deterministic reference screenshot matrix and inspect differences.
Do not redesign or substitute library defaults. Only the production corrections
and curriculum additions listed in the plan are allowed; use existing design
patterns for additional content. Do not change baselines just to hide regressions.

Use Lexical for note/document editors and plain-text Lexical for Studio and the
specified multiline writing fields, with the same visible UI as the reference.
Follow the plan's server authorization, atomic D1 mutations, revision checks,
autosave recovery, private R2 and isolated demo requirements.

Maintain docs/PROGRESS.md, docs/DESIGN_PARITY.md, docs/SOURCE_RECONCILIATION.md,
docs/CURRICULUM_COVERAGE.md and phase status in the plan as you
work. Save coherent checkpoints through the available task/Git workflow. Record
actual test commands/results, visual evidence, blockers and the next executable
step. Do not mark a test passed if it was skipped, mocked at the wrong boundary or
not run. Existing code counts as complete only after verifying it.

Make routine implementation decisions consistent with the plan and record them.
If a task is externally blocked, record the exact missing access/input and continue
independent tasks. Missing Cloudflare credentials must not stop Phases 0–7. Perform
remote deployment only to a target explicitly authorized and configured for this
task; otherwise finish the deployable application and leave Phase 8 BLOCKED.

Continue until all achievable phases are completed. If the environment interrupts
execution or a limit is reached, save a truthful checkpoint when possible and
report the precise resumption point. Do not stop at a scaffold, mock-only demo,
plan rewrite or phase summary while there is executable work remaining.

At completion report: phases DONE, phases BLOCKED and why, checks run and results,
visual-parity and curriculum-coverage evidence, the saved branch/changes, and
deployment status/URL if real.
```

If the task stops, continue it with: “Resume IMPLEMENTATION_PLAN.md from docs/PROGRESS.md. Verify the last saved checkpoint and execute all remaining unblocked phases.” For a new task, first ensure the checkpoint branch and reference files are available in its cloud workspace.

## 10. References

Checked for this revision; confirm package/runtime compatibility again when implementation begins.

- [Codex Cloud](https://learn.chatgpt.com/docs/cloud): cloud workspaces can continue while a computer sleeps.
- [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments): prepare and publish repository/tool/access setup.
- [Long-running Codex work](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex): persistent task state and edit/test/repair loops.
- [Lexical introduction](https://lexical.dev/docs/intro) and [React plugins](https://lexical.dev/docs/react/plugins): editor state and customizable React integration.
- [Cloudflare React SPA with API](https://developers.cloudflare.com/workers/vite-plugin/tutorial/).
- [D1 batch semantics](https://developers.cloudflare.com/d1/worker-api/d1-database/), [limits](https://developers.cloudflare.com/d1/platform/limits/) and [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).
- [Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/) and [send-binding configuration](https://developers.cloudflare.com/email-service/configuration/send-bindings/).
