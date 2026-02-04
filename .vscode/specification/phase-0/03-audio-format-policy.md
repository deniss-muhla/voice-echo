# Task 03 — Audio format and recording policy (v1)

## Summary

Define audio recording format selection (cross-browser) and recording constraints for voice journaling.

## Scope

- In scope:
  - `MediaRecorder` mime selection logic
  - File extension mapping
  - Max recording duration: 12 hours
- Out of scope:
  - Server-side transcoding
  - Chunked uploads

## Requirements

- Prefer best voice compression where available:
  - Try `audio/webm;codecs=opus` (Chrome/Edge/Firefox)
  - Fallback to `audio/mp4` / AAC on Safari/iOS
- Determine mime type at runtime using `MediaRecorder.isTypeSupported()`.
- Store final mime type and duration in index.
- Enforce duration max: $12\,h$.

## Acceptance Criteria

- On Chrome/Firefox, recorded file uses Opus/WebM when supported.
- On Safari (macOS/iOS), recorded file uses MP4/AAC when supported.
- Recording stops (or blocks commit) at 12 hours.

## How to Test

- Manual:
  - Test on Chromium and Safari and confirm selected mime type.
  - Confirm recording cannot exceed 12h (use a mocked timer in dev build).
- Automated:
  - Unit test the mime selection function using a mocked `isTypeSupported`.

## Dependencies

- None

## Cost notes

- No server-side transcoding keeps cost near-zero.

---

## Issue (copy/paste)

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
