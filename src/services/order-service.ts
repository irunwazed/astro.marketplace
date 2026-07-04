import { apiGet, apiPost } from "./http";
import type { DeliveryLocation, Order } from "../types";

export interface CreateOrderPayload {
  items: { productId: string; qty: number }[];
  dropPointId: string;
  delivery: DeliveryLocation;
  payment: string;
}

/** GET /api/orders — pesanan contoh + pesanan yang dibuat sesi ini. */
export function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>("/api/orders");
}

/** GET /api/orders/:id */
export function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/api/orders/${encodeURIComponent(id)}`);
}

/** POST /api/orders — buat pesanan (status awal MENUNGGU_PEMBAYARAN). */
export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return apiPost<Order>("/api/orders", payload);
}

/** POST /api/orders/:id/pay — konfirmasi pembayaran QRIS → DISIAPKAN. */
export function payOrder(id: string): Promise<Order> {
  return apiPost<Order>(`/api/orders/${encodeURIComponent(id)}/pay`);
}
