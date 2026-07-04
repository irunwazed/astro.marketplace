import type { APIRoute } from "astro";
import { offices } from "../../data/offices";
import { ok } from "../../lib/server/response";

export const prerender = false;

/** GET /api/offices — master kantor mitra (dipilih toko sebagai lokasi office). */
export const GET: APIRoute = () => ok(offices);
