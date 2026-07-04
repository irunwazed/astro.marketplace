import type { APIRoute } from "astro";
import { findOrder, updateOrderStatus } from "../../../../lib/server/orders-store";
import { err, ok } from "../../../../lib/server/response";

export const prerender = false;

/**
 * POST /api/orders/:id/pay — konfirmasi pembayaran QRIS (demo).
 * MENUNGGU_PEMBAYARAN → DISIAPKAN (pembayaran diterima, toko mulai memproses).
 */
export const POST: APIRoute = ({ params }) => {
  const order = findOrder(params.id ?? "");
  if (!order) return err("Pesanan tidak ditemukan", 404);
  if (order.status !== "MENUNGGU_PEMBAYARAN") {
    return err("Pesanan ini sudah dibayar / tidak menunggu pembayaran", 409);
  }
  const updated = updateOrderStatus(params.id ?? "", "DISIAPKAN");
  if (!updated) return err("Pesanan contoh tidak bisa diubah", 409);
  return ok(updated);
};
