# Task 10 — PWA offline app shell

## Summary

Add PWA manifest and service worker to cache the app shell so the UI loads offline and can show cached index.

## Requirements

- Web app manifest (name, icons, theme).
- Service worker caches:
  - HTML/CSS/JS bundles
  - app icons
- Do not cache presigned URLs.

## Acceptance Criteria

- App loads offline after first load.
- Records list renders from cached index offline.

## How to Test

- Chrome devtools offline mode: reload and verify app shell loads.

## Dependencies

- phase-2/02-index-cache-and-revalidate.md

---

## Issue (copy/paste)

Title:
PWA offline app shell

Description:
Add manifest and service worker caching for the app shell so Voice Echo loads offline and can render cached index.

Acceptance Criteria:

- App loads offline.

How to Test:

- Offline reload after first visit.

Dependencies:

- Index caching
