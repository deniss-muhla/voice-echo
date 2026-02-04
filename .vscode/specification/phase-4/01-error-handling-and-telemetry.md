# Task 01 — Error handling and minimal telemetry

## Summary

Add consistent error handling and lightweight telemetry suitable for a personal family app.

## Requirements

- Standard error envelope in Worker responses.
- Client shows actionable errors for upload/playback/auth.
- Optional: minimal error logging endpoint (rate-limited) or use console logging only.

## Acceptance Criteria

- Errors are visible and understandable.
- No sensitive data is logged.

## How to Test

- Manual: force auth failure, upload failure, and confirm UI behavior.

## Dependencies

- phase-1 endpoints

---

## Issue (copy/paste)

Title:
Error handling and minimal telemetry

Description:
Standardize Worker error responses and implement user-friendly client error states. Keep telemetry minimal and privacy-friendly.

Acceptance Criteria:

- Common failures show clear messages.

How to Test:

- Force failures and confirm UI.

Dependencies:

- API endpoints
