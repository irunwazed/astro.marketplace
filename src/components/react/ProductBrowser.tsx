import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { getProducts } from "../../services/product-service";
import type { Product } from "../../types";
import ProductCard from "./ProductCard";

type Sort = "default" | "termurah" | "termahal";

interface Props {
  products: Product[];
}

export default function ProductBrowser({ products }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState<Sort>("default");
  const [visible, setVisible] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);

  // Terima kata kunci & kategori dari URL (form pencarian header, chip kategori).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const kategori = params.get("kategori");
    if (q) setQuery(q);
    if (kategori) setCategory(kategori);
  }, []);

  // Filter dieksekusi server lewat service → GET /api/products (debounce 250 ms).
  // Bila API tak terjangkau, jatuh ke penyaringan lokal dari props.
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setVisible(
          await getProducts({
            q: query,
            kategori: category,
            sort: sort === "default" ? undefined : sort,
          }),
        );
      } catch {
        const keyword = query.trim().toLowerCase();
        const filtered = products.filter(
          (p) =>
            (category === "Semua" || p.category === category || p.categories.includes(category)) &&
            (keyword === "" || p.name.toLowerCase().includes(keyword)),
        );
        if (sort === "termurah") filtered.sort((a, b) => a.price - b.price);
        if (sort === "termahal") filtered.sort((a, b) => b.price - a.price);
        setVisible(filtered);
      }
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [products, query, category, sort]);

  const categories = useMemo(() => {
    const unique = ["Semua", ...Array.from(new Set(products.map((p) => p.category)))];
    // Kategori dari URL bisa saja tak punya produk (mis. PPOB & Pulsa) — tetap tampilkan chipnya.
    if (category !== "Semua" && !unique.includes(category)) unique.push(category);
    return unique;
  }, [products, category]);

  const resetFilters = () => {
    setQuery("");
    setCategory("Semua");
    setSort("default");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-moss"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <label htmlFor="product-search" className="sr-only">
            Cari produk
          </label>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari beras, kopi, kerajinan, sembako..."
            className="w-full rounded-full border border-ink/10 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-moss focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label htmlFor="product-sort" className="sr-only">
            Urutkan produk
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="w-full cursor-pointer rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-auto"
          >
            <option value="default">Urutan standar</option>
            <option value="termurah">Harga terendah</option>
            <option value="termahal">Harga tertinggi</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active
                  ? "border-brand bg-brand font-semibold text-white"
                  : "border-ink/10 bg-white text-ink/80 hover:border-brand hover:text-brand",
              )}
            >
              {c}
            </button>
          );
        })}
        <p className="ml-auto text-sm text-moss" aria-live="polite">
          {loading ? "Memuat…" : `${visible.length} dari ${products.length} produk`}
        </p>
      </div>

      {visible.length > 0 ? (
        <ul
          className={cn(
            "grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            loading && "opacity-60",
          )}
        >
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-lg font-bold">Tidak ada produk yang cocok</p>
          <p className="mt-1 text-sm text-moss">
            {query.trim()
              ? `Tidak ditemukan hasil untuk "${query.trim()}".`
              : "Coba ubah kata kunci atau kategori."}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Atur ulang filter
          </button>
        </div>
      )}
    </div>
  );
}
