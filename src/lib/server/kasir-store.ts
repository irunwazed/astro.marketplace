import type { KasirTransaction } from "../../types";

/**
 * Penyimpanan transaksi kasir di memori server — hilang saat restart.
 * Pola sama dengan orders-store.ts & store-*-store.ts.
 */
const store = new Map<string, KasirTransaction[]>();

export function getTransactions(storeId: string): KasirTransaction[] {
  if (!store.has(storeId)) store.set(storeId, []);
  return store.get(storeId)!;
}

export function addTransaction(storeId: string, tx: KasirTransaction): KasirTransaction {
  const list = getTransactions(storeId);
  list.unshift(tx);
  return tx;
}