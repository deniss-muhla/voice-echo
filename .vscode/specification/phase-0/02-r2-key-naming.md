# Task 02 — Define R2 object key naming conventions

## Summary

Define stable and safe R2 object keys so the Worker can authorize by prefix and the client can reference audio objects from `index.json` without allowing cross-user access.

## Scope

- In scope:
  - User namespace/prefix rules
  - Keys for index and audio objects
  - File extensions mapping from mime type
- Out of scope:
  - Public sharing keys/tokens (phase 4)

## Requirements

- All user data lives under: `users/{userId}/`.
- Index key: `users/{userId}/index.json`.
- Audio key per record: `users/{userId}/records/{recordId}/audio.{ext}`.
- The Worker must derive keys server-side (client never supplies arbitrary keys).
- `userId` is derived from Google `sub`.

## Acceptance Criteria

- Given a `userId`, `recordId`, and mime type, the key is deterministic.
- Keys are safe to authorize by `startsWith("users/{userId}/")`.

## How to Test

- Manual: verify example record IDs generate expected keys.

## Dependencies

- phase-0/01-index-json-v1.md

## Cost notes

- Deterministic keys avoid R2 list calls and make deletes cheap.

---

## Issue (copy/paste)

Title:
Define R2 object key naming conventions

Description:
Specify deterministic R2 keys for `index.json` and per-record audio objects under `users/{userId}/...` so the Worker can authorize by prefix and the client can store pointers in `index.json`.

Acceptance Criteria:

- Keys are deterministic and derived server-side.
- Authorization can be enforced by user prefix.

How to Test:

- Generate keys for sample users/records and verify format.

Dependencies:

- Define `index.json` schema (v1)
