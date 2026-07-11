---
description: Update an existing *.spec.md to match the current code and tests, preserving FR-N/TC-N ids.
argument-hint: <path to the .spec.md, or a domain to locate>
---

Update the spec for: **$ARGUMENTS**

Use the **spec-md** skill. Follow its "update" path (Step 2u):

1. Read the current spec first, then diff its claims against the code and tests
   as they are now. Note what drifted: new behavior with no `FR-N`, requirements
   whose behavior changed, `TC-N` rows that no longer match, tests with no row.
2. Edit in place. **Never renumber** — `FR-N` and `TC-N` ids are permanent
   because tests tag back to them via `[TC-N]`. Before adding a row, scan the
   whole FR/TC tables (including `[REMOVED]`) for the highest `N` and use
   `max + 1`. Retire obsolete ones with `[REMOVED]` rather than deleting.
3. **Cleanup pass (required).** After every insert/remove/edit, reorder the
   tables: FR by domain/lifecycle; TC grouped by the `FR-N` they prove
   (happy → edge → error within each group). Fix any duplicate ids by keeping
   the older row and reassigning the collision to the next free id (and
   updating matching `[TC-N]` test tags). Shuffle rows — never renumber to
   "fix" gaps or insertion order.
4. Mark new/changed rows with `[NEW]` / `[UPDATED]` while in review.
5. Reconcile `sources`/`tests` if paths moved, and bump `timestamp`.
6. If the spec links an approved `*.review.md`, ask whether this change
   warrants re-review (skill Step 5). If so, regenerate the record in place —
   new `revision`, `status: open`, delta briefings by id — and never flip it
   to `approved` without the user's word.

If `$ARGUMENTS` doesn't point at a file, run `npx @rosenjcb/spec-md list` (or search for
`*.spec.md`) to find the right spec, then confirm before editing.

Finish by running `npx @rosenjcb/spec-md check <file>` and resolving any errors or new
coverage gaps.
