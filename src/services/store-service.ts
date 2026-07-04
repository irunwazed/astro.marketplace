import { apiGet } from "./http";
import type { Product, Store, StoreMember } from "../types";

export interface StoreDetail {
  store: Store;
  members: StoreMember[];
  products: Product[];
}

/** GET /api/store — toko demo beserta anggota & produknya. */
export function getStore(): Promise<StoreDetail> {
  return apiGet<StoreDetail>("/api/store");
}
