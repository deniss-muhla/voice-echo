# Task 07 — Soft delete client flow

## Summary

Let user delete a record: call soft-delete API, update local index cache, and remove any local audio cache.

## Requirements

- Soft delete button in record detail.
- Calls `POST /api/records/soft-delete` with `If-Match`.
- Removes local cached audio (if present).

## Acceptance Criteria

- Record disappears from active list.
- Deleted record can be shown in a Deleted filter.

## How to Test

- Delete a record and confirm list updates.

## Dependencies

- phase-1/06-api-soft-delete.md
- phase-2/02-index-cache-and-revalidate.md

---

## Issue (copy/paste)

Title:
Soft delete client flow

Description:
Implement soft delete UI and flow: call soft-delete API with ETag concurrency, update cached index, and remove local audio cache.

Acceptance Criteria:

- Deleted record hidden from active view.

How to Test:

- Delete and confirm list.

Dependencies:

- Soft delete API; index cache
