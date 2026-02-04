# Task 01 — Define `index.json` schema (v1)

## Summary

Define the single per-user R2 index file schema that is sufficient to render the records list (grouping by date/tags), support soft delete + manual purge, and enable low-cost caching via ETag revalidation.

## Scope

- In scope:
  - Exact JSON schema (fields, types, defaults)
  - Sorting/grouping rules
  - Soft delete representation and purge rules
  - Size/scale considerations and compaction guidance
- Out of scope:
  - Timeline media elements schema (handled later)
  - Chunked audio / multipart uploads (explicitly not v1)

## Requirements

- One index file per user at `users/{userId}/index.json`.
- Contains enough data for records list UI without additional R2 reads.
- Records support `status: "active" | "deleted"`.
- Deleted records remain indefinitely until purged.
- Each record has `durationMs` and must satisfy max length: $12\,h = 43{,}200{,}000\,ms$.
- Index ordering for list view is deterministic: newest first.
- Tags are stored as array; description may contain inline tags like `#tag` (client may parse).

## Proposed schema

Top-level:

- `schema`: string literal `voice-echo.index.v1`
- `rev`: integer, increments on every server write
- `updatedAt`: ISO string
- `records`: array of record summaries, sorted by `createdAt` desc (or `updatedAt` desc; choose one and lock it)

Record summary:

- `id`: string (ULID recommended; sortable)
- `parentId`: string | null (set when record is an append of another record)
- `createdAt`: ISO string
- `updatedAt`: ISO string
- `createdDay`: `YYYY-MM-DD` (UTC)
- `title`: string
- `description`: string (optional)
- `tags`: string[] (optional)
- `durationMs`: number
- `status`: `active | deleted`
- `deletedAt`: ISO string | null
- `audio`:
  - `key`: string (R2 object key)
  - `mime`: string
  - `bytes`: number (optional; if known)
  - `etag`: string (optional; if known)

Notes:

- Keep this file compact. Avoid duplicating data that can be derived.
- If the index grows too large, introduce `archive` later; not in v1.

## Acceptance Criteria

- A JSON schema can be written from this doc and validates example payloads.
- Records list can be rendered using only the index fields.
- Soft delete can be represented without deleting audio objects.
- Purge can remove audio objects and remove the index entry.
- Sorting/grouping is unambiguous (documented).
- Max duration rule is explicit and can be enforced server-side.

## How to Test

- Manual:
  - Create 2–3 example index files and confirm list UI needs no extra fields.
  - Mark an entry deleted and confirm it can be hidden from active view.
- Automated:
  - Add a small JSON schema validator test for index samples.

## Dependencies

- None (this is foundational)

## Cost notes

- Single read on list view (index only) + ETag `304` avoids repeated downloads.

---

## Issue (copy/paste)

Title:
Define `index.json` schema (v1)

Description:
Define the per-user `users/{userId}/index.json` schema used for the records list, soft delete, and caching. Include sorting/grouping rules, max record length (12h), and fields required for R2 audio object pointers.

Acceptance Criteria:

- Schema includes record summary fields needed for list/grouping.
- Soft delete is represented and remains indefinitely until purge.
- Max duration (12h) is specified.

How to Test:

- Validate sample JSON against schema; confirm list UI needs no extra fields.

Dependencies:

- None
