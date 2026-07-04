import type { CartItem, Product } from "../types";

/**
 * Keranjang demo berbasis localStorage — simulasi tanpa backend.
 * Island React yang menampilkan keranjang harus mendengarkan CART_EVENT
 * agar sinkron antar-komponen di halaman yang sama.
 */
const KEY = "pk-cart";
export const CART_EVENT = "pk-cart-change";

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addToCart(product: Product, qty = 1) {
  const items = getCart();
  const existing = items.find((i) => i.productId === product.id);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock);
    existing.stock = product.stock;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      seller: product.seller,
      qty: Math.min(qty, product.stock),
      stock: product.stock,
    });
  }
  save(items);
}

export function updateQty(productId: string, qty: number) {
  const items = getCart()
    .map((i) =>
      i.productId === productId ? { ...i, qty: Math.min(qty, i.stock ?? qty) } : i,
    )
    .filter((i) => i.qty > 0);
  save(items);
}

export function removeFromCart(productId: string) {
  save(getCart().filter((i) => i.productId !== productId));
}

export function clearCart() {
  save([]);
}

export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
