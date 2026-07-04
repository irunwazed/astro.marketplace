import type { APIRoute } from "astro";
import { findOrder } from "../../../../lib/server/orders-store";
import { err, ok } from "../../../../lib/server/response";

export const prerender = false;

/** GET /api/orders/:id — detail satu pesanan (contoh atau hasil checkout). */
export const GET: APIRoute = ({ params }) => {
  const order = findOrder(params.id ?? "");
  if (!order) return err("Pesanan tidak ditemukan", 404);
  return ok(order);
};
