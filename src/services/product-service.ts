import { apiGet } from "./http";
import type { Product } from "../types";

export interface ProductFilter {
  q?: string;
  kategori?: string;
  sort?: "termurah" | "termahal";
}

/** GET /api/products dengan filter pencarian, kategori, dan urutan harga. */
export function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filter.q?.trim()) params.set("q", filter.q.trim());
  if (filter.kategori && filter.kategori !== "Semua") params.set("kategori", filter.kategori);
  if (filter.sort) params.set("sort", filter.sort);
  const query = params.toString();
  return apiGet<Product[]>(`/api/products${query ? `?${query}` : ""}`);
}

/** GET /api/products/:id */
export function getProduct(id: string): Promise<Product> {
  return apiGet<Product>(`/api/products/${id}`);
}

/** GET /api/categories */
export function getCategories(): Promise<string[]> {
  return apiGet<string[]>("/api/categories");
}
