# Task 09 — Local audio cache retention (7 days)

## Summary

Implement local caching of audio for faster access, with automatic deletion after 7 days of not being accessed. Index cache persists indefinitely.

## Requirements

- Store audio blobs in IndexedDB Cache (or similar) with `lastAccessedAt`.
- On access, update `lastAccessedAt`.
- Periodic cleanup removes audio blobs older than 7 days.
- Index cache is not deleted automatically.

## Acceptance Criteria

- Audio older than 7 days without access is removed.
- Recently played audio stays cached.

## How to Test

- Use dev-only override to simulate time passage and verify cleanup.

## Dependencies

- phase-2/06-download-flow-presign-get.md

---

## Issue (copy/paste)

Title:
Local audio cache retention (7 days)

Description:
Cache downloaded audio locally for speed and delete cached audio after 7 days without access; keep index cache indefinitely.

Acceptance Criteria:

- Old audio cache entries are deleted; recent remain.

How to Test:

- Simulate time and run cleanup.

Dependencies:

- Download flow
