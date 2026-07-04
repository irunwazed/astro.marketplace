import { useEffect, useState } from "react";
import { CART_EVENT, cartTotal, getCarts, getAllCartItems, removeFromCart, sellerId, updateQty } from "../../lib/cart";
import { requireLogin } from "../../lib/session";
import { formatIDR } from "./ProductCard";
import type { CartItem } from "../../types";

type CartMap = Record<string, CartItem[]>;

export default function CartView() {
  const [carts, setCarts] = useState<CartMap | null>(null);

  useEffect(() => {
    const sync = () => setCarts(getCarts());
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  if (carts === null) return null;

  const allItems = getAllCartItems();
  if (allItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-bold">Keranjang masih kosong</p>
        <p className="mt-1 text-sm text-moss">Yuk mulai belanja produk UMKM anggota koperasi.</p>
        <a
          href="/products"
          className="mt-5 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Lihat Produk
        </a>
      </div>
    );
  }

  const sellers = Object.keys(carts);

  return (
    <div className="space-y-8">
      {sellers.map((seller) => {
        const items = carts[seller];
        const subtotal = cartTotal(items);
        return (
          <section
            key={seller}
            className="rounded-2xl border border-ink/10 bg-white/60 p-5"
            aria-label={`Keranjang toko ${seller}`}
          >
            <header className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">{seller}</h2>
              <span className="text-xs text-moss">{items.reduce((s, i) => s + i.qty, 0)} item</span>
            </header>

            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white p-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      <a
                        href={`/products/${item.productId}`}
                        className="transition-colors hover:text-brand"
                      >
                        {item.name}
                      </a>
                    </p>
                    <p className="text-xs text-moss">
                      {item.stock !== undefined && `Stok ${item.stock}`}
                    </p>
                    <p className="mt-1 text-xs text-moss">
                      {item.qty} × {formatIDR(item.price)}
                    </p>
                    <p className="font-display text-sm font-bold">{formatIDR(item.price * item.qty)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Kurangi jumlah ${item.name}`}
                      onClick={() => updateQty(item.seller, item.productId, item.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-sm font-bold transition-colors hover:border-brand hover:text-brand"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Tambah jumlah ${item.name}`}
                      onClick={() => updateQty(item.seller, item.productId, item.qty + 1)}
                      disabled={item.stock !== undefined && item.qty >= item.stock}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-sm font-bold transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Hapus ${item.name} dari keranjang`}
                    onClick={() => removeFromCart(item.seller, item.productId)}
                    className="text-moss transition-colors hover:text-rose"
                  >
                    <svg
                      className="h-4.5 w-4.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-moss">Subtotal</dt>
                <dd className="font-semibold">{formatIDR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-moss">Ongkir</dt>
                <dd className="font-semibold text-moss">Ditentukan saat checkout</dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2">
                <dt className="font-semibold">Subtotal</dt>
                <dd className="font-display text-lg font-bold">{formatIDR(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-1 text-right text-[11px] text-moss">
              Ongkir &amp; biaya admin final dihitung di halaman checkout.
            </p>

            <button
              type="button"
              onClick={() => {
                const href = `/checkout?toko=${sellerId(seller)}`;
                if (requireLogin(href)) window.location.href = href;
              }}
              className="mt-3 block w-full rounded-full bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Checkout toko ini
            </button>
          </section>
        );
      })}
    </div>
  );
}