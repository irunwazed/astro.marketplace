import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { getProducts } from "../../services/product-service";
import type { Product } from "../../types";
import ProductCard from "./ProductCard";
import { formatIDR } from "./ProductCard";

type Sort = "default" | "termurah" | "termahal";

interface Props {
  products: Product[];
}

const PRICE_CHIPS = [
  { label: "Semua", min: 0, max: 0 },
  { label: "< Rp 20.000", min: 0, max: 20000 },
  { label: "Rp 20.000–50.000", min: 20000, max: 50000 },
  { label: "Rp 50.000–100.000", min: 50000, max: 100000 },
  { label: "> Rp 100.000", min: 100000, max: 0 },
];

export default function ProductBrowser({ products }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [seller, setSeller] = useState("Semua");
  const [priceIdx, setPriceIdx] = useState(0);
  const [minHarga, setMinHarga] = useState("");
  const [maxHarga, setMaxHarga] = useState("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [sort, setSort] = useState<Sort>("default");
  const [visible, setVisible] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Terima kata kunci & kategori dari URL (form pencarian header, chip kategori).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const kategori = params.get("kategori");
    if (q) setQuery(q);
    if (kategori) setCategory(kategori);
  }, []);

  const categories = useMemo(() => {
    const unique = ["Semua", ...Array.from(new Set(products.map((p) => p.category)))];
    if (category !== "Semua" && !unique.includes(category)) unique.push(category);
    return unique;
  }, [products, category]);

  const sellers = useMemo(
    () => ["Semua", ...Array.from(new Set(products.map((p) => p.seller)))].sort(),
    [products],
  );

  const activePrice = useCustomPrice
    ? { min: Number(minHarga) || 0, max: Number(maxHarga) || 0 }
    : { min: PRICE_CHIPS[priceIdx].min, max: PRICE_CHIPS[priceIdx].max };

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
            toko: seller,
            minHarga: activePrice.min,
            maxHarga: activePrice.max,
            sort: sort === "default" ? undefined : sort,
          }),
        );
      } catch {
        const keyword = query.trim().toLowerCase();
        const filtered = products.filter((p) => {
          const okCat = category === "Semua" || p.category === category || p.categories.includes(category);
          const okSeller = seller === "Semua" || p.seller === seller;
          const okQuery = keyword === "" || p.name.toLowerCase().includes(keyword);
          const okMin = activePrice.min === 0 || p.price >= activePrice.min;
          const okMax = activePrice.max === 0 || p.price <= activePrice.max;
          return okCat && okSeller && okQuery && okMin && okMax;
        });
        if (sort === "termurah") filtered.sort((a, b) => a.price - b.price);
        if (sort === "termahal") filtered.sort((a, b) => b.price - a.price);
        setVisible(filtered);
      }
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, category, seller, sort, useCustomPrice, minHarga, maxHarga, priceIdx]);

  const resetFilters = () => {
    setQuery("");
    setCategory("Semua");
    setSeller("Semua");
    setPriceIdx(0);
    setUseCustomPrice(false);
    setMinHarga("");
    setMaxHarga("");
    setSort("default");
  };

  const activeCount =
    (category !== "Semua" ? 1 : 0) +
    (seller !== "Semua" ? 1 : 0) +
    (useCustomPrice ? (minHarga || maxHarga ? 1 : 0) : priceIdx !== 0 ? 1 : 0) +
    (sort !== "default" ? 1 : 0);

  const FilterPanel = (
    <div className="space-y-6">
      {/* Kategori */}
      <section>
        <h3 className="mb-2 text-sm font-bold">Kategori</h3>
        <ul className="space-y-1.5">
          {categories.map((c) => (
            <li key={c}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  category === c ? "bg-brand/10 font-semibold text-brand" : "text-ink/80 hover:bg-ink/5",
                )}
              >
                <input
                  type="radio"
                  name="kategori"
                  checked={category === c}
                  onChange={() => setCategory(c)}
                  className="h-4 w-4 accent-brand"
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* Range harga */}
      <section>
        <h3 className="mb-2 text-sm font-bold">Range Harga</h3>
        <ul className="space-y-1.5">
          {PRICE_CHIPS.map((chip, i) => (
            <li key={chip.label}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  !useCustomPrice && priceIdx === i
                    ? "bg-brand/10 font-semibold text-brand"
                    : "text-ink/80 hover:bg-ink/5",
                )}
              >
                <input
                  type="radio"
                  name="pricechip"
                  checked={!useCustomPrice && priceIdx === i}
                  onChange={() => {
                    setUseCustomPrice(false);
                    setPriceIdx(i);
                  }}
                  className="h-4 w-4 accent-brand"
                />
                {chip.label}
              </label>
            </li>
          ))}
        </ul>

        {/* Custom range */}
        <div className="mt-3 border-t border-ink/10 pt-3">
          <p className="mb-2 text-xs font-semibold text-ink/80">Atur manual</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minHarga}
              onChange={(e) => {
                setUseCustomPrice(true);
                setMinHarga(e.target.value);
              }}
              placeholder="Min"
              className="w-full rounded-md border border-ink/15 px-2 py-1.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <span className="text-xs text-moss">—</span>
            <input
              type="number"
              value={maxHarga}
              onChange={(e) => {
                setUseCustomPrice(true);
                setMaxHarga(e.target.value);
              }}
              placeholder="Max"
              className="w-full rounded-md border border-ink/15 px-2 py-1.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </section>

      {/* Toko */}
      <section>
        <h3 className="mb-2 text-sm font-bold">Toko</h3>
        <ul className="space-y-1.5">
          {sellers.map((s) => (
            <li key={s}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  seller === s ? "bg-brand/10 font-semibold text-brand" : "text-ink/80 hover:bg-ink/5",
                )}
              >
                <input
                  type="radio"
                  name="toko"
                  checked={seller === s}
                  onChange={() => setSeller(s)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="truncate">{s}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="w-full rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
        >
          Atur ulang filter ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Bar atas: search + sort + tombol filter mobile */}
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
        <div className="flex gap-2">
          <label htmlFor="product-sort" className="sr-only">
            Urutkan produk
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="cursor-pointer rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="default">Urutan standar</option>
            <option value="termurah">Harga terendah</option>
            <option value="termahal">Harga tertinggi</option>
          </select>
          <button
            type="button"
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand lg:hidden"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filter
            {activeCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 rounded-xl border border-ink/10 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Filter</h2>
            </div>
            {FilterPanel}
          </div>
        </aside>

        {/* Grid produk */}
        <div className="space-y-3">
          <p className="text-sm text-moss" aria-live="polite">
            {loading ? "Memuat…" : `${visible.length} dari ${products.length} produk`}
            {category !== "Semua" && ` · ${category}`}
            {seller !== "Semua" && ` · ${seller}`}
            {(activePrice.min > 0 || activePrice.max > 0) &&
              ` · ${formatIDR(activePrice.min)}${activePrice.max > 0 ? `–${formatIDR(activePrice.max)}` : "+"}`}
          </p>

          {visible.length > 0 ? (
            <ul
              className={cn(
                "grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 xl:grid-cols-4",
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
                  : "Coba ubah kata kunci atau filter."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                Atur ulang filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer filter mobile */}
      {showFilter && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onMouseDown={(e) => e.target === e.currentTarget && setShowFilter(false)}
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="font-display text-lg font-bold">Filter</h2>
              <button
                type="button"
                onClick={() => setShowFilter(false)}
                aria-label="Tutup filter"
                className="flex h-8 w-8 items-center justify-center rounded-full text-moss hover:bg-ink/5 hover:text-ink"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{FilterPanel}</div>
            <div className="border-t border-ink/10 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowFilter(false)}
                className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Tampilkan {visible.length} produk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}