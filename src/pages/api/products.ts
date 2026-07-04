import type { APIRoute } from "astro";
import { products } from "../../data/products";
import { ok } from "../../lib/server/response";

export const prerender = false;

/**
 * GET /api/products — katalog produk PUBLISHED (data statis contoh).
 * Query: ?q=kata-kunci &kategori=Sembako &sort=termurah|termahal
 */
export const GET: APIRoute = ({ url }) => {
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const kategori = url.searchParams.get("kategori") ?? "";
  const sort = url.searchParams.get("sort") ?? "";

  let list = products.filter((p) => p.published);
  if (kategori && kategori !== "Semua") {
    list = list.filter((p) => p.category === kategori || p.categories.includes(kategori));
  }
  if (q) {
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (sort === "termurah") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "termahal") list = [...list].sort((a, b) => b.price - a.price);

  return ok(list);
};
