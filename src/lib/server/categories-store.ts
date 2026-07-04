import { categories } from "../../data/stores";

/**
 * Penyimpanan kategori produk di memori server — seed dari data demo,
 * hilang saat restart. Kategori adalah referensi global (dipakai semua toko).
 */
let items: string[] = [...categories];

export function getCategories(): string[] {
  return [...items];
}

export function addCategory(name: string): string {
  if (!items.includes(name)) items.push(name);
  return name;
}

export function updateCategory(oldName: string, newName: string): boolean {
  const idx = items.indexOf(oldName);
  if (idx === -1) return false;
  if (items.includes(newName)) return false;
  items[idx] = newName;
  return true;
}

export function removeCategory(name: string): boolean {
  const idx = items.indexOf(name);
  if (idx === -1) return false;
  items.splice(idx, 1);
  return true;
}