# Learning OS

Private single-user study desk for the 91-week FDE / deep-fundamentals roadmap. React SPA + same-origin Cloudflare Worker API (Hono) + D1 + R2. Curriculum authority is `reference/roadmap.md`; visual authority is `reference/index7.html`.

This rebuild uses dedicated TanStack Router routes, feature modules, explicit Zod contracts, and scoped TanStack Query keys. It does **not** use a central view switch, an all-data workspace bootstrap, or a generic `act` dispatcher.

## Requirements

- Node `>=22`
- `pnpm@10.33.4` (see `packageManager` in `package.json`)

## Run locally

```bash
pnpm install
pnpm content:build          # or content:check if content/ is already committed
pnpm db:migrate:local       # creates local D1 tables
pnpm dev                    # http://127.0.0.1:43123
```

Set `OWNER_EMAIL` in `wrangler.jsonc` to your Google account. Create a Google OAuth web client with `http://127.0.0.1:43123/api/auth/google/callback` as an authorized redirect URI. Copy `.dev.vars.example` to the ignored `.dev.vars` and fill in the client ID and secret. The first authorized login creates an owner with empty settings; an existing owner keeps its data.

## Content pipeline

| Command | Purpose |
| --- | --- |
| `pnpm content:build` | Parse `reference/roadmap.md` → `content/roadmap.json` + `content/roadmap.full.md` |
| `pnpm content:check` | Fail CI if generated content drifts from the roadmap checksum |

Learner progress lives in D1 and starts empty. Importing curriculum never marks weeks verified or fabricates evidence.

## Tests

```bash
pnpm typecheck
pnpm test:unit
pnpm test:integration          # Workers/D1 pool
pnpm test:e2e                  # Playwright smoke (starts `pnpm dev`)
pnpm test:visual               # Matrix harness (layout only unless RUN_VISUAL_CAPTURE=1)
pnpm build
pnpm exec tsx scripts/architecture-audit.ts
```

E2E uses a local-only browser-test session. Visual baselines live under `tests/visual/baselines/` — see `docs/DESIGN_PARITY.md`. Pixel parity is **not** claimed until captures are inspected.

## Architecture check

```bash
pnpm exec tsx scripts/architecture-audit.ts
```

Writes `docs/ARCHITECTURE_AUDIT.md` confirming no central view switch, no all-data `getState` for real data, and no generic `act` dispatcher.

## Deployment (Phase 8)

Local build + emulated D1/R2 are enough through Phase 7. **Phase 8 is BLOCKED** until Cloudflare credentials and authorization are supplied:

- Cloudflare account + target Worker
- Real D1 database id and R2 bucket
- Google OAuth web client with the deployed callback URI
- `OWNER_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SESSION_PEPPER`
- Explicit deploy authorization

See `docs/DEPLOYMENT.md`. Do not treat a successful local `pnpm build` as a remote deploy.
The committed `wrangler.jsonc` is development-only. Production uses an ignored, validated `wrangler.production.jsonc` created from the example; `pnpm deploy` will refuse to run without it.

## Docs

| Doc | Role |
| --- | --- |
| `IMPLEMENTATION_PLAN.md` | Phased contract + master tracker |
| `docs/PROGRESS.md` | Live checkpoint |
| `docs/DESIGN_PARITY.md` | Visual matrix + allowed deltas |
| `docs/CURRICULUM_COVERAGE.md` | Roadmap → schema → screens |
| `docs/SOURCE_RECONCILIATION.md` | Authority conflicts |
| `docs/ARCHITECTURE_AUDIT.md` | Section 3 audit output |
