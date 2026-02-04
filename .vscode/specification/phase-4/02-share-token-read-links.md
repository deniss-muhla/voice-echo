# Task 02 — Share token read links (future)

## Summary

Enable sharing a record with another user using a share token, without encryption.

## Approach

- Worker creates a share token that maps to `{ ownerUserId, recordId }`.
- A share URL resolves to a presigned GET URL for the audio.
- Token can be revoked by owner.

## Requirements

- Tokens are random, unguessable, and can expire.
- Read-only access.
- Does not expose R2 keys beyond what is required.

## Acceptance Criteria

- Recipient can play shared audio via token.
- Owner can revoke token.

## How to Test

- Create share link, open in another browser session, revoke, confirm access removed.

## Dependencies

- phase-1 presign download

---

## Issue (copy/paste)

Title:
Share token read links

Description:
Add share-token links: owner creates a token; link resolves to presigned GET for read-only playback; owner can revoke.

Acceptance Criteria:

- Token link works and is revocable.

How to Test:

- Share → open elsewhere → revoke.

Dependencies:

- Presign download
