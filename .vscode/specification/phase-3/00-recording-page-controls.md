# Task 00 — Recording page (fullscreen) + controls

## Summary

Implement the fullscreen recording experience with icon-only controls: start, pause, add timestamp (opens modal), end recording.

## Requirements

- Route: `/record/new`.
- Fullscreen recording component with:
  - Start
  - Pause/resume
  - Add timestamp: pauses recording and opens modal to add a media element placeholder (text/image/link/divider) tied to current time
  - End: stops recording and navigates to record detail page
- Show recording stats: elapsed time, state.

## Acceptance Criteria

- Recording can start/pause/resume/stop.
- Add timestamp creates a timeline marker at current time.
- All actions are icon-only with `aria-label`.

## How to Test

- Manual: record short audio, pause/resume, add marker, end recording.

## Dependencies

- phase-0/04-ui-design-constraints.md
- phase-0/03-audio-format-policy.md

---

## Issue (copy/paste)

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
