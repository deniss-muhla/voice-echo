# Task 05 — Project scaffolding (pnpm + Turborepo + Vite + Lit + Worker)

## Summary

Scaffold the initial monorepo so implementation tasks can start immediately. The repo is currently empty aside from docs; this task creates the baseline structure, tooling, and dev scripts for the app and the Cloudflare Worker.

## Scope

- In scope:
  - Monorepo layout
  - Package manager + workspace setup
  - Web app scaffolding (Vite + TS + Lit + SASS)
  - Worker scaffolding (Wrangler)
  - Lint/format/typecheck/test wiring
- Out of scope:
  - Implementing the actual features (handled by later tasks)

## Requirements

- Package manager: `pnpm`.
- Monorepo: Turborepo.
- Runtime preference: Bun may be used for dev speed, but scripts must work with `pnpm` (CI friendly).
- Web app:
  - Vite + TypeScript
  - Lit for web components
  - SASS for styling
- Worker:
  - Wrangler config
  - TypeScript
  - Bindings placeholders for R2 + KV
- Quality:
  - Prettier formatting
  - Typecheck command
  - Unit tests runner (Vitest recommended)

## Proposed layout

- `apps/web/` — the PWA
- `apps/worker/` — Cloudflare Worker API
- `packages/ui/` — shared Lit components/design system
- `packages/shared/` — shared types (index schema types, API DTOs)

## Acceptance Criteria

- `pnpm -v` and `pnpm install` succeeds.
- `pnpm dev` starts web app.
- `pnpm worker:dev` starts worker locally.
- `pnpm typecheck` runs for all packages.
- `pnpm test` runs unit tests (even if just a smoke test).

## How to Test

- Manual:
  - `pnpm install`
  - `pnpm dev` and open the app
  - `pnpm worker:dev` and hit `/health`

## Dependencies

- None

## Cost notes

- A clean workspace reduces wasted time/iterations; doesn’t affect runtime cost.

---

## Issue (copy/paste)

Title:
Project scaffolding (pnpm + Turborepo + Vite + Lit + Worker)

Description:
Scaffold the monorepo for Voice Echo: `apps/web` (Vite+TS+Lit+SASS), `apps/worker` (Wrangler+TS), and shared packages. Add `pnpm` workspaces and Turborepo pipelines plus basic quality scripts (format/typecheck/test).

Acceptance Criteria:

- `pnpm install` succeeds.
- `pnpm dev` runs web app.
- `pnpm worker:dev` runs worker.
- `pnpm typecheck` + `pnpm test` run.

How to Test:

- Run the above commands and verify output.

Dependencies:

- None
