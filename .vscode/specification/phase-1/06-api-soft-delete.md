# Task 06 — Soft delete record (mark deleted in index)

## Summary

Provide an endpoint that marks a record as deleted in `index.json` without deleting the audio object.

## Endpoint

- `POST /api/records/soft-delete`
  - Header: `If-Match: <indexEtag>`
  - Request: `{ recordId }`
  - Response: `{ indexEtag, record }`

## Requirements

- Mark `status="deleted"` and set `deletedAt`.
- Deleted records remain indefinitely.
- Active list should hide deleted records by default.

## Acceptance Criteria

- Soft-deleted record no longer appears in active list.
- Deleted view can show it.
- Stale ETag yields `409`.

## How to Test

- Soft delete a record and re-fetch index.

## Dependencies

- phase-1/05-api-commit-record-cas.md

---

## Issue (copy/paste)

Title:
Soft delete record (mark deleted in index)

Description:
Add `POST /api/records/soft-delete` that marks the record `status=deleted` and sets `deletedAt`, using `If-Match` concurrency.

Acceptance Criteria:

- Deleted records hidden from active list.
- Deleted records persist until purge.

How to Test:

- Soft delete and confirm index changes.

Dependencies:

- Commit/update record
