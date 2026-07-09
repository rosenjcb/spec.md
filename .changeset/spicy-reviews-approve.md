---
"@rosenjcb/spec-md": minor
---

Add `--require-approved` to `lint` and `check`: fail when a spec declares a
`status` other than `approved`, so a spec can ride its feature branch through
review and the PR only merges once the status flips. Specs without a `status`
key are not gated — the review lifecycle is opt-in per spec. Lint now also
verifies that a spec-relative `review` frontmatter path exists on disk
(URL values are left alone).
