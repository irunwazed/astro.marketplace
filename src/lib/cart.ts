import type { CartItem, Product } from "../types";

/**
 * Keranjang demo berbasis localStorage — simulasi tanpa backend.
 *
 * Berbeda toko = berbeda keranjang. Isi keranjang disimpan per nama toko (`seller`)
 * sebagai map `{ [seller]: CartItem[] }` di key `pk-carts`. Satu checkout hanya
 * memproses satu toko, jadi satu order = satu toko = satu QRIS.
 *
 * Island React yang menampilkan keranjang harus mendengarkan CART_EVENT
 * agar sinkron antar-komponen di halaman yang sama.
 */
const KEY = "pk-carts";
const LEGACY_KEY = "pk-cart";
export const CART_EVENT = "pk-cart-change";

type CartMap = Record<string, CartItem[]>;

/** Ambil semua bucket toko. */
export function getCarts(): CartMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as CartMap;
  } catch {
    /* fall through ke migrasi */
  }
  // Migrasi satu kali dari flat list lama (pk-cart) → bucket per seller.
  const migrated = migrateLegacy();
  if (migrated && Object.keys(migrated).length > 0) {
    try {
      localStorage.setItem(KEY, JSON.stringify(migrated));
    } catch {
      /* abaikan */
    }
    return migrated;
  }
  return {};
}

function migrateLegacy(): CartMap | null {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    const items = JSON.parse(legacy) as CartItem[];
    if (!Array.isArray(items)) return null;
    const map: CartMap = {};
    for (const item of items) {
      (map[item.seller] ??= []).push(item);
    }
    localStorage.removeItem(LEGACY_KEY);
    return map;
  } catch {
    return null;
  }
}

function save(carts: CartMap) {
  localStorage.setItem(KEY, JSON.stringify(carts));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/** Ambil satu bucket toko. */
export function getCart(seller: string): CartItem[] {
  return getCarts()[seller] ?? [];
}

/** Ambil semua item dari semua toko (flatten) — dipakai badge header & empty state. */
export function getAllCartItems(): CartItem[] {
  return Object.values(getCarts()).flat();
}

export function addToCart(product: Product, qty = 1) {
  const carts = getCarts();
  const bucket = carts[product.seller] ?? [];
  const existing = bucket.find((i) => i.productId === product.id);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock);
    existing.stock = product.stock;
  } else {
    bucket.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      seller: product.seller,
      qty: Math.min(qty, product.stock),
      stock: product.stock,
    });
  }
  carts[product.seller] = bucket;
  save(carts);
}

export function updateQty(seller: string, productId: string, qty: number) {
  const carts = getCarts();
  const bucket = (carts[seller] ?? [])
    .map((i) => (i.productId === productId ? { ...i, qty: Math.min(qty, i.stock ?? qty) } : i))
    .filter((i) => i.qty > 0);
  if (bucket.length === 0) {
    delete carts[seller];
  } else {
    carts[seller] = bucket;
  }
  save(carts);
}

export function removeFromCart(seller: string, productId: string) {
  const carts = getCarts();
  const bucket = (carts[seller] ?? []).filter((i) => i.productId !== productId);
  if (bucket.length === 0) {
    delete carts[seller];
  } else {
    carts[seller] = bucket;
  }
  save(carts);
}

/** Hapus hanya cart satu toko — dipakai setelah checkout toko itu. */
export function clearCart(seller: string) {
  const carts = getCarts();
  delete carts[seller];
  save(carts);
}

/** Hapus semua cart (semua toko). */
export function clearAllCarts() {
  save({});
}

/** Total kuantitas lintas semua toko — dipakai badge keranjang di header. */
export function cartCount(): number {
  return getAllCartItems().reduce((sum, i) => sum + i.qty, 0);
}

/** Subtotal dari sekumpulan item (bukan grand total). */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/** Slug id toko dari nama — dipakai sebagai `?toko=<id>` di URL checkout. */
export function sellerId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Cari bucket toko berdasarkan slug id dari URL. */
export function findBucketBySellerId(id: string): { seller: string; items: CartItem[] } | null {
  const carts = getCarts();
  for (const seller of Object.keys(carts)) {
    if (sellerId(seller) === id) return { seller, items: carts[seller] };
  }
  return null;
}