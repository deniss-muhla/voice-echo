# Task 04 — Record detail basic page

## Summary

Create the record detail page that shows metadata and provides playback entrypoint (timeline details come later).

## Requirements

- Load record summary from local index cache.
- Show title, description, tags, created/updated, duration.
- Provide a play button that triggers signed download flow (Phase 2 task 06).

## Acceptance Criteria

- Navigating to `/records/:id` renders even while offline (using cached index).

## How to Test

- Manual: open record detail with network offline; confirm it renders cached metadata.

## Dependencies

- phase-2/02-index-cache-and-revalidate.md

---

## Issue (copy/paste)

Title:
Record detail basic page

Description:
Create `/records/:id` page that displays metadata from cached index and provides a playback entrypoint.

Acceptance Criteria:

- Detail page renders from cached index offline.

How to Test:

- Open detail page offline.

Dependencies:

- Index caching
