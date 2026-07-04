import type { APIRoute } from "astro";
import { err, ok } from "../../../../../lib/server/response";
import { addProduct, getProducts } from "../../../../../lib/server/store-products-store";
import { myStore } from "../../../../../data/my-store";
import { slugify, uniqueSlug } from "../../../../../lib/slug";
import type { Product } from "../../../../../types";

export const prerender = false;

interface AddProductBody {
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  categories?: string[];
  badge?: string;
  stock?: number;
  volume?: string;
  description?: string;
  published?: boolean;
  slug?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
}

/** GET /api/stores/:idtoko/products — semua produk toko (published + draft). */
export const GET: APIRoute = ({ params }) => ok(getProducts(params.idtoko!));

/** POST /api/stores/:idtoko/products — tambah produk. */
export const POST: APIRoute = async ({ params, request }) => {
  let body: AddProductBody;
  try {
    body = (await request.json()) as AddProductBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  const name = body.name?.trim();
  if (!name) return err("Nama produk wajib diisi", 400);
  if (!body.price || body.price <= 0) return err("Harga harus lebih dari 0", 400);
  if (body.stock === undefined || body.stock < 0) return err("Stok tidak boleh negatif", 400);
  if (!body.volume?.trim()) return err("Volume/berat wajib diisi", 400);
  if (!body.categories?.length) return err("Pilih minimal satu kategori", 400);
  if (!body.description?.trim()) return err("Penjelasan produk wajib diisi", 400);

  const existing = getProducts(params.idtoko!).map((p) => p.slug ?? slugify(p.name));
  const slug = body.slug?.trim() ? uniqueSlug(existing, body.slug) : uniqueSlug(existing, name);
  const seller = params.idtoko === "ST-1" ? myStore.name : "Toko";

  const product: Product = {
    id: `P-${Date.now()}`,
    name,
    price: body.price,
    originalPrice: body.originalPrice && body.originalPrice > 0 ? body.originalPrice : undefined,
    image: body.image || `https://placehold.co/400x400/f2f6f9/269dd8?text=${encodeURIComponent(name)}`,
    category: body.category || body.categories[0],
    categories: body.categories,
    seller,
    rating: 0,
    sold: 0,
    badge: body.badge === "Terlaris" || body.badge === "Baru" ? body.badge : undefined,
    stock: body.stock,
    volume: body.volume.trim(),
    description: body.description.trim(),
    published: body.published ?? true,
    slug,
    weight: body.weight,
    dimensions: body.dimensions,
  };
  return ok(addProduct(params.idtoko!, product), 201);
};