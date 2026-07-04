import type { APIRoute } from "astro";
import { categories } from "../../data/stores";
import { ok } from "../../lib/server/response";

export const prerender = false;

/** GET /api/categories — master kategori produk. */
export const GET: APIRoute = () => ok(categories);
