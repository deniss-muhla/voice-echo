# Task 01 — Enforce 12 hour recording limit

## Summary

Enforce maximum recording duration of 12 hours in the recorder UI and at server commit.

## Requirements

- Client stops recording or disables “continue” at 12h.
- Show a clear UI state when limit reached.
- Server commit rejects `durationMs > 43200000`.

## Acceptance Criteria

- It’s impossible to commit a record longer than 12 hours.

## How to Test

- Manual: dev-only time override to simulate reaching 12h.
- Automated: unit test duration guard.

## Dependencies

- phase-1/05-api-commit-record-cas.md
- phase-3/00-recording-page-controls.md

---

## Issue (copy/paste)

Title:
Enforce 12 hour recording limit

Description:
Add a 12h max duration guard in the recording UI and ensure server commit rejects longer durations.

Acceptance Criteria:

- Duration >12h cannot be committed.

How to Test:

- Simulate 12h elapsed and verify behavior.

Dependencies:

- Commit API; recorder UI
