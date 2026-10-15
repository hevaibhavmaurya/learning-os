# Architectural Decisions

## ADR-001 — Modular rebuild (LOCKED)

Rebuild as React SPA + same-origin Worker API + D1 + R2. Dedicated TanStack Router routes, feature modules, explicit Zod contracts, scoped TanStack Query keys. Rejected: single root view switch, all-data `getState`, generic `act` dispatcher.

## ADR-002 — Curriculum pipeline

`reference/roadmap.md` → deterministic `pnpm content:build` → committed `content/roadmap.json` (+ full sanitized markdown). `pnpm content:check` fails on drift. SRC inside `index7.html` is not the curriculum authority.

## ADR-003 — Lexical editors

Shared Lexical composition: rich mode for Library notes; plain-text mode for Studio and multiline evidence/writing fields. No Tiptap. Persist rich notes as `{schemaVersion:1, editorState}` + plain text.

## ADR-004 — Auth

Owner-only Google sign-in (no public signup). Google identity is verified by the Worker and linked to the existing owner; application sessions use HttpOnly cookies.

## ADR-005 — Demo isolation

Demo snapshots use a separate adapter and Query cache namespace. Demo writes never touch real D1 learner tables.

## ADR-006 — Deployment

Missing Cloudflare credentials block Phase 8 only. Phases 0–7 complete against local emulated D1/R2.
