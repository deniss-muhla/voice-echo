# Task 00 — Worker project skeleton (Cloudflare)

## Summary

Create the minimal Cloudflare Worker project that will handle auth, index reads/writes, and presigned R2 URL minting.

## Scope

- In scope:
  - Worker package in monorepo (`apps/worker` or similar)
  - Local dev setup (Miniflare or `wrangler dev`)
  - Env bindings: R2 bucket, KV (for sessions), secrets
- Out of scope:
  - App UI

## Requirements

- Worker runs on Cloudflare Workers runtime.
- R2 bucket is available via binding for index reads/writes.
- KV namespace for sessions/refresh tokens (cost-friendly; acceptable eventual consistency).
- Add a `/health` route returning `200`.

## Acceptance Criteria

- `wrangler dev` runs Worker locally.
- `/health` returns `200` with JSON `{ ok: true }`.
- Bindings are documented.

## How to Test

- Manual:
  - Run `wrangler dev` and hit `/health`.

## Dependencies

- phase-0/\* (schemas + conventions)

## Cost notes

- Keep Worker lightweight; no audio proxying.

---

## Issue (copy/paste)

Title:
Worker project skeleton (Cloudflare)

Description:
Create a Cloudflare Worker package with R2 + KV bindings and a `/health` endpoint. Document bindings and local dev steps.

Acceptance Criteria:

- Local dev works (`wrangler dev`).
- `/health` returns `{ ok: true }`.

How to Test:

- Start dev server and curl `/health`.

Dependencies:

- Phase 0 conventions
