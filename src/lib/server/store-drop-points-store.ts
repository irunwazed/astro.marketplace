import type { StoreDropPoint } from "../../types";

/**
 * Penyimpanan drop point custom toko di memori server — drop point master
 * (dari src/data/drop-points.ts) tidak disimpan di sini, hanya yang dibuat
 * toko sendiri. Hilang saat server restart.
 */
const store = new Map<string, StoreDropPoint[]>();

export function getCustomDropPoints(storeId: string): StoreDropPoint[] {
  if (!store.has(storeId)) store.set(storeId, []);
  return store.get(storeId)!;
}

export function addCustomDropPoint(storeId: string, dp: StoreDropPoint): StoreDropPoint {
  const list = getCustomDropPoints(storeId);
  list.push(dp);
  return dp;
}

export function updateCustomDropPoint(
  storeId: string,
  dpId: string,
  patch: Partial<Pick<StoreDropPoint, "name" | "address" | "location" | "shippingCost">>,
): StoreDropPoint | undefined {
  const list = getCustomDropPoints(storeId);
  const dp = list.find((x) => x.id === dpId);
  if (!dp) return undefined;
  if (patch.name !== undefined) dp.name = patch.name;
  if (patch.address !== undefined) dp.address = patch.address;
  if (patch.location !== undefined) dp.location = patch.location;
  if (patch.shippingCost !== undefined) dp.shippingCost = patch.shippingCost;
  return dp;
}

export function removeCustomDropPoint(storeId: string, dpId: string): boolean {
  const list = getCustomDropPoints(storeId);
  const idx = list.findIndex((x) => x.id === dpId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}