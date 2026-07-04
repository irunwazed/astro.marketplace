import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { getSession } from "../../lib/session";
import {
  getMembers,
  getProducts,
  kasirCheckout,
} from "../../services/store-service";
import { formatIDR } from "./ProductCard";
import Modal from "./Modal";
import type { KasirPaymentMethod, KasirTransaction, KoperasiMember, Product, StoreMember } from "../../types";

interface Props {
  storeId: string;
  storeName: string;
  koperasiMembers: KoperasiMember[];
}

interface CartLine {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

const PAYMENTS: { id: KasirPaymentMethod; label: string; icon: string }[] = [
  { id: "cash", label: "Cash", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { id: "qris", label: "QRIS", icon: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" },
  { id: "transfer", label: "Transfer", icon: "M17 17l5-5-5-5M22 12H8M7 7l-5 5 5 5M2 12h14" },
];

export default function KasirPage({ storeId, storeName, koperasiMembers }: Props) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [barcode, setBarcode] = useState("");
  const [scanError, setScanError] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [payment, setPayment] = useState<KasirPaymentMethod>("cash");
  const [memberNo, setMemberNo] = useState("");
  const [memberInfo, setMemberInfo] = useState<KoperasiMember | null>(null);
  const [memberError, setMemberError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<KasirTransaction | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const session = getSession();
      if (!session) {
        setAuthed(false);
        return;
      }
      try {
        const members = await getMembers(storeId);
        const me = members.find(
          (m: StoreMember) => m.email === session.email && (m.role === "kasir" || m.role === "owner"),
        );
        setAuthed(!!me);
        if (me) {
          const prods = await getProducts(storeId).catch(() => []);
          setProducts(prods as Product[]);
        }
      } catch {
        setAuthed(false);
      }
    })();
  }, [storeId]);

  useEffect(() => {
    if (authed) barcodeRef.current?.focus();
  }, [authed]);

  // Fokus ke input search saat modal buka.
  useEffect(() => {
    if (showSearch) {
      setSearchQuery("");
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  const session = getSession();

  const addProduct = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, image: product.image, qty: 1 }];
    });
  };

  // Saat input berubah, cari produk secara realtime untuk preview.
  const handleBarcodeChange = (value: string) => {
    setBarcode(value);
    setScanError("");
    const code = value.trim();
    if (!code) {
      setScannedProduct(null);
      return;
    }
    const product = products.find(
      (p) => p.id === code || p.slug === code || p.name.toLowerCase() === code.toLowerCase(),
    );
    setScannedProduct(product ?? null);
  };

  // Tambah produk hasil scan ke cart.
  const handleAddScanned = () => {
    if (!scannedProduct) return;
    addProduct(scannedProduct);
    setBarcode("");
    setScannedProduct(null);
    barcodeRef.current?.focus();
  };

  // Scan via Enter di input barcode.
  const handleScan = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setScanError("");
    const code = barcode.trim();
    if (!code) return;
    const product = products.find(
      (p) => p.id === code || p.slug === code || p.name.toLowerCase() === code.toLowerCase(),
    );
    if (!product) {
      setScanError(`Produk "${code}" tidak ditemukan`);
      setScannedProduct(null);
      return;
    }
    addProduct(product);
    setBarcode("");
    setScannedProduct(null);
    barcodeRef.current?.focus();
  };

  const handleBarcodeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") return; // form onSubmit tangani
    if (e.key === "Tab" && scannedProduct) {
      e.preventDefault();
      handleAddScanned();
    }
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  };

  const removeLine = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  };

  // Hasil pencarian produk di modal.
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id === q ||
        (p.slug ?? "").toLowerCase() === q,
    );
  }, [products, searchQuery]);

  const handleMemberLookup = () => {
    setMemberError("");
    const found = koperasiMembers.find((m) => m.memberNo === memberNo.trim());
    if (!found) {
      setMemberInfo(null);
      if (memberNo.trim()) setMemberError(`Nomor anggota "${memberNo}" tidak ditemukan`);
    } else {
      setMemberInfo(found);
    }
  };

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.price * l.qty, 0), [cart]);
  const totalQty = cart.reduce((s, l) => s + l.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setBusy(true);
    try {
      const tx = await kasirCheckout(storeId, {
        items: cart.map((l) => ({ productId: l.productId, qty: l.qty })),
        paymentMethod: payment,
        memberNo: memberInfo?.memberNo,
        memberName: memberInfo?.name,
        kasirName: session?.name,
        kasirEmail: session?.email,
      });
      setReceipt(tx);
      setCart([]);
      setMemberNo("");
      setMemberInfo(null);
      setPayment("cash");
    } catch {
      setScanError("Gagal memproses pembayaran. Coba lagi.");
    }
    setBusy(false);
  };

  const newTransaction = () => {
    setReceipt(null);
    barcodeRef.current?.focus();
  };

  /* ---------- Gate akses ---------- */
  if (authed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-moss">Memuat kasir…</p>
      </div>
    );
  }
  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-lg font-bold">Anda tidak punya akses</p>
          <p className="mt-1 text-sm text-moss">
            Halaman kasir hanya untuk anggota toko dengan role "kasir" atau "owner".
          </p>
          <a
            href={`/toko/${storeId}/kelola`}
            className="mt-5 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            ← Kembali ke kelola toko
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      {/* Sidebar kiri — daftar transaksi / info kasir */}
      <aside className="shrink-0 border-b border-ink/10 bg-brand-deep text-white lg:w-56 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white font-display text-lg font-bold text-brand">
            K
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold">{storeName}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-amber">Kasir</span>
          </span>
        </div>
        <div className="border-t border-white/10 px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Kasir Aktif</p>
          <p className="mt-1.5 truncate text-sm font-semibold">{session?.name}</p>
          <p className="truncate text-xs text-white/60">{session?.email}</p>
        </div>
        <div className="border-t border-white/10 px-4 py-4">
          <a
            href={`/toko/${storeId}/kelola`}
            className="flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m14 6-6 6 6 6" />
            </svg>
            Kelola toko
          </a>
        </div>
      </aside>

      {/* Konten utama */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Bar atas — scan + preview + tombol tambah & cari */}
        <div className="border-b border-ink/10 bg-white px-4 py-3 lg:px-6">
          <form onSubmit={handleScan} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex flex-1 gap-2">
              <input
                ref={barcodeRef}
                type="text"
                value={barcode}
                onChange={(e) => handleBarcodeChange(e.target.value)}
                onKeyDown={handleBarcodeKey}
                placeholder="Scan/ketik barcode/nama produk…"
                className="flex-1 rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              {scannedProduct && (
                <button
                  type="button"
                  onClick={handleAddScanned}
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark active:scale-95"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="hidden sm:inline">Tambah</span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Cari Produk
            </button>
          </form>

          {/* Preview hasil scan */}
          {scannedProduct && (
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/5 p-2.5">
              <img src={scannedProduct.image} alt={scannedProduct.name} className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{scannedProduct.name}</p>
                <p className="text-xs text-moss">
                  {formatIDR(scannedProduct.price)} · stok {scannedProduct.stock}
                </p>
              </div>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                Ditemukan
              </span>
            </div>
          )}
          {scanError && <p className="mt-1.5 text-xs text-red-600">{scanError}</p>}
        </div>

        {/* Grid layar POS */}
        <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_360px] lg:p-6">
          {/* Kiri — daftar barang */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white">
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
              <h2 className="text-sm font-bold">
                Daftar Belanja
                {cart.length > 0 && (
                  <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    {totalQty} item
                  </span>
                )}
              </h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs font-semibold text-rose hover:underline"
                >
                  Kosongkan
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-ink/10 bg-white text-[11px] font-bold uppercase tracking-wider text-moss">
                  <tr>
                    <th className="px-4 py-2">Produk</th>
                    <th className="px-4 py-2 text-right">Harga</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((l) => (
                    <tr key={l.productId} className="border-b border-ink/5 last:border-0 hover:bg-cream/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={l.image} alt={l.name} className="h-10 w-10 rounded-lg object-cover" />
                          <span className="truncate text-xs font-medium">{l.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-moss whitespace-nowrap">{formatIDR(l.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => changeQty(l.productId, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-sm font-bold hover:border-brand hover:text-brand"
                            aria-label="Kurangi"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => changeQty(l.productId, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-sm font-bold hover:border-brand hover:text-brand"
                            aria-label="Tambah"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">{formatIDR(l.price * l.qty)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeLine(l.productId)}
                          className="text-xs text-rose transition-colors hover:underline"
                          aria-label="Hapus barang"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-moss">
                          <svg className="h-12 w-12 text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />
                          </svg>
                          <p className="text-sm">Keranjang kosong</p>
                          <p className="text-xs">Scan barcode atau klik "Cari Produk" untuk menambah barang</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kanan — checkout panel */}
          <div className="flex flex-col gap-4 lg:h-full lg:overflow-y-auto">
            {/* Anggota koperasi */}
            <section className="rounded-xl border border-ink/10 bg-white p-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-moss">Anggota Koperasi</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={memberNo}
                  onChange={(e) => setMemberNo(e.target.value)}
                  onBlur={handleMemberLookup}
                  placeholder="ANG-2026-0001"
                  className="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={handleMemberLookup}
                  className="rounded-md border border-ink/15 px-3 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                >
                  Cek
                </button>
              </div>
              {memberError && <p className="mt-1.5 text-xs text-red-600">{memberError}</p>}
              {memberInfo && (
                <div className="mt-2 rounded-md bg-brand/5 px-3 py-2 text-sm">
                  <p className="font-semibold text-ink">{memberInfo.name}</p>
                  <p className="text-xs text-moss">{memberInfo.email}</p>
                  <p className="mt-0.5 text-[11px] text-brand">{memberInfo.memberNo}</p>
                </div>
              )}
            </section>

            {/* Pembayaran */}
            <section className="rounded-xl border border-ink/10 bg-white p-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-moss">Metode Pembayaran</h3>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPayment(p.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-semibold transition-colors",
                      payment === p.id
                        ? "border-brand bg-brand text-white"
                        : "border-ink/10 text-ink/80 hover:border-brand hover:text-brand",
                    )}
                    aria-pressed={payment === p.id}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={p.icon} />
                    </svg>
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-moss">Tanpa biaya admin (QRIS statis, transfer manual).</p>
            </section>

            {/* Total */}
            <section className="rounded-xl border-2 border-brand/20 bg-white p-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-moss">Subtotal ({totalQty} item)</dt>
                  <dd className="font-semibold">{formatIDR(subtotal)}</dd>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-2">
                  <dt className="font-display text-base font-bold">Total</dt>
                  <dd className="font-display text-2xl font-bold text-brand">{formatIDR(subtotal)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={busy || cart.length === 0}
                className={cn(
                  "mt-4 w-full rounded-full px-5 py-3.5 text-sm font-bold text-white transition-all",
                  cart.length > 0 && !busy
                    ? "bg-brand shadow-lg shadow-brand/30 hover:bg-brand-dark"
                    : "cursor-not-allowed bg-ink/20",
                )}
              >
                {busy ? "Memproses…" : cart.length === 0 ? "Keranjang kosong" : `Bayar ${formatIDR(subtotal)}`}
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* ---------- Modal pencarian produk ---------- */}
      <Modal
        open={showSearch}
        title="Cari Produk"
        onClose={() => setShowSearch(false)}
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-moss"
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
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama atau kode barcode…"
              className="w-full rounded-lg border border-ink/15 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <p className="text-xs text-moss">
            {searchResults.length} produk {searchQuery.trim() && `cocok dengan "${searchQuery.trim()}"`}
          </p>
          <ul className="grid max-h-[50vh] gap-2 overflow-y-auto sm:grid-cols-2">
            {searchResults.map((p) => {
              const inCart = cart.find((l) => l.productId === p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      addProduct(p);
                      setShowSearch(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-ink/10 p-3 text-left transition-colors hover:border-brand hover:bg-brand/5"
                  >
                    <img src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-moss">
                        {formatIDR(p.price)} · stok {p.stock} · kode: <span className="font-mono">{p.id}</span>
                      </p>
                      {inCart && (
                        <span className="mt-0.5 inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                          Di keranjang: {inCart.qty}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-brand">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </li>
              );
            })}
            {searchResults.length === 0 && (
              <li className="col-span-full py-12 text-center text-sm text-moss">
                Tidak ada produk cocok dengan "{searchQuery}".
              </li>
            )}
          </ul>
        </div>
      </Modal>

      {/* ---------- Modal struk ---------- */}
      <Modal
        open={!!receipt}
        title={`Struk ${receipt?.id ?? ""}`}
        onClose={newTransaction}
        size="md"
      >
        {receipt && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-center">
              <p className="font-display text-sm font-bold">{receipt.storeName}</p>
              <p className="text-[10px] text-moss">Pasar Koperasi</p>
            </div>
            <div className="border-t border-dashed border-ink/30 pt-2">
              <p>{new Date(receipt.datetime).toLocaleString("id-ID")}</p>
              <p>Kasir: {receipt.kasirName}</p>
              {receipt.memberName && <p>Anggota: {receipt.memberName} ({receipt.memberNo})</p>}
              <p>Pembayaran: {receipt.paymentMethod.toUpperCase()}</p>
            </div>
            <div className="border-t border-dashed border-ink/30 pt-2">
              {receipt.items.map((it) => (
                <div key={it.productId} className="flex justify-between gap-2">
                  <span className="truncate">{it.name} × {it.qty}</span>
                  <span className="shrink-0">{formatIDR(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-ink/30 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatIDR(receipt.total)}</span>
              </div>
            </div>
            <p className="pt-2 text-center text-[10px] text-moss">Terima kasih · Simpan struk ini</p>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            Cetak
          </button>
          <button
            type="button"
            onClick={newTransaction}
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Transaksi Baru
          </button>
        </div>
      </Modal>
    </div>
  );
}