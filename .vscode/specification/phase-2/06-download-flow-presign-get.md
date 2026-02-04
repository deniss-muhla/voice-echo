# Task 06 — Download/play flow (presign GET)

## Summary

Implement signed download flow to obtain a presigned GET URL and play audio in the browser.

## Requirements

- `POST /api/presign { action:"download", recordId, kind:"audio" }`.
- Use returned URL as the `<audio src>` (or `fetch` + object URL if needed).

## Acceptance Criteria

- Audio plays on record detail page.
- Signed URL is not persisted long-term (store in memory).

## How to Test

- Manual: open record detail and play audio.

## Dependencies

- phase-1/04-api-presign-actions.md
- phase-2/04-record-detail-basic.md

---

## Issue (copy/paste)

Title:
Download/play flow (presign GET)

Description:
Add playback support by requesting a presigned GET URL and using it to play the record’s audio.

Acceptance Criteria:

- Playback works from record detail.

How to Test:

- Play a record.

Dependencies:

- Presign API
