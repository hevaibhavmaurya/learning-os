# Design Parity

Visual authority: `reference/index7.html` (immutable). Production corrections and curriculum additions only as listed in IMPLEMENTATION_PLAN.md §4.

## Tokens (locked)

Light/dark CSS variables match the reference exactly (`--bg` through `--shadow`). Fonts: Geist, Instrument Serif, Geist Mono. Icons: `lucide-react@0.469.0`, default 16px / stroke 1.75.

## Layout (locked)

- Sidebar expanded 240px (`w-60`), collapsed 68px
- Mobile bottom nav 6 items + safe-area
- Main `max-w-[1100px]`, sticky week action bar above mobile nav

## Production corrections (allowed visual/copy deltas)

| ID | Change | Region |
| --- | --- | --- |
| PC-1 | Owner-only Google sign-in replaces the reference email-code form | Login |
| PC-2 | Replace “stored locally” helper copy with accurate saved-data copy | Settings / Library |
| PC-3 | Authorized email read-only; no silent allowlist mutation | Settings |
| PC-4 | Demo adapter isolated; demo writes never hit real data API | Settings demos |
| PC-5 | Network-error / conflict / terminal-completion reuse existing patterns | Global |

## Curriculum content additions (layout preserved)

Additional roadmap fields (bounded-core, prerequisites, structured evidence, templates) appear inside existing Week tabs / Library / Roadmap using source typography and spacing. Each addition is listed here as implemented.

| ID | Addition | Placement |
| --- | --- | --- |
| CA-* | (filled during Phases 1–5) | Week tabs / Library |

## Screenshot matrix

Viewports: 390×844, 768×1024, 1440×1000 × themes light/dark.

Harness: `tests/visual/matrix.spec.ts` (Playwright project `visual`).  
Baseline root: `tests/visual/baselines/`.

### Path conventions

```
tests/visual/baselines/
  manifest.json                 # expected path matrix (always generated)
  CAPTURE_STATUS.md             # written only when RUN_VISUAL_CAPTURE=1
  reference/<routeId>/<viewport>-<theme>.png
  app/<routeId>/<viewport>-<theme>.png
```

Examples:

| Kind | Route id | Viewport | Theme | Path |
| --- | --- | --- | --- | --- |
| reference | `login` | 390 | light | `tests/visual/baselines/reference/login/390-light.png` |
| app | `today` | 1440 | dark | `tests/visual/baselines/app/today/1440-dark.png` |
| reference | `week-9-overview` | 768 | light | `tests/visual/baselines/reference/week-9-overview/768-light.png` |

### Routes (reference hash → app path)

| Reference | App route | States |
| --- | --- | --- |
| `#/login` | `/login` | Google sign-in, error |
| `#/today` | `/today` | fresh, mid, failed, review, ready, verified |
| `#/roadmap` | `/roadmap` | locked/unlocked reading |
| `#/week/9/overview` … `/notes` | `/weeks/9/{tab}` | locked, in-progress, verified |
| `#/projects` | `/projects` | list empty/populated |
| `#/projects/P01` | `/projects/P01` | detail |
| `#/library` | `/library` | empty, notes, trash |
| `#/library/:id` | `/library/notes/:noteId` | editor |
| `#/studio` | `/studio` | list |
| `#/studio/:id` | `/studio/:itemId` | platforms |
| `#/progress` | `/progress` | charts |
| `#/settings` | `/settings` | locking, pilot, demos |

### Capture status

**NOT CAPTURED / NOT INSPECTED.** The harness and directory layout exist. Full pixel compare is deferred. Do **not** mark visual parity DONE until `RUN_VISUAL_CAPTURE=1 pnpm test:visual` has written PNGs and differences have been inspected.

```bash
# Layout / manifest only (default CI)
pnpm test:visual

# Materialize baselines (local / intentional)
RUN_VISUAL_CAPTURE=1 pnpm test:visual
```

## Expected differences inventory

Only PC-* and CA-* above. Unexplained layout/icon drift is a failure.

## Runtime assets

Production build bundles Tailwind (Vite plugin) and `lucide-react` — no runtime Tailwind or Lucide CDNs. `index.html` still loads Geist / Instrument Serif from Google Fonts; self-hosting fonts remains a follow-up (noted in security CSP).
