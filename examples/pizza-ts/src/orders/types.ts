/**
 * Domain types for the Pizza ordering example.
 *
 * These mirror the Definitions section of `specs/order.spec.md`.
 */

export type Size = "small" | "medium" | "large";

export const SIZES: readonly Size[] = ["small", "medium", "large"] as const;

/** Lifecycle state of an order. See FR-3 / Definitions in the spec. */
export type OrderStatus = "CREATED" | "PAID" | "FULFILLED" | "CANCELLED";

/** A pizza available on the menu. `basePrice` is in whole cents. */
export interface MenuItem {
  id: string;
  name: string;
  /** Price of a `small` pizza, in cents. Other sizes scale from this. */
  basePrice: number;
}

/** A requested line on an order, as supplied by the client. */
export interface OrderItemInput {
  pizzaId: string;
  size: Size;
  quantity: number;
}

/** A priced line on a persisted order. */
export interface OrderItem extends OrderItemInput {
  name: string;
  /** Unit price for this pizza at this size, in cents. */
  unitPrice: number;
  /** unitPrice * quantity, in cents. */
  lineTotal: number;
}

/** An immutable, persisted order. */
export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  /** Sum of all line totals, in cents. */
  total: number;
  status: OrderStatus;
  placedAt: string;
}

/** Request body accepted by `POST /orders`. */
export interface CreateOrderRequest {
  customerId: string;
  items: OrderItemInput[];
}
