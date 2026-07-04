import { apiGet } from "./http";
import type { Product } from "../types";

export interface ProductFilter {
  q?: string;
  kategori?: string;
  toko?: string;
  minHarga?: number;
  maxHarga?: number;
  sort?: "termurah" | "termahal";
}

/** GET /api/products dengan filter pencarian, kategori, toko, range harga, dan urutan. */
export function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filter.q?.trim()) params.set("q", filter.q.trim());
  if (filter.kategori && filter.kategori !== "Semua") params.set("kategori", filter.kategori);
  if (filter.toko && filter.toko !== "Semua") params.set("toko", filter.toko);
  if (filter.minHarga && filter.minHarga > 0) params.set("minHarga", String(filter.minHarga));
  if (filter.maxHarga && filter.maxHarga > 0) params.set("maxHarga", String(filter.maxHarga));
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
