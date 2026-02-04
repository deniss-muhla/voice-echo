# Task 05 — Commit/update record in index (ETag optimistic concurrency)

## Summary

Provide a minimal endpoint that atomically updates `index.json` to add or edit a record summary, using ETag-based optimistic concurrency to support multi-device use without a Durable Object.

## Endpoint

- `POST /api/records/commit`
  - Header: `If-Match: <indexEtag>` (required)
  - Request:
    - `recordId`
    - `title` (optional)
    - `description` (optional)
    - `tags` (optional)
    - `durationMs` (required)
    - `mimeType` (required)
    - `audioKey` (required)
    - `bytes` (optional)
    - `createdAt` (optional; server may set)
  - Response:
    - `record`: committed record summary
    - `indexEtag`: new ETag

## Requirements

- Enforce max duration: 12h.
- Only allow committing keys under the caller’s prefix.
- On ETag mismatch, return `409` with current `ETag` (and optionally current index).
- Server must keep list ordering consistent.

## Acceptance Criteria

- Commit succeeds with correct `If-Match` and updates index.
- Commit returns new `indexEtag`.
- Commit with stale ETag returns `409`.
- Commit rejects `durationMs > 43200000` with `400`.

## How to Test

- Manual:
  - Fetch index with ETag.
  - Commit a new record with `If-Match`.
  - Commit again with the old ETag and verify `409`.

## Dependencies

- phase-1/03-api-get-index-etag.md
- phase-0/01-index-json-v1.md

## Cost notes

- Single R2 read + conditional write per mutation.

---

## Issue (copy/paste)

Title:
Commit/update record in index (ETag optimistic concurrency)

Description:
Add `POST /api/records/commit` that updates `users/{userId}/index.json` using `If-Match` optimistic concurrency. Enforce 12h max duration.

Acceptance Criteria:

- Correct ETag updates succeed.
- Stale ETag yields `409`.
- Duration > 12h rejected.

How to Test:

- Fetch ETag → commit → retry with old ETag.

Dependencies:

- `GET /api/index`
