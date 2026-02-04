# Task 05 — Upload flow (presign PUT + commit)

## Summary

Implement the client flow to create a new record: presign upload, upload to R2, then commit metadata into index using optimistic concurrency.

## Requirements

- Flow:
  1. `POST /api/presign { action:"upload", recordId, kind:"audio", mimeType }`
  2. Browser `PUT` to presigned URL with required headers
  3. `POST /api/records/commit` with `If-Match: <indexEtag>`
  4. On `409`, refetch index and retry commit
- Enforce 12h duration limit in UI and server.

## Acceptance Criteria

- Successful upload results in new record appearing in `/records`.
- Retry logic handles a forced `409` without data loss.

## How to Test

- Manual:
  - Create a record and confirm it appears after commit.
  - Simulate `409` by committing with stale ETag and confirm retry.

## Dependencies

- phase-1/04-api-presign-actions.md
- phase-1/05-api-commit-record-cas.md
- phase-2/02-index-cache-and-revalidate.md

---

## Issue (copy/paste)

Title:
Upload flow (presign PUT + commit)

Description:
Implement new-record upload: presign PUT, upload to R2, then commit metadata into `index.json` via `If-Match` optimistic concurrency with `409` retry.

Acceptance Criteria:

- New record appears in list after commit.
- `409` conflict is handled by refetch+retry.

How to Test:

- Upload and verify list; simulate conflict.

Dependencies:

- Presign + commit APIs; index caching
