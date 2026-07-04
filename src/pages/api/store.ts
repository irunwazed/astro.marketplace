import type { APIRoute } from "astro";
import { myStore, myStoreMembers, myStoreProducts } from "../../data/my-store";
import { ok } from "../../lib/server/response";

export const prerender = false;

/** GET /api/store — toko demo beserta anggota & produknya (termasuk draft). */
export const GET: APIRoute = () =>
  ok({ store: myStore, members: myStoreMembers, products: myStoreProducts });
