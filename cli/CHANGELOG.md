# @rosenjcb/spec-md

## 0.3.0

### Minor Changes

- af5c8bc: Add `--require-approved` to `lint` and `check`: fail when a spec declares a
  `status` other than `approved`, so a spec can ride its feature branch through
  review and the PR only merges once the status flips. Specs without a `status`
  key are not gated — the review lifecycle is opt-in per spec. Lint now also
  verifies that a spec-relative `review` frontmatter path exists on disk
  (URL values are left alone).

### Patch Changes

- `spec-md new` scaffolds `sources`/`tests` as YAML inline arrays, the now
  canonical form for frontmatter path lists (bare comma-separated strings are
  still accepted everywhere).

## 0.2.0

### Initial release

- `lint`, `coverage`, `check`, `list`, and `new` commands for `*.spec.md` files
- Zero-dependency Node.js CLI
- GitHub Action wrapper via `npx @rosenjcb/spec-md`
