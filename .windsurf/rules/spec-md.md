---
trigger: glob
globs: **/*.spec.md
description: Author or update a *.spec.md file — an Open Knowledge Format spec that captures a system's intent, behavior, and verification so both humans and agents stay aligned. Produces OKF metadata, Intro, Definitions, Scope, Functional Requirements (FR-N), and QA Test Cases (TC-N).
---

<!-- GENERATED FROM SKILL.md — do not edit. Run: pnpm run sync (or node scripts/sync-adapters.mjs) -->

> This guide teaches Windsurf to author and maintain `*.spec.md` files — the [spec.md](https://github.com/rosenjcb/spec.md) format. It is generated from the canonical [SKILL.md](https://github.com/rosenjcb/spec.md/blob/main/SKILL.md); see it and [TESTING.md](https://github.com/rosenjcb/spec.md/blob/main/TESTING.md) for the source of truth.

---

# spec.md

Write a `*.spec.md` file: the authoritative, living description of a system —
what it does, why it exists, and how it should behave. A spec is shared context
for Product, Engineering, QA, and agents, structured as a
[spec.md](https://github.com/rosenjcb/spec.md) document (an Open Knowledge Format
extension) so it stays machine-readable and synchronized with the system it
describes.

## When to use

- A feature or domain has behavior worth pinning down before (or while) it is built
- QA reports failures and you need to formalize what "correct" means
- Code exists but no spec traces intent to implementation and tests
- You need to align engineering and QA on expected behavior before release

## Creating vs. updating

This skill covers both. First decide which you are doing:

- **No spec exists** for the system → create one. Do Step 1, then Step 2.
- **A `*.spec.md` already exists** → update it. Do Step 1, then **Step 2u**
  instead of Step 2. The rest (Steps 3–4) applies to both.

The critical update rule: **`FR-N` and `TC-N` IDs are permanent.** Test names
tag back to them via `[TC-N]`, so renumbering silently breaks that link. Never
reuse or shift an ID — only append new ones and retire obsolete ones in place.

## Step 1: Gather context

Derive the spec from the real system — do not invent structure.

1. **Read the code.** Branching logic, validation, and lifecycle states become
   your Functional Requirements and the dimensions your Test Cases must cover.
2. **Read existing docs.** Tickets, `.context.md`, prior specs, e2e cases.
3. **Locate `sources` and `tests`.** Which paths implement the spec, which prove
   it. These become metadata.
4. **When updating, read the current spec first** and diff its claims against the
   code and tests as they are now. Note what drifted: new behavior with no
   `FR-N`, requirements whose behavior changed, `TC-N` rows that no longer match,
   tests with no row (or rows with no test).
5. **Ask only when blocked.** One or two questions at a time; present what you
   found in the code and confirm.

## Step 2: Write the spec (create)

Naming: `<domain>.spec.md` (e.g. `order.spec.md`). Place it wherever fits the
project — next to the code it describes (`src/orders/order.spec.md`) or in a
dedicated specs directory. Location does not matter; `sources` and `tests` are
relative to the spec file, so set those paths to match wherever you put it.
Keep every section tight — each sentence earns its place.

### Metadata (frontmatter)

Only `type` and `title` are required; add the rest as the spec matures.

```yaml
---
type: Spec
title: "Spec: Orders"
sources: [./src/orders]
tests: [./test/orders, ./http/orders.http]
description: The specification for the Orders domain
resource: https://notion.com/read_only_publish_page_location
tags: [sales, orders, revenue]
timestamp: 2026-05-28T14:30:00Z
---
```

| Key | Required | Purpose |
|-----|----------|---------|
| `type` | **Yes** | Always `Spec` for a spec.md file. |
| `title` | **Yes** | Human-readable name. |
| `sources` | No | YAML list of **spec-relative** paths to code/schemas/docs that implement the spec. |
| `tests` | No | YAML list of spec-relative paths to verification (unit suites, `.http`, e2e). |
| `description` | No | One-line summary. |
| `resource` | No | External URL where the spec is published/synced. |
| `tags` | No | Freeform labels for grouping. |
| `timestamp` | No | ISO 8601 of last update. |

`sources` is *what the system does*; `tests` is *what proves it*. Both are
YAML lists of paths relative to the spec file, so the spec stays portable.
Omit either if it does not exist yet.

### Intro

One or two paragraphs: the system's purpose, its role as system of record, and
its lifecycle boundaries (what is immutable, what flows downstream).

### Definitions

Shared vocabulary used across the spec. Only terms specific to this system or
ambiguous without definition. Include the field name where it helps
(`customerId`, `basePrice` in cents).

```md
### Definitions

- Order: A completed purchase transaction, identified by `id`.
- Order Total: Final amount after discounts, taxes, and adjustments, in cents.
- Status: Lifecycle state (CREATED, PAID, FULFILLED, REFUNDED).
```

### Scope

Two lists under `## In Scope` and `## Out of Scope`. This prevents
responsibility drift — be explicit about what the system does *not* own.

### Functional Requirements

A table of `FR-N` rows. Each is a **higher-level, testable** statement of intent
— not a vague goal and not an implementation detail. One behavior per row.

```md
### Functional Requirements

| ID   | Requirement |
|------|-------------|
| FR-1 | Create an order from a request with a customer and at least one item |
| FR-2 | Compute line and order totals from price and size multiplier |
| FR-3 | Prevent modification of an order after creation |
| FR-4 | Reject requests missing a customer or with invalid items |
```

### QA Test Cases

A table of `TC-N` rows, each citing the `FR-N` it proves. A single FR is usually
proven by **several** test cases (e.g. pricing → size, quantity, rounding). Each
row is a deterministic, concrete check — exact input, exact expected outcome.

```md
### QA Test Cases

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|-------------|----------|------------------|
| TC-1 | FR-1 | Valid request submitted | Order created with status CREATED |
| TC-2 | FR-2 | Larger size priced | Unit price scaled by multiplier, rounded |
| TC-3 | FR-4 | Missing customerId | 400 validation error |
| TC-4 | FR-4 | Empty items list | 400 validation error |
```

Cover happy path first, then edge cases, then error conditions. Group related
cases under the FR they belong to. Be concrete: `[owner, downlineA, unrelated]`
beats "a mixed array".

## Step 2u: Update the spec

Edit the existing file in place — keep the prose and IDs that still hold, change
only what drifted. Apply the same section rules as Step 2, plus:

- **Preserve IDs.** Never renumber. New requirements take the next free `FR-N`;
  new cases take the next free `TC-N`. Gaps from retired IDs are fine.
- **Edit a row in place** when behavior changed but the requirement is the same —
  update its text, not its number.
- **Mark removed behavior** rather than deleting silently: append `[REMOVED]` to
  the row (and remove its `[TC-N]` tests) so reviewers see the change. Delete
  outright only once nothing references the ID.
- **Mark new or changed rows** with `[NEW]` or `[UPDATED]` while the change is in
  review; drop the marker once merged.
- **Reconcile metadata.** Update `sources`/`tests` if paths moved, and always
  bump `timestamp` to the current time.

## Step 3: Link the tests

Tests trace back to the spec via a bracketed `[TC-N]` prefix on the test name —
the join key between spec and suite. See
[TESTING.md](https://github.com/rosenjcb/spec.md/blob/main/TESTING.md) for the
full convention.

```ts
it("[TC-3] Given a request without a customerId, when the order is created, then a ValidationError is thrown", () => { ... });
```

Coverage is greppable: every `TC-N` in the spec should have at least one
`[TC-N]` test. A test with no matching row is a signal to add the `TC-N` — or
tag it `[smoke]` if it is not an acceptance criterion.

## Step 4: Flag gaps

- Mark ambiguous behavior with `??` and call it out.
- Note known mismatches between code and spec in a short "Known issues" section.
- Flag any `FR-N` with no `TC-N`, and any `TC-N` with no `[TC-N]` test.

## Principles

- **Derive from the code.** If the code branches on it, a requirement and a test
  case should cover it — including null/unknown values.
- **Concrete over abstract.** Exact inputs and outputs, not descriptions of them.
- **Intent, not implementation.** Describe *what* should happen, never *how* the
  code does it.
- **Living, not frozen.** Enough detail to remove ambiguity, not so much rigidity
  that it goes stale. Update `timestamp` and the relevant rows as the system
  evolves rather than rewriting wholesale.
- **Succinct.** No filler, no restating the obvious.
