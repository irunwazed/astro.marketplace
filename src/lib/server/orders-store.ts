import type { Order, OrderStatus } from "../../types";
import { orders as demoOrders } from "../../data/orders";

/**
 * Penyimpanan pesanan di memori server — contoh statis, hilang saat server
 * restart. Klien juga menyimpan salinan di localStorage (src/lib/my-orders.ts)
 * supaya pelacakan tetap jalan setelah restart.
 */
const created: Order[] = [];

export function allOrders(): Order[] {
  return [...created, ...demoOrders];
}

export function findOrder(id: string): Order | undefined {
  return allOrders().find((o) => o.id === id);
}

export function saveOrder(order: Order) {
  created.unshift(order);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = created.find((o) => o.id === id);
  if (!order) return undefined;
  order.status = status;
  return order;
}
