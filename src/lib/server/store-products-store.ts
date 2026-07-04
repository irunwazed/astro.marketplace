import type { Product } from "../../types";
import { myStoreProducts } from "../../data/my-store";

/**
 * Penyimpanan produk toko di memori server — seed dari data demo untuk ST-1,
 * hilang saat server restart. Pola sama dengan orders-store.ts.
 */
const store = new Map<string, Product[]>();

function seed(storeId: string): Product[] {
  if (storeId === "ST-1") return myStoreProducts.map((p) => ({ ...p }));
  return [];
}

export function getProducts(storeId: string): Product[] {
  if (!store.has(storeId)) store.set(storeId, seed(storeId));
  return store.get(storeId)!;
}

export function addProduct(storeId: string, product: Product): Product {
  const list = getProducts(storeId);
  list.push(product);
  return product;
}

export function updateProduct(
  storeId: string,
  productId: string,
  patch: Partial<Product>,
): Product | undefined {
  const list = getProducts(storeId);
  const p = list.find((x) => x.id === productId);
  if (!p) return undefined;
  Object.assign(p, patch);
  return p;
}

export function removeProduct(storeId: string, productId: string): boolean {
  const list = getProducts(storeId);
  const idx = list.findIndex((x) => x.id === productId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}