# Task 01 — Auth UI + bootstrap

## Summary

Implement login UI (Google Sign-In) and app bootstrap that checks session via `GET /api/me`.

## Requirements

- Login page shows Google sign-in button.
- After login success, app navigates to `/records`.
- App bootstrap calls `GET /api/me` to decide auth state.

## Acceptance Criteria

- If no session, `/records` redirects to `/login`.
- After login, `/records` loads without requiring another login.

## How to Test

- Manual: open app, login, refresh page, confirm session persists.

## Dependencies

- phase-1/01-session-cookie-auth.md
- phase-2/00-app-shell-routing.md

---

## Issue (copy/paste)

Title:
Auth UI + bootstrap

Description:
Add Google login UI and bootstrap logic using `GET /api/me` to determine auth state and redirect appropriately.

Acceptance Criteria:

- Unauthorized redirected to login.
- Login persists on refresh.

How to Test:

- Login → refresh → still authenticated.

Dependencies:

- Cookie auth API
