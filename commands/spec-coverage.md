---
description: Report which TC-N test cases have a matching [TC-N] test, and surface coverage gaps.
argument-hint: "[path] (defaults to the whole repo)"
allowed-tools: Bash(npx @rosenjcb/spec-md:*), Bash(node:*), Read, Grep, Glob
---

Check spec test-case coverage for: **${ARGUMENTS:-the whole repository}**

Run:

```
npx @rosenjcb/spec-md coverage ${ARGUMENTS:-.}
```

This cross-references each `TC-N` row against the `[TC-N]` tags in the spec's
`tests` paths. If `spec-md` is unavailable, do it by hand: for each spec, collect
its `TC-N` ids and `grep -r "\[TC-N\]"` across the `tests` paths.

Then:

1. List any **uncovered** `TC-N` (a row with no `[TC-N]` test).
2. List any **orphan tags** (`[TC-N]` in tests that no spec declares) — these
   signal a missing row in the spec.
3. For each gap, recommend the concrete next step: write the missing test
   tagged `[TC-N]`, or add the missing `TC-N` row to the spec (following the
   spec-md skill's update rules).

Summarize as a coverage table. Only write tests or edit specs if I ask.
