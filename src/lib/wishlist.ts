/**
 * Wishlist demo berbasis localStorage — daftar productId yang disimpan user.
 * Pola sama dengan cart.ts: perubahan disiarkan lewat WISHLIST_EVENT.
 */
const KEY = "pk-wishlist";
export const WISHLIST_EVENT = "pk-wishlist-change";

export function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

export function isWishlisted(productId: string): boolean {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId: string): boolean {
  const list = getWishlist();
  const exists = list.includes(productId);
  if (exists) {
    save(list.filter((id) => id !== productId));
    return false;
  }
  save([...list, productId]);
  return true;
}

export function wishlistCount(): number {
  return getWishlist().length;
}