import type { APIRoute } from "astro";
import { products } from "../../../data/products";
import { err, ok } from "../../../lib/server/response";

export const prerender = false;

/** GET /api/products/:id — detail satu produk PUBLISHED. */
export const GET: APIRoute = ({ params }) => {
  const product = products.find((p) => p.id === params.id && p.published);
  if (!product) return err("Produk tidak ditemukan", 404);
  return ok(product);
};
