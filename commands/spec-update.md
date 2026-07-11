---
description: Update an existing *.spec.md to match the current code and tests, keeping FR-N/TC-N contiguous and in order.
argument-hint: <path to the .spec.md, or a domain to locate>
---

Update the spec for: **$ARGUMENTS**

Use the **spec-md** skill. Follow its "update" path (Step 2u):

1. Read the current spec first, then diff its claims against the code and tests
   as they are now. Note what drifted: new behavior with no `FR-N`, requirements
   whose behavior changed, `TC-N` rows that no longer match, tests with no row.
2. Edit in place. **Default: append** — next id is `n + 1` at the end of the
   table. Never invent mid-range ids or leave skips. Soft-retire with
   `[REMOVED]` (row still occupies its index); hard-delete then compact.
3. **Cleanup pass (required).** After every insert/remove/edit, tables must be
   exactly `FR-1..FR-n` / `TC-1..TC-n` in ascending row order. If jumbled or
   gapped: reorder (FR by domain; TC by FR, happy → edge → error), renumber
   `1..n`, and update every matching `[TC-N]` test tag in the same change.
4. Mark new/changed rows with `[NEW]` / `[UPDATED]` while in review.
5. Reconcile `sources`/`tests` if paths moved, and bump `timestamp`.
6. If the spec links an approved `*.review.md`, ask whether this change
   warrants re-review (skill Step 5). If so, regenerate the record in place —
   new `revision`, `status: open`, delta briefings by id — and never flip it
   to `approved` without the user's word.

If `$ARGUMENTS` doesn't point at a file, run `npx @rosenjcb/spec-md list` (or search for
`*.spec.md`) to find the right spec, then confirm before editing.

Finish by running `npx @rosenjcb/spec-md check <file>` and resolving any errors or new
coverage gaps — including sequence / ordering failures.
