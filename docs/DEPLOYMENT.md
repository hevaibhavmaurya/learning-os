# Deployment

## Local development

```bash
pnpm install
pnpm content:build
pnpm db:migrate:local
pnpm dev   # http://127.0.0.1:43123
```

Create a Google OAuth web client, authorize `http://127.0.0.1:43123/api/auth/google/callback`, and put its credentials in an ignored `.dev.vars` copied from `.dev.vars.example`. Set `OWNER_EMAIL` to that Google account. `wrangler.dev.jsonc` is only for local development. Its placeholder D1 ID must never be used for a public deployment. A mistakenly published development Worker rejects non-local API requests.

## Bindings

| Binding | Purpose |
| --- | --- |
| `DB` | D1 learner data |
| `MEDIA` | Private R2 media |
| `OWNER_EMAIL` | Allowlisted owner |
| `APP_ORIGIN` | Cookie / CSRF origin |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` / `SESSION_PEPPER` | Secrets (wrangler secret; never commit) |

## Phase 8 prerequisites (currently missing)

- Authorized Cloudflare account + target Worker name
- Real D1 database id and R2 bucket
- Google OAuth web client with `https://YOUR_APP_DOMAIN/api/auth/google/callback` as an authorized redirect URI
- Production `OWNER_EMAIL` and secrets
- Explicit deployment authorization for this task

Copy `wrangler.production.example.jsonc` to the ignored `wrangler.production.jsonc`, replace every placeholder with the real Worker name, D1 ID, R2 bucket, HTTPS origin, owner, and Google client ID. Configure `GOOGLE_CLIENT_SECRET` and `SESSION_PEPPER` as Worker secrets. Apply D1 migrations to the production database, then run `pnpm deploy` only after explicit authorization. The deploy script validates configuration and builds against the production bindings before invoking Wrangler. A raw `wrangler deploy` is not the supported release path.

Until the account, resources, credentials, and authorization exist, Phase 8 remains **BLOCKED**.

## Backup / restore

- JSON export from Settings includes curriculum hash, rule version, records, media manifest
- Operator restore tool supports dry-run validation against a fresh local D1
- Media objects restored separately via R2 manifest
