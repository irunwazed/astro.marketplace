import { apiDelete, apiGet, apiPost, apiPut } from "./http";
import { myStoreMembers, myStoreProducts } from "../data/my-store";
import { dropPoints } from "../data/drop-points";
import type { KasirPaymentMethod, KasirTransaction, Product, Store, StoreDropPoint, StoreMember } from "../types";

export interface StoreDetail {
  store: Store;
  members: StoreMember[];
  products: Product[];
}

/** GET /api/store — toko demo beserta anggota & produknya. */
export function getStore(): Promise<StoreDetail> {
  return apiGet<StoreDetail>("/api/store");
}

/* ---------- Anggota ---------- */

export function getMembers(storeId: string): Promise<StoreMember[]> {
  return apiGet<StoreMember[]>(`/api/stores/${storeId}/members`);
}

export function addMember(
  storeId: string,
  payload: { name: string; email: string; role: StoreMember["role"]; status?: StoreMember["status"] },
): Promise<StoreMember> {
  return apiPost<StoreMember>(`/api/stores/${storeId}/members`, payload);
}

export function updateMember(
  storeId: string,
  memberId: string,
  patch: Partial<Pick<StoreMember, "name" | "role" | "status">>,
): Promise<StoreMember> {
  return apiPut<StoreMember>(`/api/stores/${storeId}/members/${memberId}`, patch);
}

export function removeMember(storeId: string, memberId: string): Promise<void> {
  return apiDelete<void>(`/api/stores/${storeId}/members/${memberId}`);
}

/** Fallback data lokal bila API tak terjangkau. */
export function fallbackMembers(storeId: string): StoreMember[] {
  if (storeId === "ST-1") return myStoreMembers.map((m) => ({ ...m }));
  return [];
}

/* ---------- Produk ---------- */

export function getProducts(storeId: string): Promise<Product[]> {
  return apiGet<Product[]>(`/api/stores/${storeId}/products`);
}

export function addProduct(storeId: string, payload: Partial<Product>): Promise<Product> {
  return apiPost<Product>(`/api/stores/${storeId}/products`, payload);
}

export function updateProduct(storeId: string, productId: string, patch: Partial<Product>): Promise<Product> {
  return apiPut<Product>(`/api/stores/${storeId}/products/${productId}`, patch);
}

export function removeProduct(storeId: string, productId: string): Promise<void> {
  return apiDelete<void>(`/api/stores/${storeId}/products/${productId}`);
}

export function fallbackProducts(storeId: string): Product[] {
  if (storeId === "ST-1") return myStoreProducts.map((p) => ({ ...p }));
  return [];
}

/* ---------- Drop Point ---------- */

export function getStoreDropPoints(storeId: string): Promise<StoreDropPoint[]> {
  return apiGet<StoreDropPoint[]>(`/api/stores/${storeId}/drop-points`);
}

export function addStoreDropPoint(
  storeId: string,
  payload: { name: string; address: string; lat: number; lng: number; shippingCost: number },
): Promise<StoreDropPoint> {
  return apiPost<StoreDropPoint>(`/api/stores/${storeId}/drop-points`, payload);
}

export function updateStoreDropPoint(
  storeId: string,
  dpId: string,
  patch: Partial<Pick<StoreDropPoint, "name" | "address" | "location" | "shippingCost">>,
): Promise<StoreDropPoint> {
  return apiPut<StoreDropPoint>(`/api/stores/${storeId}/drop-points/${dpId}`, patch);
}

export function removeStoreDropPoint(storeId: string, dpId: string): Promise<void> {
  return apiDelete<void>(`/api/stores/${storeId}/drop-points/${dpId}`);
}

export function fallbackDropPoints(): StoreDropPoint[] {
  return [];
}

export { dropPoints as masterDropPoints };

/* ---------- Kasir ---------- */

export interface KasirCheckoutPayload {
  items: { productId: string; qty: number }[];
  paymentMethod: KasirPaymentMethod;
  memberNo?: string;
  memberName?: string;
  kasirName?: string;
  kasirEmail?: string;
}

export function kasirCheckout(storeId: string, payload: KasirCheckoutPayload): Promise<KasirTransaction> {
  return apiPost<KasirTransaction>(`/api/stores/${storeId}/kasir`, payload);
}

export function getKasirTransactions(storeId: string): Promise<KasirTransaction[]> {
  return apiGet<KasirTransaction[]>(`/api/stores/${storeId}/kasir`);
}

/* ---------- Referensi Kategori ---------- */

export function getCategories(): Promise<string[]> {
  return apiGet<string[]>("/api/categories");
}

export function addCategory(name: string): Promise<string> {
  return apiPost<string>("/api/categories", { name });
}

export function updateCategory(oldName: string, newName: string): Promise<void> {
  return apiPut<void>("/api/categories", { oldName, newName });
}

export function removeCategory(name: string): Promise<void> {
  return apiDelete<void>(`/api/categories?name=${encodeURIComponent(name)}`);
}

export function fallbackCategories(): string[] {
  return ["Sembako", "Makanan & Minuman", "Kerajinan Tangan", "Pertanian Segar", "Fashion & Kain", "Kesehatan & Herbal"];
}