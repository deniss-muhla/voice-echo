# Task 02 — Record detail timeline structure + sections

## Summary

Render the record detail as a vertical timeline divided into sections based on timestamp markers created during recording.

## Requirements

- Timeline shows sections:
  - From start → first marker
  - Between markers
  - Last marker → end
- Each section has a play control that seeks to the section start and plays.
- Timeline minimum height is 100% viewport.
- Section heights are proportional to section duration; timeline may grow beyond viewport to fit content.

## Acceptance Criteria

- Timeline sections match markers and audio duration.
- Clicking a section starts playback at correct timestamp.

## How to Test

- Manual: create a record with 2 markers; verify 3 sections and correct seeking.

## Dependencies

- phase-2/06-download-flow-presign-get.md
- phase-3/00-recording-page-controls.md

---

## Issue (copy/paste)

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
