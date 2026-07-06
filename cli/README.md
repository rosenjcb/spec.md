# spec-md CLI

Lint, coverage, and scaffolding tooling for [`*.spec.md`](https://github.com/rosenjcb/spec.md)
documents. Zero runtime dependencies, works with Node ≥ 18.

`spec-md` treats your specs as a checkable artifact: it validates the frontmatter
and `FR-N` / `TC-N` structure, and cross-references every `TC-N` against the
`[TC-N]` tags in your test suite so spec coverage becomes a CI gate.

## Install

```bash
# one-off, no install
npx spec-md lint

# project dev dependency
npm install --save-dev spec-md

# global
npm install --global spec-md
```

## Commands

| Command | What it does |
|---------|--------------|
| `spec-md lint [paths…]` | Validate frontmatter (`type`, `title`, path fields, `timestamp`), FR/TC ids, duplicate ids, and TC→FR references. |
| `spec-md coverage [paths…]` | Report which `TC-N` have at least one `[TC-N]` test, and flag tags that reference a `TC-N` the spec never declares. |
| `spec-md check [paths…]` | `lint` + `coverage`, strict. The one to run in CI. |
| `spec-md list [paths…]` | List every spec with FR/TC counts and a coverage bar. |
| `spec-md new <domain>` | Scaffold `<domain>.spec.md` from the canonical template. |

Paths default to the current directory and are searched recursively for
`*.spec.md` files (build and dependency directories are skipped).

### Options

| Flag | Applies to | Meaning |
|------|-----------|---------|
| `--strict` | lint, coverage, check | Exit non-zero on warnings / coverage gaps. |
| `--json` | lint, coverage, list | Machine-readable output. |
| `--tests <path>` | coverage | Search this path for `[TC-N]` tags instead of the spec's `tests` field. |
| `--out <path>` | new | Output file path. |
| `--sources`, `--tests`, `--title` | new | Seed the generated frontmatter. |
| `--force` | new | Overwrite an existing file. |

## How coverage works

A spec's `tests` frontmatter field points at where its verification lives.
`spec-md coverage` reads those spec-relative paths, scans them for `[TC-N]`
tags embedded in test names, and matches them against the `TC-N` rows in the
spec. Rows marked `[REMOVED]` are ignored. If a spec declares no `tests`, the
search falls back to the paths you passed on the command line.

```
$ spec-md coverage examples/pizza-ts
████████████████████ 100% examples/pizza-ts/specs/order.spec.md (9/9)

✓ Overall 100% — 9/9 test cases have a [TC-N] test
```

## Exit codes

- `0` — success (lint clean of errors; coverage complete when `--strict`).
- `1` — lint errors, or `--strict` warnings / coverage gaps.
- `2` — usage error / unexpected failure.

## In CI

```yaml
- run: npx spec-md check --strict
```

See the repository root for a reusable GitHub Action (`rosenjcb/spec.md`) that
wraps this command.
