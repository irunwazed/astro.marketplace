import { useEffect, useState } from "react";
import { CART_EVENT, cartTotal, getCart, removeFromCart, updateQty } from "../../lib/cart";
import { formatIDR } from "./ProductCard";
import type { CartItem } from "../../types";

export default function CartView() {
  const [items, setItems] = useState<CartItem[] | null>(null);

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-bold">Keranjang masih kosong</p>
        <p className="mt-1 text-sm text-moss">Yuk mulai belanja produk UMKM anggota koperasi.</p>
        <a
          href="/products"
          className="mt-5 inline-block rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
        >
          Lihat Produk
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
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
                  className="transition-colors hover:text-forest"
                >
                  {item.name}
                </a>
              </p>
              <p className="text-xs text-moss">
                {item.seller}
                {item.stock !== undefined && ` · stok ${item.stock}`}
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
                onClick={() => updateQty(item.productId, item.qty - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-sm font-bold transition-colors hover:border-forest hover:text-forest"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                {item.qty}
              </span>
              <button
                type="button"
                aria-label={`Tambah jumlah ${item.name}`}
                onClick={() => updateQty(item.productId, item.qty + 1)}
                disabled={item.stock !== undefined && item.qty >= item.stock}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-sm font-bold transition-colors hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
            <button
              type="button"
              aria-label={`Hapus ${item.name} dari keranjang`}
              onClick={() => removeFromCart(item.productId)}
              className="text-moss transition-colors hover:text-terracotta"
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

      <aside className="h-fit rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg font-bold">Ringkasan</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-moss">Total barang</dt>
            <dd className="font-semibold">{items.reduce((s, i) => s + i.qty, 0)} item</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-moss">Ongkir ke drop point</dt>
            <dd className="font-semibold text-forest">Gratis</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2">
            <dt className="font-semibold">Subtotal</dt>
            <dd className="font-display text-lg font-bold">{formatIDR(cartTotal(items))}</dd>
          </div>
        </dl>
        <a
          href="/checkout"
          className="mt-4 block rounded-full bg-forest px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
        >
          Lanjut ke Checkout
        </a>
      </aside>
    </div>
  );
}
