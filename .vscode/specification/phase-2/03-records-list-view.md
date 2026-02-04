# Task 03 — Records list view (grouping)

## Summary

Render the records list using only the cached/remote index file, supporting grouping by date and by tags.

## Requirements

- Default sort: newest first (per index ordering).
- Group modes:
  - By date: Year → Month → Day (`createdDay`)
  - By tags: tag name → titles
- Deleted items are hidden from default view.

## Acceptance Criteria

- List renders with both grouping modes.
- Switching grouping does not refetch index.

## How to Test

- Manual: create sample index with tags and dates and verify grouping.

## Dependencies

- phase-0/01-index-json-v1.md
- phase-2/02-index-cache-and-revalidate.md

---

## Issue (copy/paste)

Title:
Records list view (grouping)

Description:
Build records list UI from `index.json`, including grouping by date and tags, and hiding deleted records by default.

Acceptance Criteria:

- Group by date and tags works.

How to Test:

- Use sample index and verify grouping.

Dependencies:

- Index cache + schema
