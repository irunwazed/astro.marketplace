import type { APIRoute } from "astro";
import { dropPoints } from "../../data/drop-points";
import { ok } from "../../lib/server/response";

export const prerender = false;

/** GET /api/drop-points — master titik ambil/terima paket. */
export const GET: APIRoute = () => ok(dropPoints);
