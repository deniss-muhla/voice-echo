# Task 04 — `POST /api/presign` (upload/download/delete)

## Summary

Implement a single presign endpoint to mint short-lived presigned R2 URLs for uploading, downloading, and deleting audio objects.

## Endpoint

- `POST /api/presign`
  - Request:
    - `action`: `upload | download | delete`
    - `recordId`: string
    - `kind`: `audio`
    - `mimeType` (upload only): string
    - `bytes` (upload only): number (optional)
  - Response:
    - `key`: derived server-side
    - `method`: `PUT | GET | DELETE`
    - `url`: presigned URL
    - `headers`: required headers for the request (at least `Content-Type` on upload)
    - `expiresAt`: ISO

## Requirements

- Keys must be derived server-side using phase-0 naming rules.
- Authorize by user prefix; no cross-user keys.
- TTL is short (minutes).
- Upload allowed only for supported mime types.

## Acceptance Criteria

- Upload presign returns a `PUT` URL and required headers.
- Download presign returns a `GET` URL for the caller’s audio.
- Delete presign returns a `DELETE` URL for purge flows.
- Attempting to presign another user’s recordId is rejected.

## How to Test

- Manual:
  - Presign upload then `PUT` a file via curl.
  - Presign download then `GET` it.
  - Presign delete then delete it.

## Dependencies

- phase-1/01-session-cookie-auth.md
- phase-0/02-r2-key-naming.md

## Cost notes

- Presigned URLs keep audio bytes off Workers.

---

## Issue (copy/paste)

Title:
`POST /api/presign` (upload/download/delete)

Description:
Create a single authenticated endpoint that returns presigned R2 URLs for `upload`, `download`, and `delete`, with server-derived keys and short expirations.

Acceptance Criteria:

- Returns correct method/URL/headers for each action.
- Enforces user prefix and mime allowlist.

How to Test:

- Use curl to PUT/GET/DELETE via presigned URLs.

Dependencies:

- Cookie sessions; key naming
