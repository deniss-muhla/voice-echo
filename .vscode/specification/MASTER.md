# Voice Echo — Master Specification (Reference)

Date: 2026-02-04

This document is the single reference for what we decided and the full task list (phased) for implementing the Voice Echo PWA.

Goals:

- Audio journal PWA for family use.
- Cloud-first from day 1: Cloudflare R2 is the source of truth.
- Low monthly cost: minimize Worker CPU/requests and R2 reads/writes.
- Offline-friendly: client caches index + (optional) recent audio locally.

Non-goals (v1):

- End-to-end encryption.
- Chunked/multipart uploads.
- Full-text search/transcription.

---

## Key decisions (locked)

### Hosting / runtime

- App: static frontend on Cloudflare (Pages or equivalent static hosting).
- Backend: Cloudflare Worker (minimal) to authenticate and authorize + mint presigned R2 URLs.
- Storage: Cloudflare R2 for `index.json` + audio objects.

### Auth model

- Google Sign-In is used only to prove identity at login.
- Worker issues cookie-based session.
- Cookie sessions should persist “as long as possible” per device (login once ideally).

### R2 access model (security + cost)

- Browser never holds long-lived R2 credentials.
- Worker provides:
  - `GET /api/index` (ETag + `If-None-Match` → `304`)
  - `POST /api/presign` to mint presigned R2 URLs for actions: `upload | download | delete`
  - Index mutation endpoints that update a single R2 `index.json` using optimistic concurrency.
- Worker does not proxy audio bytes.

### Index model (single file)

- Each user has exactly one index file: `users/{userId}/index.json`.
- Index contains everything needed to render the records list (title, timestamps, tags, duration, status, audio pointer).
- Index is the primary read path (no R2 `list()` required in normal operation).

### Delete behavior

- First delete is soft-delete:
  - Cloud: record is marked `status: "deleted"` in index and remains indefinitely.
  - Local: record is removed from local audio cache/storage.
- Purge is a separate user action:
  - Cloud: physically deletes R2 audio object(s) via presigned `DELETE`, then removes record from index.

### Audio constraints

- Max record length: 12 hours.
- Recording format: use `MediaRecorder.isTypeSupported()` and prefer Opus/WebM; fallback to AAC/MP4 for Safari.
- Single audio file per record (no segments/chunks in v1).
- Append audio (v1): implemented as creating a new linked record (`parentId`) rather than mutating the existing audio file.

### Caching rules

- Index caching: client stores `{ etag, index, cachedAt }` locally; renders immediately, then revalidates.
- Server caching: rely primarily on ETag/`304` to reduce bytes; avoid unsafe shared caches for authenticated content.

---

## API overview (minimal surface)

All `POST/PATCH/DELETE` requests MUST enforce `Origin` check (CSRF mitigation) because auth uses cookies.

### Session

- `POST /api/session` — Login exchange (Google credential → session cookies)
- `POST /api/session/refresh` — Optional: renew/rotate if access token expires
- `DELETE /api/session` — Logout
- `GET /api/me` — Return minimal session info (for UI bootstrap)

### Index

- `GET /api/index` — Return index JSON with `ETag`, or `304` on `If-None-Match`

### Presign (single endpoint)

- `POST /api/presign`
  - Request: `{ action: "upload"|"download"|"delete", recordId, kind: "audio", mimeType?, bytes? }`
  - Response: `{ key, method, url, headers, expiresAt }`
  - Server derives `key` under `users/{userId}/records/{recordId}/audio.<ext>`.

### Index mutations (optimistic concurrency)

- `POST /api/records/commit` — Commit new record or update existing metadata + audio pointer.
  - Requires `If-Match: <indexEtag>` header (or `baseIndexEtag` field).
  - On ETag mismatch: return `409` with current ETag.
- `POST /api/records/soft-delete` — Mark record as deleted.
  - Also ETag-protected.
- `POST /api/records/purge` — Permanently delete audio and remove record from index.
  - ETag-protected; uses presigned `DELETE`.

---

## Object naming

- User root: `users/{userId}/`
- Index: `users/{userId}/index.json`
- Audio per record: `users/{userId}/records/{recordId}/audio.{ext}`

Where `userId` is derived from Google `sub` (stable per Google account and client id).

---

## Index schema (v1)

Index JSON is the only metadata source the list view needs.

```json
{
  "schema": "voice-echo.index.v1",
  "rev": 1,
  "updatedAt": "2026-02-04T10:12:33.456Z",
  "records": [
    {
      "id": "01HZYK3D7WQ9Y8Y6K2J3R4T5V6",
      "parentId": null,
      "createdAt": "2026-02-04T09:01:02.003Z",
      "updatedAt": "2026-02-04T09:02:10.000Z",
      "createdDay": "2026-02-04",
      "title": "Morning note",
      "description": "Optional text; tags may be embedded like #work",
      "tags": ["work", "gratitude"],
      "durationMs": 42310,
      "status": "active",
      "deletedAt": null,
      "audio": {
        "key": "users/u_123/records/01HZY.../audio.m4a",
        "mime": "audio/mp4",
        "bytes": 182734,
        "etag": "\"...\""
      }
    }
  ]
}
```

Records list filtering:

- Default view shows only `status=active`.
- Deleted view shows `status=deleted` and `deletedAt != null`.

---

## Phases and tasks

Each task file contains copy/paste-ready issue text.

If you prefer fewer GitHub issues, see `.vscode/specification/LEAN.md` for a reduced, serial issue set per phase that references these granular tasks.

### Phase 0 — Product + foundations (parallel)

- phase-0/00-spec-template.md
- phase-0/05-project-scaffolding-monorepo.md
- phase-0/01-index-json-v1.md
- phase-0/02-r2-key-naming.md
- phase-0/03-audio-format-policy.md
- phase-0/04-ui-design-constraints.md

### Phase 1 — Worker API + security (parallel)

- phase-1/00-worker-project-skeleton.md
- phase-1/01-session-cookie-auth.md
- phase-1/02-csrf-origin-and-rate-limits.md
- phase-1/03-api-get-index-etag.md
- phase-1/04-api-presign-actions.md
- phase-1/05-api-commit-record-cas.md
- phase-1/06-api-soft-delete.md
- phase-1/07-api-purge-record.md
- phase-1/08-r2-cors-config.md

### Phase 2 — Client core + sync (parallel)

- phase-2/00-app-shell-routing.md
- phase-2/01-auth-ui-and-bootstrap.md
- phase-2/02-index-cache-and-revalidate.md
- phase-2/03-records-list-view.md
- phase-2/04-record-detail-basic.md
- phase-2/05-upload-flow-presign-put-commit.md
- phase-2/06-download-flow-presign-get.md
- phase-2/07-soft-delete-client-flow.md
- phase-2/08-purge-client-flow.md
- phase-2/09-local-audio-cache-retention.md
- phase-2/10-pwa-offline-shell.md

### Phase 3 — Recording + timeline UX (parallel)

- phase-3/00-recording-page-controls.md
- phase-3/01-recording-duration-limit-12h.md
- phase-3/02-timeline-structure-and-sections.md
- phase-3/03-timeline-playback-scrub-indicator.md
- phase-3/04-timeline-elements-add-and-preview.md
- phase-3/05-append-audio-v1.md
- phase-3/06-fab-new-record.md
- phase-3/07-welcome-animation.md

### Phase 4 — Polish + sharing-ready (optional)

- phase-4/00-performance-and-cost-budgets.md
- phase-4/01-error-handling-and-telemetry.md
- phase-4/02-share-token-read-links.md
- phase-4/03-accessibility-and-mobile-ux.md

---

## Issue template (copy/paste)

Use this structure when creating GitHub issues from task files:

Title:
<from task>

Description:
<from task>

Acceptance Criteria:

- ...

How to Test:

- ...

Dependencies:

- ...
