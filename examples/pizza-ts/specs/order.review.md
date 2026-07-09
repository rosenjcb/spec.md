---
type: Review
title: "Review: Pizza Orders — pre-build signoff"
spec: ./order.spec.md
revision: d4e5f6a
mode: signoff
milestone: pre-build
status: approved
driver: hank.hill@stricklandpropane.com
approvers: [buck.strickland@stricklandpropane.com]
contributors: [joe.jack@stricklandpropane.com, enrique@stricklandpropane.com]
informed: [support, sales]
deadline: 2026-07-04
resource: https://notion.com/read_only_publish_page_location
timestamp: 2026-07-02T00:00:00Z
---

Your briefing below is the whole ask. It was written for your role from
[the spec](./order.spec.md) at revision `d4e5f6a`, and every claim in it
cites the section or ID it came from. If it is correct and complete for
your area, check the box next to your name to record your approval. If
something is wrong or missing, comment on the spec or raise it with the
driver. We build when every approver has signed off — contributor silence
past the deadline is taken as "no objection."

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
([FR-1](./order.spec.md#functional-requirements)–[FR-3]). Placed orders can
be looked up by id ([FR-5]). Payments, inventory, and delivery are
deliberately not built here ([Scope](./order.spec.md#scope)).

**Joe Jack (QA)** — Acceptance is nine concrete cases
([TC-1–TC-9](./order.spec.md#qa-test-cases)). Every invalid request —
missing customer, empty items, unknown pizza — must return a 400
([TC-6]–[TC-8]); pricing must round per size multiplier ([TC-3]); retrieval
must 404 on unknown ids ([TC-9]). Flag anything your harness cannot assert
before the deadline.

**Enrique (Design)** — The ordering flow gets three sizes at fixed
multipliers and no per-topping pricing
([Definitions](./order.spec.md#definitions)). Once placed, an order can
only be viewed, never edited ([FR-3], [FR-5]). If checkout needs editing or
custom pricing, raise it now — both are out of scope
([Scope](./order.spec.md#scope)).

**Support, Sales (FYI)** — When this ships, placed orders are immutable:
changes mean cancellation flows, not edits ([FR-3]).

**Outcome:** approved 2026-07-02; the build proceeds from the spec at the
revision above.
