import type { APIRoute } from "astro";
import { err, ok } from "../../lib/server/response";
import {
  addCategory,
  getCategories,
  removeCategory,
  updateCategory,
} from "../../lib/server/categories-store";

export const prerender = false;

/** GET /api/categories — master kategori produk. */
export const GET: APIRoute = () => ok(getCategories());

/** POST /api/categories — tambah kategori. Body: { name } */
export const POST: APIRoute = async ({ request }) => {
  let body: { name?: string };
  try {
    body = (await request.json()) as { name?: string };
  } catch {
    return err("Body harus JSON", 400);
  }
  const name = body.name?.trim();
  if (!name) return err("Nama kategori wajib diisi", 400);
  if (getCategories().includes(name)) return err("Kategori sudah ada", 400);
  return ok(addCategory(name), 201);
};

/** PUT /api/categories — ubah nama kategori. Body: { oldName, newName } */
export const PUT: APIRoute = async ({ request }) => {
  let body: { oldName?: string; newName?: string };
  try {
    body = (await request.json()) as { oldName?: string; newName?: string };
  } catch {
    return err("Body harus JSON", 400);
  }
  const oldName = body.oldName?.trim();
  const newName = body.newName?.trim();
  if (!oldName || !newName) return err("oldName & newName wajib diisi", 400);
  if (getCategories().includes(newName)) return err("Nama kategori sudah dipakai", 400);
  const success = updateCategory(oldName, newName);
  if (!success) return err("Kategori lama tidak ditemukan", 404);
  return ok({ renamed: true });
};

/** DELETE /api/categories?name=... — hapus kategori. */
export const DELETE: APIRoute = ({ url }) => {
  const name = url.searchParams.get("name")?.trim();
  if (!name) return err("Query `name` wajib diisi", 400);
  const success = removeCategory(name);
  if (!success) return err("Kategori tidak ditemukan", 404);
  return ok({ deleted: true });
};