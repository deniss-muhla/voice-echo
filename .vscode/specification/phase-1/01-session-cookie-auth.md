# Task 01 — Cookie session auth (Google login exchange)

## Summary

Implement login via Google Sign-In credential exchange and establish a long-lived, device-persistent cookie session.

## Decision

- Use cookie auth for all `/api/*` endpoints.
- Session should last as long as possible on a device.
- Use two cookies:
  - Access cookie (shorter, e.g., 7–30 days)
  - Refresh cookie (longer, e.g., 365 days) with rotation

## Endpoints

- `POST /api/session`
  - Request: `{ credential: <google_id_token>, g_csrf_token: <string> }`
  - Response: `204`
  - Sets cookies: `__Host-ve_access=...` and `__Host-ve_refresh=...`
- `POST /api/session/refresh`
  - Request: empty
  - Response: `204` (rotates cookies)
- `DELETE /api/session`
  - Response: `204` (clears cookies + revokes refresh token)
- `GET /api/me`
  - Response: `200 { userId }` or `401`

## Requirements

- Verify Google ID token at login:
  - Validate signature using Google JWKS
  - Validate `iss`, `aud`, `exp`
  - Derive `userId = sub`
- Store refresh token IDs in KV to allow revocation and rotation.
- Access validation does not require contacting Google.

## Acceptance Criteria

- After `POST /api/session`, subsequent `GET /api/me` returns `200`.
- Refresh rotates refresh token (old refresh cannot be reused).
- Logout invalidates session immediately.

## How to Test

- Manual:
  - Login, confirm cookies present and `GET /api/me` works.
  - Logout, confirm `GET /api/me` returns `401`.
- Automated:
  - Unit test token verification helpers and cookie parsing.

## Dependencies

- phase-1/00-worker-project-skeleton.md

## Cost notes

- KV is only used on login/refresh/logout; normal `GET /api/index` uses access cookie validation only.

---

## Issue (copy/paste)

Title:
Cookie session auth (Google login exchange)

Description:
Implement Google credential exchange at `POST /api/session`, set long-lived cookies, support refresh rotation, logout, and a `GET /api/me` bootstrap endpoint.

Acceptance Criteria:

- Login sets cookies and enables authenticated requests.
- Refresh rotates and old refresh is invalid.
- Logout revokes session.

How to Test:

- Login → `GET /api/me` → logout → `GET /api/me`.

Dependencies:

- Worker skeleton
