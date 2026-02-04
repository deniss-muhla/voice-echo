# Task 00 — Performance and cost budgets

## Summary

Define explicit performance and cost budgets to keep the app inexpensive to run.

## Requirements

- Define targets:
  - Records list: mostly `304` index revalidations
  - Worker: no audio proxying; keep CPU time minimal
  - Index size: keep under a practical limit (document)
- Document expected request patterns per user session.

## Acceptance Criteria

- Budgets are written and referenced by implementation tasks.

## How to Test

- Manual: measure network requests during typical usage and compare to budgets.

## Dependencies

- phase-1 API tasks

---

## Issue (copy/paste)

Title:
Performance and cost budgets

Description:
Write performance/cost budgets (ETag/304 usage, avoid proxying bytes, index size expectations) to keep ongoing costs low.

Acceptance Criteria:

- Budgets documented and actionable.

How to Test:

- Measure request patterns vs budgets.

Dependencies:

- API specs
