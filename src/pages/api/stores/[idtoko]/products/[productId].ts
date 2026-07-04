import type { APIRoute } from "astro";
import { err, ok } from "../../../../../lib/server/response";
import { removeProduct, updateProduct, getProducts } from "../../../../../lib/server/store-products-store";
import { slugify, uniqueSlug } from "../../../../../lib/slug";
import type { Product } from "../../../../../types";

export const prerender = false;

interface UpdateBody extends Partial<Omit<Product, "id" | "seller" | "rating" | "sold">> {}

/** PUT /api/stores/:idtoko/products/:productId — ubah semua field produk. */
export const PUT: APIRoute = async ({ params, request }) => {
  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  if (body.name !== undefined && !body.name.trim()) return err("Nama tidak boleh kosong", 400);
  if (body.price !== undefined && body.price <= 0) return err("Harga harus lebih dari 0", 400);

  if (body.slug !== undefined) {
    const existing = getProducts(params.idtoko!)
      .filter((p) => p.id !== params.productId)
      .map((p) => p.slug ?? slugify(p.name));
    body.slug = uniqueSlug(existing, body.slug);
  }
  if (body.badge !== undefined && body.badge !== "Terlaris" && body.badge !== "Baru") {
    body.badge = undefined;
  }

  const updated = updateProduct(params.idtoko!, params.productId!, body);
  if (!updated) return err("Produk tidak ditemukan", 404);
  return ok(updated);
};

/** DELETE /api/stores/:idtoko/products/:productId — hapus produk. */
export const DELETE: APIRoute = ({ params }) => {
  const success = removeProduct(params.idtoko!, params.productId!);
  if (!success) return err("Produk tidak ditemukan", 404);
  return ok({ deleted: true });
};