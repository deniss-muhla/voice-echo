# Task 02 — CSRF, Origin checks, and rate limits

## Summary

Because the API uses cookie auth, enforce CSRF protections and basic abuse controls with minimal overhead.

## Requirements

- For all non-GET endpoints, require a valid `Origin` header matching the app’s origin.
- For login (`POST /api/session`), also validate Google `g_csrf_token` (double-submit).
- Add basic rate limiting:
  - by IP for unauthenticated endpoints
  - by userId for authenticated presign/mutations

## Acceptance Criteria

- Cross-origin POSTs are rejected (`403`).
- Missing/invalid Origin is rejected for state-changing endpoints.
- Rate limit returns `429` with a consistent error body.

## How to Test

- Manual:
  - Send a POST with invalid Origin and confirm rejection.
  - Burst presign requests and confirm `429`.

## Dependencies

- phase-1/01-session-cookie-auth.md

## Cost notes

- Use simple in-memory token bucket per isolate as a first pass, or Cloudflare built-ins if available; avoid heavy storage.

---

## Issue (copy/paste)

Title:
CSRF, Origin checks, and rate limits

Description:
Add Origin checks to all state-changing endpoints, validate `g_csrf_token` on login, and add lightweight rate limiting for presign/mutation endpoints.

Acceptance Criteria:

- Invalid Origin requests rejected.
- Rate limiting produces `429`.

How to Test:

- Simulate cross-origin POST + burst requests.

Dependencies:

- Cookie session auth
