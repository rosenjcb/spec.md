# spec.md

Version 0.1 — Draft

An agent-native specification framework for the software development lifecycle.

---

## Motivation

In 2026, most software is no longer written line-by-line by humans. Frontend applications, backend services, infrastructure, migrations, tests, and documentation are routinely generated or assisted by AI systems.

This changes the shape of development.

Teams can now produce working software quickly. What used to take weeks can be scaffolded in hours and refined continuously. The constraint is no longer implementation speed.

The constraint is alignment.

As more of the system is produced by agents, ambiguity becomes more expensive. A missing requirement or unclear rule doesn’t stay local—it gets replicated across code, tests, APIs, and infrastructure generated from the same misunderstanding.

Small gaps in understanding lead to large system drift:

* incorrect implementations
* broken or incomplete test coverage
* inconsistent APIs
* incorrect assumptions in infrastructure
* repeated QA cycles
* rework across multiple services

The faster we generate software, the more important it becomes that we define *what we actually mean* before we generate it.

Modern software development already reflects this reality. Requirements are not static—they emerge. Teams learn by building, and systems evolve as understanding improves.

The goal is not to eliminate this iteration.

The goal is to make it explicit, structured, and shareable.

This document defines a way to treat software development as a shared knowledge system between Product, Engineering, QA, and AI agents.

Instead of static requirement documents, specs become living context that evolves alongside the system they describe.

The framework uses and extends the Open Knowledge Format (OKF) to structure this context so it can be consumed by both humans and agents. The goal is not more documentation. It is a consistent, machine-readable model of intent, behavior, and constraints that stays synchronized with the system as it changes.

---

## What is a spec?

A spec is the authoritative description of a system: what it does, why it exists, and how it should behave.

In practice, it serves different roles depending on who is using it.

For business stakeholders, it captures:

* the problem being solved
* expected outcomes
* constraints and success criteria
* intent behind the product

For product and design, it captures:

* user experience and flows
* behavior and interaction rules
* edge cases and usability constraints
* intended system behavior

For engineering, it captures:

* system boundaries and responsibilities
* APIs and data contracts
* implementation constraints
* validation rules and invariants
* operational expectations

For QA, it captures:

* expected system behavior
* acceptance criteria
* failure conditions
* regression coverage

For AI agents, the spec becomes executable context:

* what to build
* what not to build
* how components should behave
* how to validate correctness

A spec is not just a feature description.

It is a shared model of the system that connects intent to implementation.

This introduces a natural tension:

A spec needs enough detail to remove ambiguity, but not so much rigidity that it becomes invalid as the system evolves.

Too little detail leads to inconsistent interpretations across teams and agents.

Too much rigidity leads to outdated assumptions and constant rewriting.

A useful spec doesn’t try to freeze the system.

It tracks how understanding of the system changes over time.

---

## Example

To make this concrete, we’ll break the `order.spec.md` into modular sections. Each section is self-contained and represents a unit of the spec.

---

### `order.spec.md (metadata)`

```yaml
---
type: Spec
title: Spec: Orders
sources: ./orders
description: The specification for the Orders domain in the Foo platform
resource: https://notion.com/read_only_publish_page_location
tags: [sales, orders, revenue]
timestamp: 2026-05-28T14:30:00Z
---
```

---

This block defines the identity and external connections of the spec.

The `sources` field links the spec to the parts of the system that implement, enforce, or depend on it. This can include application code, tests, schemas, documentation, or anything else that reflects or validates the behavior described here.

In simple cases, this can point to a single folder (e.g. `./orders`). In more complex systems, it may be expanded into multiple paths such as `./api/orders`, `./web/orders`, or `./tests/orders`.

The intent is not to precisely define architecture, but to give the spec a way to stay connected to the real system as it evolves.

The `resource` field defines where this spec is published or synchronized externally.

---

```md
### Intro

The Orders system handles creation and tracking of customer purchases.

It is the system of record for all completed transactions and feeds downstream systems such as billing, analytics, fulfillment, and support.

Once created, orders are considered immutable except through explicit refund or adjustment flows.
```

This defines the system’s purpose and lifecycle boundaries.

---

```md
### `Definitions`

- Order: A completed purchase transaction.
- Customer: The user who placed the order (`customer_id`).
- Order Total: Final amount after discounts, taxes, and adjustments.
- Placed At: Timestamp when the order is committed.
- Status: Lifecycle state of the order (CREATED, PAID, FULFILLED, REFUNDED).
```

This establishes shared vocabulary used across Product, Engineering, QA, and agents.

---

```md
### `Scope`

## In Scope
- Create orders from validated checkout sessions
- Persist immutable order records
- Compute totals from line items
- Emit order creation events
- Support refunds and partial refunds

## Out of Scope
- Inventory management
- Payment authorization logic
- Shipping integrations
- Pricing rules engine
```

This defines system boundaries and prevents responsibility drift.

---

```md
### `Functional Requirements`

| ID   | Requirement |
|------|------------|
| FR-1 | Create order after successful checkout |
| FR-2 | Compute totals correctly from pricing inputs |
| FR-3 | Prevent modification of finalized orders |
| FR-4 | Each order must belong to one customer |
| FR-5 | Emit order-created event within 5 seconds |
```

These define system behavior in testable units.

Each requirement should map directly to implementation and validation logic.

---


```md
### `QA Test Cases`

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|------------|----------|------------------|
| TC-1 | FR-1 | Valid checkout completes | Order created successfully |
| TC-2 | FR-2 | Discount applied | Total reflects discount |
| TC-3 | FR-3 | Modify order after creation | Request rejected |
| TC-4 | FR-4 | Missing customer_id | Validation error |
| TC-5 | FR-5 | Order created | Event emitted within SLA |
```

These are executable validation conditions derived from requirements.

They form the bridge between spec and automated verification.

---

### System Usage Notes (Agent + OKF Context)

This spec is designed to be consumed by both engineers and AI agents.

It can be used to:

- generate services and APIs
- derive database schemas
- produce test suites
- validate implementation correctness
- synchronize external documentation via `resource`

The `resource` field defines the external system where this spec is published or mirrored.

In an OKF-based system, this file is a node in a larger structured knowledge graph that evolves alongside the system. It represents intent, behavior, and constraints in a form that can be interpreted, executed, and updated over time.

---

## Next Readings

- [TESTING.md](./TESTING.md) — how tests relate to a `*.spec.md`. Covers unit and integration tests and the `[TC-N]` tag convention embedded in the test name, where the tag links each test back to a QA Test Case in the spec. Suggests (but does not require) Gherkin **Given / When / Then** phrasing.
- [examples/pizza-ts](./examples/pizza-ts) — a runnable reference implementation generated from a single OKF spec, with tagged unit tests and `.http` integration requests that trace back to it.

### Appendix: References

- Google Cloud Blog: How the Open Knowledge Format can improve data sharing: https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
- GoogleCloudPlatform OKF Spec: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
