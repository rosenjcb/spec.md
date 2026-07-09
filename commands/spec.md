---
description: Author a new *.spec.md for a feature or domain, derived from the real code and tests.
argument-hint: <domain or path, e.g. "orders" or src/billing>
---

Create a `*.spec.md` for: **$ARGUMENTS**

Use the **spec-md** skill. Follow its "create" path:

1. Gather context from the real system — read the code under the target area
   (branching, validation, lifecycle states), any existing docs/tickets, and
   locate the `sources` and `tests` paths.
2. Write the spec with OKF frontmatter (`type`, `title`, `sources`, `tests`),
   then Intro, Definitions, Scope, Functional Requirements (`FR-N`), and QA
   Test Cases (`TC-N`). Derive requirements from the code — do not invent
   structure.
3. Name it `<domain>.spec.md` and place it next to the code it describes or in
   a `specs/` directory; set `sources`/`tests` relative to that location.
4. Ask whether the spec needs stakeholder sign-off (skill Step 5). If so,
   create `<domain>.review.md` next to it — `type: Review`, roles,
   per-stakeholder briefings, `status: open` — and link the two. Leave it
   `open`; only the user's word flips it to `approved`.

If `$ARGUMENTS` is empty, ask which feature or domain to spec, then proceed.

When the draft is ready, run `npx @rosenjcb/spec-md lint <file>` (if available) and fix any
errors before finishing.
