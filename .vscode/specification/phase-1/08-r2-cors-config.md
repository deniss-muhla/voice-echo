# Task 08 — R2 CORS configuration

## Summary

Configure R2 CORS so the browser can use presigned URLs from the app origin for `PUT/GET/DELETE`.

## Requirements

- Allow origin: the deployed app origin(s).
- Methods: `GET`, `PUT`, `DELETE`, `HEAD`.
- Headers: at least `Content-Type`; expose `ETag`.
- Keep policy minimal (do not allow `*` unless necessary).

## Acceptance Criteria

- Browser can `PUT` to a presigned URL without CORS errors.
- Browser can `GET` and read `ETag` header.

## How to Test

- Manual: use app or dev script to upload via presigned URL and confirm no CORS errors.

## Dependencies

- phase-1/04-api-presign-actions.md

---

## Issue (copy/paste)

Title:
R2 CORS configuration

Description:
Set R2 bucket CORS to allow browser usage of presigned URLs (`PUT/GET/DELETE`) from the app origin with minimal headers.

Acceptance Criteria:

- Presigned PUT/GET works in browser without CORS errors.

How to Test:

- Upload and download a file in browser.

Dependencies:

- Presign endpoint
