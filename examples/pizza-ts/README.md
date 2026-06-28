# pizza-ts

A small, dependency-light reference example for the **spec.md** standard.

It implements a pizza ordering API directly from a single OKF spec —
[`specs/order.spec.md`](specs/order.spec.md) — and shows how the spec's
Functional Requirements (FR-*) and QA Test Cases (TC-*) trace into code, unit
tests, and live HTTP integration requests.

> Only `specs/order.spec.md` follows the OKF/spec.md format. The READMEs here
> are ordinary developer docs.

## Stack

- **TypeScript** (ESM, strict)
- **Express 4** — the HTTP server
- **Vitest** — unit + HTTP-level tests
- **tsx** — run TypeScript directly, no build step
- **httpyac** / IntelliJ `.http` — integration requests in [`http/`](http/)

## Layout

```
pizza-ts/
├── specs/
│   └── order.spec.md     # the OKF spec — the source of truth
├── src/
│   ├── types.ts          # domain types (mirror the Definitions)
│   ├── menu.ts           # catalogue + size pricing (FR-2)
│   ├── orders.ts         # validation, pricing, immutable store (FR-1,3,4)
│   ├── app.ts            # Express routes (FR-1,2,5)
│   └── index.ts          # server entrypoint
├── test/
│   ├── menu.test.ts      # pricing units
│   ├── orders.test.ts    # order service units (TC-1, TC-4..TC-9)
│   └── app.test.ts       # HTTP-level tests (TC-1, TC-2, TC-6, TC-9)
└── http/                 # live integration requests (.http + httpyac)
```

## Getting started

```bash
cd examples/pizza-ts
npm install

npm run start        # serve on http://localhost:3000
npm test             # run the vitest suites
npm run build        # type-check only (tsc --noEmit)
```

## API

| Method | Path          | Description                          | Spec |
|--------|---------------|--------------------------------------|------|
| GET    | `/health`     | Liveness probe                       | —    |
| GET    | `/menu`       | List pizzas and base prices          | FR-2 |
| POST   | `/orders`     | Create an order from a request       | FR-1, FR-2, FR-4 |
| GET    | `/orders/:id` | Fetch a previously created order     | FR-5 |

Prices are in **whole cents**. Size multipliers: `small` ×1, `medium` ×1.3,
`large` ×1.6 (rounded to the nearest cent).

### Example

```bash
curl -s localhost:3000/orders \
  -H 'content-type: application/json' \
  -d '{"customerId":"cust-1","items":[{"pizzaId":"pepperoni","size":"large","quantity":2}]}'
```

## Integration tests

The [`http/`](http/) folder holds `.http` requests runnable from IntelliJ or
httpyac, with assertions tied to the spec's QA Test Cases. See
[`http/README.md`](http/README.md).

## How this maps to the spec

Every requirement and test case in [`specs/order.spec.md`](specs/order.spec.md)
has a home in the code. A requirement is higher-level than a single check, so
one `FR` can own several `TC`s:

- **FR-1** (TC-1) → `OrderStore.create` + `POST /orders`
- **FR-2** (TC-2, TC-3, TC-4) → `unitPriceFor`, `SIZE_MULTIPLIER`, total computation
- **FR-3** (TC-5) → `structuredClone` on store read/write (immutability)
- **FR-4** (TC-6, TC-7, TC-8) → validation in `priceItem` / `OrderStore.create`
- **FR-5** (TC-9) → `OrderStore.get` + `GET /orders/:id`
