# Task 04 — UI/UX constraints (v1)

## Summary

Lock down UX constraints that affect component design and task splitting: icon-only actions, composable Lit web components, and key screens.

## Scope

- In scope:
  - Required screens (welcome, login, records list, record detail, recording)
  - Icon-only action rule
  - Component modularity rule
- Out of scope:
  - Final visual design system details (can evolve)

## Requirements

- All action UI elements use icons instead of text (tooltips/aria-label allowed).
- Web components built with Lit and designed to be composable.
- Organize code by domain/feature, not by file type.
- Keep files small; single responsibility.

## Acceptance Criteria

- Screen list is explicit and consistent with routing tasks.
- Icon-only rule is stated with accessibility requirements (aria-label).
- Component guidelines are written and can be referenced by implementation tasks.

## How to Test

- Manual: review implemented UI and confirm actions are icon-based and accessible.

## Dependencies

- None

---

## Issue (copy/paste)

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
