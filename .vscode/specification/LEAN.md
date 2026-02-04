# Voice Echo — Lean Issue Set (Reduced Tasks)

This document reduces the number of GitHub issues per phase by grouping the existing granular tasks into a smaller serial set.

Rule of thumb:

- Create GitHub issues from **this** file if you want to work strictly one-by-one.
- Use the linked granular task files as the detailed checklist/acceptance criteria.

---

## Phase 0 — Foundations (2 issues)

### P0-1: Project scaffolding monorepo

Use: phase-0/05-project-scaffolding-monorepo.md

### P0-2: Foundations decisions pack (index + keys + audio + UI)

Includes:

- phase-0/01-index-json-v1.md
- phase-0/02-r2-key-naming.md
- phase-0/03-audio-format-policy.md
- phase-0/04-ui-design-constraints.md

Acceptance focus:

- `index.json` schema locked
- R2 key naming locked
- Audio mime fallback locked + 12h rule
- Icon-only UX + accessibility rule locked

---

## Phase 1 — Worker/API (3 issues)

### P1-1: Auth + security pack (cookies + CSRF + rate limits)

Includes:

- phase-1/01-session-cookie-auth.md
- phase-1/02-csrf-origin-and-rate-limits.md

### P1-2: Index API pack (GET index + commit + soft delete + purge)

Includes:

- phase-1/03-api-get-index-etag.md
- phase-1/05-api-commit-record-cas.md
- phase-1/06-api-soft-delete.md
- phase-1/07-api-purge-record.md

### P1-3: Presign + R2 CORS pack

Includes:

- phase-1/04-api-presign-actions.md
- phase-1/08-r2-cors-config.md

---

## Phase 2 — Client core (5 issues)

### P2-1: App shell + auth bootstrap

Includes:

- phase-2/00-app-shell-routing.md
- phase-2/01-auth-ui-and-bootstrap.md

### P2-2: Records browsing MVP (cache + list + detail + playback)

Includes:

- phase-2/02-index-cache-and-revalidate.md
- phase-2/03-records-list-view.md
- phase-2/04-record-detail-basic.md
- phase-2/06-download-flow-presign-get.md

### P2-3: Create record MVP (upload + commit)

Includes:

- phase-2/05-upload-flow-presign-put-commit.md

Note: depends on Phase 3 recorder UI for actual recording; you can stub with a sample audio file first.

### P2-4: Delete lifecycle UI (soft delete + purge)

Includes:

- phase-2/07-soft-delete-client-flow.md
- phase-2/08-purge-client-flow.md

### P2-5: Offline + local cache pack

Includes:

- phase-2/09-local-audio-cache-retention.md
- phase-2/10-pwa-offline-shell.md

---

## Phase 3 — Recording + timeline UX (3 issues)

### P3-1: Recorder MVP (fullscreen + 12h)

Includes:

- phase-3/00-recording-page-controls.md
- phase-3/01-recording-duration-limit-12h.md

### P3-2: Timeline MVP (sections + scrub + elements)

Includes:

- phase-3/02-timeline-structure-and-sections.md
- phase-3/03-timeline-playback-scrub-indicator.md
- phase-3/04-timeline-elements-add-and-preview.md

### P3-3: Navigation & extras pack (FAB + welcome + append)

Includes:

- phase-3/06-fab-new-record.md
- phase-3/07-welcome-animation.md
- phase-3/05-append-audio-v1.md

---

## Phase 4 — Optional (2 issues)

### P4-1: Quality polish pack

Includes:

- phase-4/00-performance-and-cost-budgets.md
- phase-4/01-error-handling-and-telemetry.md
- phase-4/03-accessibility-and-mobile-ux.md

### P4-2: Sharing MVP

Includes:

- phase-4/02-share-token-read-links.md
