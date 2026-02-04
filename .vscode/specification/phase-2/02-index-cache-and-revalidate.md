# Task 02 — Index cache + revalidate (ETag)

## Summary

Cache `index.json` locally and revalidate using ETag so UI loads instantly and network usage stays low.

## Requirements

- Store `{ etag, indexJson, cachedAt }` locally (IndexedDB or localStorage).
- On `/records` load:
  1. render cached index if present
  2. call `GET /api/index` with `If-None-Match`
  3. on `304` do nothing; on `200` update cache + UI

## Acceptance Criteria

- With cached index, records list renders without waiting for network.
- When index unchanged, network response is `304` most of the time.

## How to Test

- Manual:
  - Load once online.
  - Refresh and observe immediate render + `304` in network panel.
- Automated:
  - Unit test cache read/write and ETag logic.

## Dependencies

- phase-1/03-api-get-index-etag.md

---

## Issue (copy/paste)

Title:
Index cache + revalidate (ETag)

Description:
Cache `index.json` locally and revalidate with `If-None-Match` to keep loads fast and cheap.

Acceptance Criteria:

- Cached render works.
- `304` observed on unchanged index.

How to Test:

- Refresh after initial load; verify `304`.

Dependencies:

- `GET /api/index`
