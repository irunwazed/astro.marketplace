import { useEffect, useState } from "react";
import { WISHLIST_EVENT, getWishlist } from "../../lib/wishlist";
import { products } from "../../data/products";
import ProductCard from "./ProductCard";

/** Halaman wishlist — tampilkan produk yang disimpan user (match by id). */
export default function WishlistView() {
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setIds(getWishlist());
    sync();
    setLoading(false);
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const items = products.filter((p) => ids.includes(p.id) && p.published);

  if (loading) return <p className="text-sm text-moss">Memuat wishlist…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-bold">Wishlist masih kosong</p>
        <p className="mt-1 text-sm text-moss">
          Tekan ikon ♥ di produk untuk menyimpannya di sini.
        </p>
        <a
          href="/products"
          className="mt-5 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Lihat Produk
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-moss">{items.length} produk disimpan</p>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}