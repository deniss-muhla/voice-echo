# Task 03 — `GET /api/index` with ETag + `304`

## Summary

Serve the per-user `index.json` with strong client caching via ETag, so most refreshes are `304` and cost minimal bandwidth.

## Endpoint

- `GET /api/index`
  - Auth: access cookie
  - If request includes `If-None-Match`, respond `304` when unchanged.
  - On `200`, include `ETag` and `Cache-Control: private, max-age=0, must-revalidate`.

## Requirements

- Resolve key as `users/{userId}/index.json` server-side.
- Must not use R2 `list()`.
- Must return stable ordering and exactly the stored JSON.

## Acceptance Criteria

- First request returns `200` and an `ETag`.
- Second request with `If-None-Match` returns `304` with no body when unchanged.
- Unauthorized requests return `401`.

## How to Test

- Manual:
  - Fetch index twice with `If-None-Match`.
- Automated:
  - Integration test: create index, fetch, fetch with ETag.

## Dependencies

- phase-1/01-session-cookie-auth.md
- phase-0/01-index-json-v1.md

## Cost notes

- Primary cost saver: `304` responses and no `list()`.

---

## Issue (copy/paste)

Title:
`GET /api/index` with ETag + `304`

Description:
Implement `GET /api/index` that returns the per-user `index.json` with `ETag` and supports `If-None-Match` to return `304`.

Acceptance Criteria:

- `ETag` is returned on `200`.
- `304` is returned when unchanged.

How to Test:

- Fetch index twice with `If-None-Match`.

Dependencies:

- Cookie sessions; index schema
