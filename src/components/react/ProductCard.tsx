import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { addToCart } from "../../lib/cart";
import { requireLogin } from "../../lib/session";
import { flyToCart } from "../../lib/fly-to-cart";
import { isWishlisted, toggleWishlist } from "../../lib/wishlist";
import type { Product } from "../../types";

export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setWished(isWishlisted(product.id));
  }, [product.id]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleAdd = () => {
    if (!requireLogin(window.location.pathname)) return;
    addToCart(product);
    if (imgRef.current) flyToCart(imgRef.current);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = () => {
    if (!requireLogin(window.location.pathname)) return;
    setWished(toggleWishlist(product.id));
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm shadow-ink/5 transition-shadow hover:shadow-md hover:shadow-ink/10">
      <div className="relative overflow-hidden">
        <a href={`/products/${product.id}`} aria-label={`Lihat detail ${product.name}`}>
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
          />
        </a>
        {product.badge && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white",
              product.badge === "Terlaris" ? "bg-rose" : "bg-brand",
            )}
          >
            {product.badge}
          </span>
        )}
        <button
          type="button"
          aria-label={wished ? `Hapus ${product.name} dari wishlist` : `Simpan ${product.name} ke wishlist`}
          aria-pressed={wished}
          onClick={handleWishlist}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            wished ? "text-rose scale-110" : "text-ink/70 hover:text-rose",
          )}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 14c1.5-1.5 3-3.4 3-5.5A4.5 4.5 0 0 0 17.5 4c-1.8 0-3 .7-4.1 2l-1.4 1.5L10.6 6C9.5 4.7 8.3 4 6.5 4A4.5 4.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <svg className="h-2 w-2" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {product.seller}
        </p>
        <h3 className="mt-1.5 text-sm font-semibold leading-snug">
          <a
            href={`/products/${product.id}`}
            className="transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {product.name}
          </a>
        </h3>
        <p className="mt-1.5 text-xs text-moss">
          <span className="text-amber-deep" aria-hidden="true">
            ★
          </span>{" "}
          {product.rating.toFixed(1)} · {product.sold} terjual
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="font-display text-lg font-bold leading-none">
              {formatIDR(product.price)}
            </p>
            {product.originalPrice && (
              <p className="mt-1 text-xs text-moss line-through">
                {formatIDR(product.originalPrice)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              added ? "bg-amber" : "bg-brand hover:bg-brand-dark",
            )}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {added ? <path d="m4 12.5 5 5L20 7" /> : <path d="M12 5v14M5 12h14" />}
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
