# @rosenjcb/spec-md

## 0.3.0

### Minor Changes

- af5c8bc: Add `--require-approved` to `lint` and `check`: the gate reads the review
  record linked from a spec's `review` key and fails while the record's
  `status` is not `approved`, so a spec and its review ride the feature
  branch together and the PR merges once the sign-off lands. Specs without a
  linked review — and notice records without a `status` — are not gated.
  Lint also verifies that a spec-relative `review` path exists on disk (URL
  values are left alone).

### Patch Changes

- `spec-md new` scaffolds `sources`/`tests` as YAML inline arrays, the
  canonical form for frontmatter path lists.
- Frontmatter path fields (`sources`, `tests`, `review`) are read as YAML
  lists; a bare scalar is read as a single path.

## 0.2.0

### Initial release

- `lint`, `coverage`, `check`, `list`, and `new` commands for `*.spec.md` files
- Zero-dependency Node.js CLI
- GitHub Action wrapper via `npx @rosenjcb/spec-md`
