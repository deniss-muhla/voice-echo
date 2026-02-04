# Voice Echo — GitHub Issues Export

This file aggregates copy/paste-ready issue text for every task spec.

If you want fewer issues, start from `.vscode/specification/LEAN.md` and use the granular tasks here as checklists.

Source of truth for details remains: `.vscode/specification/MASTER.md` and per-task files.

---

## Phase 0 — Foundations

### Project scaffolding (pnpm + Turborepo + Vite + Lit + Worker)

Title:
Project scaffolding (pnpm + Turborepo + Vite + Lit + Worker)

Description:
Scaffold the monorepo for Voice Echo: `apps/web` (Vite+TS+Lit+SASS), `apps/worker` (Wrangler+TS), and shared packages. Add `pnpm` workspaces and Turborepo pipelines plus basic quality scripts (format/typecheck/test).

Acceptance Criteria:

- `pnpm install` succeeds.
- `pnpm dev` runs web app.
- `pnpm worker:dev` runs worker.
- `pnpm typecheck` + `pnpm test` run.

How to Test:

- Run the above commands and verify output.

Dependencies:

- None

---

### Define `index.json` schema (v1)

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

---

### Define R2 object key naming conventions

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

---

### Define audio format and recording policy (v1)

Title:
Define audio format and recording policy (v1)

Description:
Specify how the client chooses a `MediaRecorder` mime type (prefer Opus/WebM, fallback MP4/AAC) and enforce a max record duration of 12 hours.

Acceptance Criteria:

- Mime type selection is deterministic and cross-browser.
- 12h duration constraint is explicit.

How to Test:

- Verify mime selection on Chromium vs Safari; verify duration guard.

Dependencies:

- None

---

### Define UI/UX constraints (v1)

Title:
Define UI/UX constraints (v1)

Description:
Document required screens, icon-only action UI rule (with accessibility labels), and Lit component modularity guidelines to keep implementation consistent.

Acceptance Criteria:

- Rules are explicit and implementable.

How to Test:

- UI review + accessibility spot checks.

Dependencies:

- None

---

## Phase 1 — Worker/API

### Worker project skeleton (Cloudflare)

Title:
Worker project skeleton (Cloudflare)

Description:
Create a Cloudflare Worker package with R2 + KV bindings and a `/health` endpoint. Document bindings and local dev steps.

Acceptance Criteria:

- Local dev works (`wrangler dev`).
- `/health` returns `{ ok: true }`.

How to Test:

- Start dev server and curl `/health`.

Dependencies:

- Phase 0 conventions

---

### Cookie session auth (Google login exchange)

Title:
Cookie session auth (Google login exchange)

Description:
Implement Google credential exchange at `POST /api/session`, set long-lived cookies, support refresh rotation, logout, and a `GET /api/me` bootstrap endpoint.

Acceptance Criteria:

- Login sets cookies and enables authenticated requests.
- Refresh rotates and old refresh is invalid.
- Logout revokes session.

How to Test:

- Login → `GET /api/me` → logout → `GET /api/me`.

Dependencies:

- Worker skeleton

---

### CSRF, Origin checks, and rate limits

Title:
CSRF, Origin checks, and rate limits

Description:
Add Origin checks to all state-changing endpoints, validate `g_csrf_token` on login, and add lightweight rate limiting for presign/mutation endpoints.

Acceptance Criteria:

- Invalid Origin requests rejected.
- Rate limiting produces `429`.

How to Test:

- Simulate cross-origin POST + burst requests.

Dependencies:

- Cookie session auth

---

### `GET /api/index` with ETag + `304`

Title:
`GET /api/index` with ETag + `304`

Description:
Implement `GET /api/index` that returns the per-user `index.json` with `ETag` and supports `If-None-Match` to return `304`.

Acceptance Criteria:

- `ETag` is returned on `200`.
- `304` is returned when unchanged.

How to Test:

- Fetch index twice with `If-None-Match`.

Dependencies:

- Cookie sessions; index schema

---

### `POST /api/presign` (upload/download/delete)

Title:
`POST /api/presign` (upload/download/delete)

Description:
Create a single authenticated endpoint that returns presigned R2 URLs for `upload`, `download`, and `delete`, with server-derived keys and short expirations.

Acceptance Criteria:

- Returns correct method/URL/headers for each action.
- Enforces user prefix and mime allowlist.

How to Test:

- Use curl to PUT/GET/DELETE via presigned URLs.

Dependencies:

- Cookie sessions; key naming

---

### Commit/update record in index (ETag optimistic concurrency)

Title:
Commit/update record in index (ETag optimistic concurrency)

Description:
Add `POST /api/records/commit` that updates `users/{userId}/index.json` using `If-Match` optimistic concurrency. Enforce 12h max duration.

Acceptance Criteria:

- Correct ETag updates succeed.
- Stale ETag yields `409`.
- Duration > 12h rejected.

How to Test:

- Fetch ETag → commit → retry with old ETag.

Dependencies:

- `GET /api/index`

---

### Soft delete record (mark deleted in index)

Title:
Soft delete record (mark deleted in index)

Description:
Add `POST /api/records/soft-delete` that marks the record `status=deleted` and sets `deletedAt`, using `If-Match` concurrency.

Acceptance Criteria:

- Deleted records hidden from active list.
- Deleted records persist until purge.

How to Test:

- Soft delete and confirm index changes.

Dependencies:

- Commit/update record

---

### Purge record (permanent delete)

Title:
Purge record (permanent delete)

Description:
Add `POST /api/records/purge` that permanently deletes the R2 audio object and removes the record from `index.json` (only if already soft-deleted).

Acceptance Criteria:

- Purge only allowed on deleted records.
- Audio object deleted; index entry removed.

How to Test:

- Soft delete → purge → verify object gone.

Dependencies:

- Soft delete; presign delete

---

### R2 CORS configuration

Title:
R2 CORS configuration

Description:
Set R2 bucket CORS to allow browser usage of presigned URLs (`PUT/GET/DELETE`) from the app origin with minimal headers.

Acceptance Criteria:

- Presigned PUT/GET works in browser without CORS errors.

How to Test:

- Upload and download a file in browser.

Dependencies:

- Presign endpoint

---

## Phase 2 — Client core

### App shell + routing

Title:
App shell + routing

Description:
Create Lit app shell and client routes for welcome/login/records list/record detail/new recording.

Acceptance Criteria:

- Routes work without reload; auth redirects to login.

How to Test:

- Navigate routes in dev server.

Dependencies:

- UI constraints

---

### Auth UI + bootstrap

Title:
Auth UI + bootstrap

Description:
Add Google login UI and bootstrap logic using `GET /api/me` to determine auth state and redirect appropriately.

Acceptance Criteria:

- Unauthorized redirected to login.
- Login persists on refresh.

How to Test:

- Login → refresh → still authenticated.

Dependencies:

- Cookie auth API

---

### Index cache + revalidate (ETag)

Title:
Index cache + revalidate (ETag)

Description:
Cache `index.json` locally and revalidate with `If-None-Match` to keep loads fast and cheap.

Acceptance Criteria:

- Cached render works.
- `304` observed on unchanged index.

How to Test:

- Refresh after initial load; verify `304`.

Dependencies:

- `GET /api/index`

---

### Records list view (grouping)

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

---

### Record detail basic page

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

---

### Upload flow (presign PUT + commit)

Title:
Upload flow (presign PUT + commit)

Description:
Implement new-record upload: presign PUT, upload to R2, then commit metadata into `index.json` via `If-Match` optimistic concurrency with `409` retry.

Acceptance Criteria:

- New record appears in list after commit.
- `409` conflict is handled by refetch+retry.

How to Test:

- Upload and verify list; simulate conflict.

Dependencies:

- Presign + commit APIs; index caching

---

### Download/play flow (presign GET)

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

---

### Soft delete client flow

Title:
Soft delete client flow

Description:
Implement soft delete UI and flow: call soft-delete API with ETag concurrency, update cached index, and remove local audio cache.

Acceptance Criteria:

- Deleted record hidden from active view.

How to Test:

- Delete and confirm list.

Dependencies:

- Soft delete API; index cache

---

### Purge deleted records (client flow)

Title:
Purge deleted records (client flow)

Description:
Build UI to purge deleted records by calling purge API and updating index. Deleted records remain indefinitely until purge.

Acceptance Criteria:

- Purged records removed from index.

How to Test:

- Soft delete then purge.

Dependencies:

- Purge API

---

### Local audio cache retention (7 days)

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

---

### PWA offline app shell

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

---

## Phase 3 — Recording + timeline

### Recording page (fullscreen) + controls

Title:
Recording page (fullscreen) + controls

Description:
Build `/record/new` fullscreen recording UI with icon-only controls: start/pause/resume/add timestamp/end, and show recording stats.

Acceptance Criteria:

- Can record and create markers.

How to Test:

- Record, add marker, stop.

Dependencies:

- Audio policy; UI constraints

---

### Enforce 12 hour recording limit

Title:
Enforce 12 hour recording limit

Description:
Add a 12h max duration guard in the recording UI and ensure server commit rejects longer durations.

Acceptance Criteria:

- Duration >12h cannot be committed.

How to Test:

- Simulate 12h elapsed and verify behavior.

Dependencies:

- Commit API; recorder UI

---

### Record detail timeline structure + sections

Title:
Record detail timeline structure + sections

Description:
Render record detail as a vertical timeline with proportional section heights and section play controls that seek to the section start.

Acceptance Criteria:

- Section count/positions correct; seeking works.

How to Test:

- Record with markers; verify sections and seek.

Dependencies:

- Playback signed GET; recorder markers

---

### Timeline playback indicator + scrubbing

Title:
Timeline playback indicator + scrubbing

Description:
Add playback position indicator on timeline and allow scrubbing to change audio current time.

Acceptance Criteria:

- Indicator updates; scrubbing works.

How to Test:

- Play and drag scrub.

Dependencies:

- Timeline sections

---

### Timeline elements (add + preview)

Title:
Timeline elements (add + preview)

Description:
Add support for timestamp-attached elements (text/image/link/emoji/divider) with card row rendering and preview modal.

Acceptance Criteria:

- Add + preview works.

How to Test:

- Add elements and open preview.

Dependencies:

- Timeline sections

---

### Append audio to an existing record (v1)

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

---

### Floating action button (new record)

Title:
Floating action button (new record)

Description:
Add a bottom-right FAB with plus icon that navigates to `/record/new`.

Acceptance Criteria:

- FAB present; navigates correctly.

How to Test:

- Click FAB.

Dependencies:

- Routing

---

### Welcome animation screen

Title:
Welcome animation screen

Description:
Add a welcome screen with a short animation that fades out and routes to login or records based on session.

Acceptance Criteria:

- Transitions correctly in both auth states.

How to Test:

- Visit `/` logged in/out.

Dependencies:

- Auth bootstrap

---

## Phase 4 — Optional polish + sharing

### Performance and cost budgets

Title:
Performance and cost budgets

Description:
Write performance/cost budgets (ETag/304 usage, avoid proxying bytes, index size expectations) to keep ongoing costs low.

Acceptance Criteria:

- Budgets documented and actionable.

How to Test:

- Measure request patterns vs budgets.

Dependencies:

- API specs

---

### Error handling and minimal telemetry

Title:
Error handling and minimal telemetry

Description:
Standardize Worker error responses and implement user-friendly client error states. Keep telemetry minimal and privacy-friendly.

Acceptance Criteria:

- Common failures show clear messages.

How to Test:

- Force failures and confirm UI.

Dependencies:

- API endpoints

---

### Share token read links

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

---

### Accessibility + mobile UX polish

Title:
Accessibility + mobile UX polish

Description:
Ensure icon-only controls are accessible (aria-label), touch-friendly, and work well on mobile browsers.

Acceptance Criteria:

- Accessibility checks pass; mobile usability improved.

How to Test:

- Lighthouse + mobile device testing.

Dependencies:

- UI implementation
