# Task 08 — Purge deleted records (client flow)

## Summary

Provide UI to permanently purge deleted records: call purge endpoint and update index.

## Requirements

- Deleted records view includes “Purge” action (per item) and/or “Clear all deleted”.
- Calls `POST /api/records/purge` with `If-Match`.

## Acceptance Criteria

- Purged record is removed from index entirely.
- Attempt to purge non-deleted record is blocked in UI.

## How to Test

- Soft delete then purge a record.

## Dependencies

- phase-1/07-api-purge-record.md

---

## Issue (copy/paste)

Title:
Purge deleted records (client flow)

Description:
Build UI to purge deleted records by calling purge API and updating index. Deleted records remain indefinitely until purge.

Acceptance Criteria:

- Purged records removed from index.

How to Test:

- Soft delete then purge.

Dependencies:

- Purge API
