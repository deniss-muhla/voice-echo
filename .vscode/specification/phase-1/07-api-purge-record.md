# Task 07 — Purge record (permanent delete)

## Summary

Purge permanently deletes the audio object in R2 and removes the record entry from `index.json`.

## Endpoint

- `POST /api/records/purge`
  - Header: `If-Match: <indexEtag>`
  - Request: `{ recordId }`
  - Response: `{ indexEtag }`

## Requirements

- Purge is only allowed for records in `status=deleted` (safety).
- Purge flow:
  1. Authorize key by user prefix
  2. Delete audio object in R2
  3. Remove index entry
- Must be idempotent (purge twice yields same end state).

## Acceptance Criteria

- Purge deletes the audio object and removes index entry.
- Purge is blocked if record is not deleted.
- Stale ETag yields `409`.

## How to Test

- Soft delete record, then purge it, then confirm download fails and index entry is gone.

## Dependencies

- phase-1/06-api-soft-delete.md
- phase-1/04-api-presign-actions.md (for presigned delete if used)

## Cost notes

- Direct delete avoids additional metadata systems.

---

## Issue (copy/paste)

Title:
Purge record (permanent delete)

Description:
Add `POST /api/records/purge` that permanently deletes the R2 audio object and removes the record from `index.json` (only if already soft-deleted).

Acceptance Criteria:

- Purge only allowed on deleted records.
- Audio object deleted; index entry removed.

How to Test:

- Soft delete → purge → verify object gone.

Dependencies:

- Soft delete; presign delete
