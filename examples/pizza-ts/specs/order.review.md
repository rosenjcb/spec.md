# Review: Spec — Pizza Orders

The review record for [order.spec.md](./order.spec.md). It lives next to the
spec, and the spec's `review` frontmatter key points here. One record per
spec; each review round is appended as a section below. Stakeholders read
their briefing — written for their role from the pinned spec version — not
the whole spec. If stakeholders live in a knowledge base (Notion,
Confluence), publish a read-only mirror there — this file is the source.
See [REVIEW.md](../../../REVIEW.md) for the convention.

## Round 2 — pre-build signoff

**Mode:** signoff
**Milestone:** pre-build
**Spec:** [order.spec.md](./order.spec.md) (as of `d4e5f6a`, 2026-06-27)
**Driver:** Hank Hill
**Deadline:** 2026-07-04

Your briefing below is the whole ask. It was written for your role from the
spec version linked above, and every claim in it cites the section or ID it
came from. If it is correct and complete for your area, check the box next
to your name to record your approval. If something is wrong or missing,
comment on the spec or raise it with the driver. We build when every
approver has signed off — contributor silence past the deadline is taken
as "no objection."

| Role | Who | Asked to | Done |
|------|-----|----------|------|
| Approver | Buck Strickland (Product) | Approve | [x] 2026-07-02 |
| Contributor | Joe Jack (QA) | Review & comment by deadline | Commented 2026-06-30 |
| Contributor | Enrique (Design) | Review & comment by deadline | — (no objection) |
| Informed | Support, Sales | Nothing — FYI | — |

### Briefings

**Buck Strickland (Product)** — You are approving the business shape of
Orders: customers order off a fixed menu, prices come from the menu with
per-size multipliers, and an order cannot be changed once placed
([FR-1](./order.spec.md#functional-requirements)–[FR-3]). Payments,
inventory, and delivery are deliberately not built here
([Scope](./order.spec.md#scope)). Since kickoff we added order lookup
([FR-5]) — five behaviors total.

**Joe Jack (QA)** — Acceptance is now nine concrete cases
([TC-1–TC-9](./order.spec.md#qa-test-cases)). Every invalid request —
missing customer, empty items, unknown pizza — must return a 400
([TC-6]–[TC-8]); pricing must round per size multiplier ([TC-3]); the new
retrieval path must 404 on unknown ids ([TC-9], new since kickoff). Flag
anything your harness cannot assert before the deadline.

**Enrique (Design)** — The ordering flow gets three sizes at fixed
multipliers and no per-topping pricing
([Definitions](./order.spec.md#definitions)). Once placed, an order can
only be viewed, never edited ([FR-3], [FR-5]). If checkout needs editing or
custom pricing, raise it now — both are out of scope
([Scope](./order.spec.md#scope)).

**Support, Sales (FYI)** — When this ships, placed orders are immutable:
changes mean cancellation flows, not edits ([FR-3]).

**Changes since the kickoff round:** FR-5 [NEW], TC-9 [NEW].

**Outcome:** approved 2026-07-02; the spec's `status` moved to `approved`
and the build proceeds from the spec as linked above.

## Round 1 — kickoff notice

**Mode:** notice
**Milestone:** kickoff
**Spec:** [order.spec.md](./order.spec.md) (as of `b7c8d9e`, 2026-06-20 —
Intro and Scope only)
**Driver:** Hank Hill

Heads-up: we are speccing the Orders domain — requirements come next round.
Your briefing below covers what this means for you. No action needed;
comment on the spec or reach out to the driver if the boundaries look
wrong.

| Role | Who | Asked to | Done |
|------|-----|----------|------|
| Contributor | Joe Jack (QA) | Flag boundary surprises | Acknowledged |
| Contributor | Enrique (Design) | Flag boundary surprises | Acknowledged |
| Informed | Support, Sales | Nothing — FYI | — |

### Briefings

**Joe Jack (QA)** — Nothing to test yet. Orders will price and store placed
orders but will not touch payments or delivery
([Scope](./order.spec.md#scope)) — say now if that split moves QA ownership
you were not expecting. Test cases arrive with the requirements next round.

**Enrique (Design)** — The system of record for placed orders is being
specced: menu, ordering, and confirmation flows will sit on top of it;
payment screens will not ([Intro](./order.spec.md#intro),
[Scope](./order.spec.md#scope)). Flag boundary surprises before
requirements are written.

**Support, Sales (FYI)** — A dedicated Orders system is coming; nothing
changes for you until it ships.

**Outcome:** no objections; drafting of Functional Requirements proceeded.
