# Task 05 — Append audio to an existing record (v1)

## Summary

Allow appending additional audio to an existing record via a “+” section at the end of timeline.

## Decision (v1)

Appending to a single audio object is non-trivial and would push us into chunking/multipart work.

For v1, **append creates a new record** and links it to the original using `parentId` in `index.json`.

Implications:

- The list view can optionally group/stack appended records.
- The detail view can present an “appended chain” as one logical timeline.

## Acceptance Criteria

- User can tap “append” and record more audio.
- A new record is created and committed with `parentId=<originalRecordId>`.
- Record detail page displays appended content as a continuation (single logical view).

## How to Test

- Manual: append and verify playback includes new content in expected way.

## Dependencies

- phase-2/05-upload-flow-presign-put-commit.md

---

## Issue (copy/paste)

Title:
Append audio to an existing record (v1)

Description:
Implement append-audio UX by creating a new record linked to the original using `parentId` (no audio file mutation in v1).

Acceptance Criteria:

- Append action produces expected end-of-timeline behavior.

How to Test:

- Append and verify playback.

Dependencies:

- Upload + commit flow
