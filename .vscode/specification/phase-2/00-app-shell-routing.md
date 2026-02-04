# Task 00 — App shell + routing

## Summary

Create the Lit-based app shell with routes for welcome, login, records list, record detail, and recording.

## Scope

- In scope:
  - Router setup (client-side)
  - Page layout skeleton
- Out of scope:
  - Final UI styling

## Requirements

- Routes:
  - `/` welcome → redirects based on session
  - `/login`
  - `/records`
  - `/records/:id`
  - `/record/new`

## Acceptance Criteria

- Navigating between routes does not full reload.
- Unauthorized users are directed to `/login`.

## How to Test

- Manual: navigate to each route; verify redirects.

## Dependencies

- phase-0/04-ui-design-constraints.md

---

## Issue (copy/paste)

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
