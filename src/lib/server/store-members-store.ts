import type { StoreMember } from "../../types";
import { myStoreMembers } from "../../data/my-store";

/**
 * Penyimpanan anggota toko di memori server — seed dari data demo untuk ST-1,
 * hilang saat server restart. Pola sama dengan orders-store.ts.
 */
const store = new Map<string, StoreMember[]>();

function seed(storeId: string): StoreMember[] {
  if (storeId === "ST-1") return myStoreMembers.map((m) => ({ ...m }));
  return [];
}

export function getMembers(storeId: string): StoreMember[] {
  if (!store.has(storeId)) store.set(storeId, seed(storeId));
  return store.get(storeId)!;
}

export function addMember(storeId: string, member: StoreMember): StoreMember {
  const list = getMembers(storeId);
  list.push(member);
  return member;
}

export function updateMember(
  storeId: string,
  memberId: string,
  patch: Partial<Pick<StoreMember, "name" | "role" | "status">>,
): StoreMember | undefined {
  const list = getMembers(storeId);
  const m = list.find((x) => x.id === memberId);
  if (!m) return undefined;
  if (patch.name !== undefined) m.name = patch.name;
  if (patch.role !== undefined) m.role = patch.role;
  if (patch.status !== undefined) m.status = patch.status;
  return m;
}

export function removeMember(storeId: string, memberId: string): boolean {
  const list = getMembers(storeId);
  const idx = list.findIndex((x) => x.id === memberId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}