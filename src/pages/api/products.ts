import type { APIRoute } from "astro";
import { products } from "../../data/products";
import { ok } from "../../lib/server/response";

export const prerender = false;

/**
 * GET /api/products — katalog produk PUBLISHED (data statis contoh).
 * Query: ?q=kata-kunci &kategori=Sembako &toko=Warung+Ibu+Ani
 *        &minHarga=10000 &maxHarga=50000 &sort=termurah|termahal
 */
export const GET: APIRoute = ({ url }) => {
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const kategori = url.searchParams.get("kategori") ?? "";
  const toko = url.searchParams.get("toko")?.trim() ?? "";
  const minHarga = Number(url.searchParams.get("minHarga") ?? "0") || 0;
  const maxHarga = Number(url.searchParams.get("maxHarga") ?? "0") || 0;
  const sort = url.searchParams.get("sort") ?? "";

  let list = products.filter((p) => p.published);
  if (kategori && kategori !== "Semua") {
    list = list.filter((p) => p.category === kategori || p.categories.includes(kategori));
  }
  if (toko && toko !== "Semua") {
    list = list.filter((p) => p.seller === toko);
  }
  if (q) {
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (minHarga > 0) list = list.filter((p) => p.price >= minHarga);
  if (maxHarga > 0) list = list.filter((p) => p.price <= maxHarga);
  if (sort === "termurah") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "termahal") list = [...list].sort((a, b) => b.price - a.price);

  return ok(list);
};