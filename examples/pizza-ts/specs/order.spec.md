---
type: Spec
title: "Spec: Pizza Orders"
sources: ../src/menu.ts, ../src/orders.ts, ../src/types.ts
tests: ../test/menu.test.ts, ../test/orders.test.ts, ../http/orders.http
description: The specification for the Orders domain in the pizza-ts example platform
resource: https://notion.com/read_only_publish_page_location
tags: [pizza, orders, checkout]
timestamp: 2026-06-27T00:00:00Z
---

### Intro

The Orders system handles creation and retrieval of customer pizza orders.

It is the system of record for placed orders. An order is created from a
validated request, priced from the menu, and stored immutably. Downstream
concerns such as payment, kitchen routing, and delivery consume orders but are
not produced here.

Once created, an order is immutable except through explicit cancellation or
adjustment flows (Out of Scope for this example).

### Definitions

- Order: A placed pizza purchase, identified by `id`.
- Customer: The user who placed the order (`customerId`).
- Menu Item: A pizza available for purchase, with a `basePrice` in cents.
- Size: One of `small`, `medium`, `large`; scales the unit price.
- Order Item: A single line on an order (pizza + size + quantity), priced.
- Order Total: Sum of all line totals, in cents.
- Placed At: Timestamp when the order is committed (ISO 8601).
- Status: Lifecycle state of the order (CREATED, PAID, FULFILLED, CANCELLED).

### Scope

## In Scope
- Expose the pizza menu and per-size pricing
- Create orders from validated requests
- Price line items from the menu and size multipliers
- Compute the order total from line items
- Persist immutable order records for the process lifetime
- Retrieve an order by id

## Out of Scope
- Payment authorization and capture
- Inventory and stock management
- Delivery, dispatch, and kitchen routing
- Durable persistence (database)
- Authentication and authorization

### Functional Requirements

| ID   | Requirement |
|------|------------|
| FR-1 | Create an order from a request with a customer and at least one item |
| FR-2 | Compute line and order totals from menu price and size multiplier |
| FR-3 | Prevent modification of an order after creation |
| FR-4 | Reject requests missing a customer, items, or with invalid items |
| FR-5 | Retrieve a previously created order by its id |

### QA Test Cases

A requirement is a higher-level statement, validated by **one or more** test
cases. Here `FR-2` (pricing) owns `TC-2` through `TC-4`, and `FR-4`
(validation) owns `TC-6` through `TC-8`.

| Test ID | Requirement | Scenario | Expected Outcome |
|---------|------------|----------|------------------|
| TC-1 | FR-1 | Valid request submitted | Order created with status CREATED |
| TC-2 | FR-2 | Small pizza priced | Unit price equals the base price |
| TC-3 | FR-2 | Larger size priced | Unit price scaled by the size multiplier, rounded |
| TC-4 | FR-2 | Order with several line items | Total sums each line (unit price × quantity) |
| TC-5 | FR-3 | Mutate returned order object | Stored order is unchanged |
| TC-6 | FR-4 | Missing customerId | 400 validation error |
| TC-7 | FR-4 | Empty items list | 400 validation error |
| TC-8 | FR-4 | Unknown pizza or non-positive quantity | 400 validation error |
| TC-9 | FR-5 | Fetch existing / unknown id | 200 with order / 404 not found |

### System Usage Notes (Agent + OKF Context)

This spec is the authoritative description of the Orders domain in the
`pizza-ts` example. The `sources` field points at the implementation under
`../src` that enforces these requirements, and the `tests` field points at the
verification that proves them — the unit suites under `../test` and the
integration requests under `../http`. Both fields are relative to this spec
file. The QA Test Cases map directly to those tagged tests.

It can be used to:

- generate or regenerate the order service and HTTP routes
- derive the request/response contracts
- produce unit and integration test suites
- validate implementation correctness against FR/TC mappings

In an OKF-based system, this file is a node in a larger structured knowledge
graph that evolves alongside the system.
