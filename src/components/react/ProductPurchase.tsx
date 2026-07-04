import { useState } from "react";
import { addToCart } from "../../lib/cart";
import { getProduct } from "../../services/product-service";
import { formatIDR } from "./ProductCard";
import type { Product } from "../../types";

/** Kontrol jumlah + tombol beli di halaman detail produk. */
export default function ProductPurchase({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  const changeQty = (delta: number) =>
    setQty(Math.min(Math.max(1, qty + delta), product.stock));

  // Ambil data produk terbaru dari API (stok bisa berubah); fallback ke props.
  const freshProduct = async (): Promise<Product> => {
    try {
      return await getProduct(product.id);
    } catch {
      return product;
    }
  };

  const handleAdd = async () => {
    setBusy(true);
    addToCart(await freshProduct(), qty);
    setBusy(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = async () => {
    setBusy(true);
    addToCart(await freshProduct(), qty);
    window.location.href = "/cart";
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink/80">Jumlah</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            onClick={() => changeQty(-1)}
            disabled={qty <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-sm font-bold transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            onClick={() => changeQty(1)}
            disabled={qty >= product.stock}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-sm font-bold transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
      <p className="mt-2 flex justify-between border-t border-ink/10 pt-2 text-sm">
        <span className="text-moss">Subtotal</span>
        <span className="font-display text-lg font-bold">{formatIDR(product.price * qty)}</span>
      </p>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy}
          className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
        >
          {added ? "✓ Masuk keranjang" : "+ Tambah ke Keranjang"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={busy}
          className="w-full rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
        >
          Beli Sekarang
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-moss">
        Stok tersedia: <strong className="text-ink">{product.stock}</strong> · {product.volume}
      </p>
    </div>
  );
}
