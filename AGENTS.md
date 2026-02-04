# Voice Echo — Development Direction (AGENTS)

This file is a lightweight guide for humans (and coding agents) to understand the direction, constraints, and major building blocks of Voice Echo.

Source of truth for detailed tasks:

- `.vscode/specification/MASTER.md`
- `.vscode/specification/phase-*/*.md`

## What we’re building

Voice Echo is a family audio journal PWA:

- Record voice notes with timestamp markers.
- Browse notes via a records list (group by date/tags).
- Play notes with a timeline UI.
- Store long-term audio in Cloudflare R2.

## Core constraints (v1)

- Cloud support from day 1 (R2).
- Low running cost.
- No encryption in v1 (future sharing is supported via tokens + signed reads).
- Single audio file per record.
- Max record length: 12 hours.

## Architecture (simple + cost-aware)

Frontend:

- Static PWA (Vite + TypeScript + Lit + SASS)
- Offline-friendly: cache app shell + cached `index.json`

Backend:

- Minimal Cloudflare Worker for:
  - Cookie sessions (Google Sign-In exchange)
  - Serving per-user `index.json` with ETag/`304`
  - Minting short-lived presigned R2 URLs (upload/download/delete)
  - Updating `index.json` with optimistic concurrency (ETag/If-Match)

Storage:

- R2 stores:
  - `users/{userId}/index.json`
  - `users/{userId}/records/{recordId}/audio.<ext>`
- Local device stores:
  - cached index (indefinitely)
  - cached audio (7 days without access)

## Design decisions (important)

- Cookie auth (login once per device as much as possible).
- Worker never proxies audio bytes (browser ↔ R2 directly).
- Index is a single file per user (avoid R2 listing for normal reads).
- Delete is soft by default (mark deleted in index); purge is manual.
- “Append audio” in v1 is a linked new record via `parentId` (no audio mutation).

## Blocks (high level)

Phase 0 — Foundations

- Monorepo scaffolding and tooling
- Index schema and naming conventions
- Audio format selection policy
- UI constraints (icon-only actions, Lit component approach)

Phase 1 — Worker/API

- Session cookies and CSRF/Origin rules
- `GET /api/index` with ETag/`304`
- `POST /api/presign` with explicit actions (upload/download/delete)
- Commit/soft-delete/purge endpoints with ETag optimistic concurrency

Phase 2 — Client core

- Routing, login, bootstrap
- Index cache + background revalidation
- Records list and record detail basic
- Upload/commit and download/play flows
- Soft delete and purge flows
- Local audio cache retention + PWA offline shell

Phase 3 — Recording + timeline UX

- Fullscreen recorder + timestamp markers
- Timeline sections, scrubbing indicator
- Timeline elements add/preview
- Append behavior (linked record)

Phase 4 — Optional polish

- Budgets, error handling
- Sharing read links via token
- Accessibility/mobile polish

## Room for improvement (bounded)

- Replace KV refresh storage with a Durable Object if strict refresh rotation/revocation is needed.
- Introduce archive indices if `index.json` grows large.
- Consider range streaming improvements later (still single object).
