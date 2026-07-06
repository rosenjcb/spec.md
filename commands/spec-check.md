---
description: Validate every *.spec.md in the repo — frontmatter, FR/TC structure, and id integrity.
argument-hint: "[path] (defaults to the whole repo)"
allowed-tools: Bash(npx @rosenjcb/spec-md:*), Bash(node:*), Read, Grep
---

Validate the specs under: **${ARGUMENTS:-the whole repository}**

Run the spec-md linter:

```
npx @rosenjcb/spec-md lint ${ARGUMENTS:-.}
```

If `spec-md` is not installed, fall back to reading each `*.spec.md` and checking
by hand:

- Frontmatter has `type: Spec` and a `title`.
- `FR-N` and `TC-N` ids are unique and well-formed.
- Every `TC-N` cites a `Requirement` that exists as an `FR-N` row.
- `sources`/`tests` paths resolve on disk.

Report the results grouped by file. For each **error**, propose the fix
(preserving ids — never renumber). Do not edit specs unless I ask; summarize
first.
