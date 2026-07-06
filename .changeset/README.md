# Changesets

One publishable package, versioned from `cli/`:

| Package | Directory | What it covers |
|---------|-----------|----------------|
| `@rosenjcb/spec-md` | `cli/` | `spec-md` CLI, GitHub Action runtime, npm distribution |

When shipped CLI or `action.yml` source changes, bump the package before merging.

## Workflow

1. Create one pending `.changeset/*.md` file for the PR (write it directly, or run `pnpm exec changeset`).
2. `pnpm run changeset:version` — applies the changeset, bumps `cli/package.json` / `CHANGELOG.md`, and syncs plugin manifests.
3. `pnpm run changeset:check` — verifies the bump was applied and no pending changeset remains.
4. `pnpm run publish:check` — verifies marketplace JSON, plugin JSON, and version fields agree.
5. Merge once CI passes.

On merge to `main`, CI tags `v{version}` and `release.yml` publishes npm + a GitHub Release.

## Bump types

| Type | When |
|------|------|
| `patch` | Fixes |
| `minor` | New features |
| `major` | Breaking CLI / Action API changes |

Example:

```md
---
"@rosenjcb/spec-md": patch
---

Fix coverage false positive when TC-N appears in a comment.
```
