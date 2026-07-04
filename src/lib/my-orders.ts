import type { Order } from "../types";

/**
 * Pesanan hasil checkout demo, disimpan di localStorage.
 * Pesanan ini tampil di /orders (paling atas) dan dilacak lewat /orders/lacak?id=...
 */
const KEY = "pk-orders";

export function getLocalOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Order[];
  } catch {
    return [];
  }
}

export function addLocalOrder(order: Order) {
  localStorage.setItem(KEY, JSON.stringify([order, ...getLocalOrders()]));
}

export function getLocalOrder(id: string): Order | undefined {
  return getLocalOrders().find((o) => o.id === id);
}
