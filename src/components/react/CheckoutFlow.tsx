import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { cartTotal, clearCart, findBucketBySellerId } from "../../lib/cart";
import { computeCheckoutCost, PAYMENT_ADMIN_RATES, type CheckoutCost } from "../../lib/checkout-math";
import { addLocalOrder } from "../../lib/my-orders";
import { createOrder, payOrder } from "../../services/order-service";
import { getSession } from "../../lib/session";
import { formatIDR } from "./ProductCard";
import type { CartItem, DeliveryLocation, DropPoint, Order } from "../../types";

type Step = "pengiriman" | "pembayaran" | "qris" | "sukses";

const WIZARD_STEPS: { id: Step; label: string }[] = [
  { id: "pengiriman", label: "Pengiriman" },
  { id: "pembayaran", label: "Pembayaran" },
  { id: "qris", label: "Bayar QRIS" },
];

const PAYMENTS = [
  { id: "qris", label: "QRIS", hint: "Semua e-wallet & m-banking", available: true, adminRate: PAYMENT_ADMIN_RATES.qris },
  { id: "transfer", label: "Transfer Bank", hint: "Segera hadir", available: false, adminRate: PAYMENT_ADMIN_RATES.transfer },
  { id: "cod", label: "Bayar di Drop Point", hint: "Segera hadir", available: false, adminRate: PAYMENT_ADMIN_RATES.cod },
];

const QR_TIMEOUT = 15 * 60; // detik — masa berlaku kode QRIS demo

interface Props {
  dropPoints: DropPoint[];
}

export default function CheckoutFlow({ dropPoints }: Props) {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [seller, setSeller] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("pengiriman");
  const [dropPointId, setDropPointId] = useState("");
  const [payment, setPayment] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [note, setNote] = useState("");
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QR_TIMEOUT);

  // `?toko=<sellerId>` dibaca client-side — halaman /checkout prerender statis,
  // jadi Astro.url di build-time tidak punya query. Resolve slug → nama toko.
  // Wajib login sebelum checkout.
  useEffect(() => {
    const authed = !!getSession();
    setAuthed(authed);
    if (!authed) return;
    const id = new URLSearchParams(window.location.search).get("toko") ?? "";
    const bucket = findBucketBySellerId(id);
    if (bucket) {
      setSeller(bucket.seller);
      setItems(bucket.items);
    } else {
      setItems([]);
    }
  }, []);

  // Hitung mundur masa berlaku kode QRIS.
  useEffect(() => {
    if (step !== "qris") return;
    const timer = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [step]);

  const subtotal = useMemo(() => cartTotal(items ?? []), [items]);
  const adminRate = payment ? (PAYMENT_ADMIN_RATES[payment] ?? 0) : 0;
  const cost: CheckoutCost = useMemo(() => {
    const ongkir = dropPoints.find((dp) => dp.id === dropPointId)?.shippingCost ?? 0;
    return computeCheckoutCost(subtotal, ongkir, adminRate);
  }, [subtotal, dropPointId, dropPoints, adminRate]);
  const paymentLabel = PAYMENTS.find((p) => p.id === payment)?.label ?? "";
  const dropPoint = dropPoints.find((dp) => dp.id === dropPointId);
  const locationComplete = building.trim() !== "" && floor.trim() !== "" && room.trim() !== "";
  const shippingComplete = !!dropPointId && locationComplete;

  if (authed === null) return null;

  if (!authed) {
    const next = window.location.pathname + window.location.search;
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-bold">Wajib login untuk checkout</p>
        <p className="mt-1 text-sm text-moss">
          Masuk terlebih dahulu untuk menyelesaikan pesanan Anda.
        </p>
        <a
          href={`/login?next=${encodeURIComponent(next)}`}
          className="mt-5 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Masuk
        </a>
      </div>
    );
  }

  if (items === null) return null;

  if (items.length === 0 && step !== "sukses") {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-bold">Tidak ada yang bisa di-checkout</p>
        <p className="mt-1 text-sm text-moss">
          {seller
            ? `Keranjang toko "${seller}" kosong. Pilih toko lain dari halaman keranjang.`
            : "Keranjang Anda kosong."}
        </p>
        <a
          href="/cart"
          className="mt-5 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Lihat Keranjang
        </a>
      </div>
    );
  }

  const goToPayment = () => {
    setTouched(true);
    if (!shippingComplete) return;
    setStep("pembayaran");
  };

  const delivery: DeliveryLocation = {
    building: building.trim(),
    floor: floor.trim(),
    room: room.trim(),
    note: note.trim() || undefined,
  };

  /** Cadangan bila API tak terjangkau — pesanan dibangun dari data keranjang. */
  const buildLocalOrder = (): Order => {
    return {
      id: `PK-2026-${String(Date.now()).slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      storeName: seller || items[0]?.seller || "Toko",
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image,
      })),
      subtotal: cost.subtotal,
      ongkir: cost.ongkir,
      adminFee: cost.adminFee,
      total: cost.grandTotal,
      dropPointId,
      delivery,
      payment: "QRIS",
      status: "MENUNGGU_PEMBAYARAN",
    };
  };

  // Selesaikan checkout → POST /api/orders (lewat order-service), lalu tampilkan QRIS.
  const finishCheckout = async () => {
    setBusy(true);
    let order: Order;
    try {
      order = await createOrder({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        dropPointId,
        delivery,
        payment,
      });
    } catch {
      order = buildLocalOrder();
    }
    setPendingOrder(order);
    setSecondsLeft(QR_TIMEOUT);
    setBusy(false);
    setStep("qris");
  };

  // Konfirmasi bayar → POST /api/orders/:id/pay (MENUNGGU_PEMBAYARAN → DISIAPKAN).
  const handlePaid = async () => {
    if (!pendingOrder) return;
    setBusy(true);
    let paid: Order;
    try {
      paid = await payOrder(pendingOrder.id);
    } catch {
      paid = { ...pendingOrder, status: "DISIAPKAN" };
    }
    addLocalOrder(paid);
    clearCart(seller);
    setItems([]);
    setBusy(false);
    setStep("sukses");
  };

  /* ---------- Layar sukses ---------- */

  if (step === "sukses") {
    return (
      <div className="rounded-xl border border-ink/10 bg-white p-8 text-center shadow-sm shadow-ink/5">
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white"
          aria-hidden="true"
        >
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4 12.5 5 5L20 7" />
          </svg>
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold">Pembayaran Diterima</h2>
        <p className="mt-2 text-sm text-moss">
          Pesanan <strong className="text-ink">{pendingOrder?.id}</strong> sedang disiapkan toko
          dan akan dikirim ke <strong className="text-ink">{dropPoint?.name}</strong> ({building},
          Lt. {floor}, {room}).
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={`/orders/lacak?id=${pendingOrder?.id ?? ""}`}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Lihat Proses Pesanan
          </a>
          <a
            href="/products"
            className="rounded-full border border-ink/10 bg-white px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Belanja Lagi
          </a>
        </div>
      </div>
    );
  }

  /* ---------- Layar QRIS ---------- */

  if (step === "qris") {
    const expired = secondsLeft === 0;
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return (
      <div>
        <StoreBanner seller={seller} />
        <StepIndicator current="qris" />
        <div className="mx-auto mt-6 max-w-sm overflow-hidden rounded-2xl border border-ink/10 bg-white text-center shadow-sm shadow-ink/5">
          <div className="bg-brand-deep px-6 py-4 text-white">
            <p className="font-display text-lg font-bold tracking-wide">QRIS</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
              Quick Response Code Indonesian Standard
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm font-bold">Pasar Koperasi — Sejahtera Bersama</p>
            <p className="text-xs text-moss">NMID: ID102026PK0001 · {pendingOrder?.id}</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight">
              {formatIDR(cost.grandTotal)}
            </p>
            <p
              className={cn(
                "mx-auto mt-2 w-fit rounded-full px-3 py-1 text-xs font-bold",
                expired ? "bg-rose/15 text-rose" : "bg-amber/15 text-amber-deep",
              )}
              aria-live="polite"
            >
              {expired ? "Kode kedaluwarsa" : `Berlaku ${mm}:${ss}`}
            </p>
            <div className={cn("mx-auto mt-4 w-fit rounded-xl border border-ink/10 p-3", expired && "opacity-30")}>
              <QrMock />
            </div>
            <p className="mt-2 text-[11px] text-moss">
              Scan dengan aplikasi e-wallet / m-banking. QR contoh (demo) — pembayaran tidak
              sungguhan diproses.
            </p>
            {expired ? (
              <button
                type="button"
                onClick={() => setSecondsLeft(QR_TIMEOUT)}
                className="mt-4 w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Buat Ulang Kode QR
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaid}
                disabled={busy}
                className="mt-4 w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? "Memeriksa pembayaran…" : "Saya sudah membayar"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep("pembayaran")}
              className="mt-2 w-full rounded-full px-5 py-2 text-sm font-semibold text-moss transition-colors hover:text-brand"
            >
              ← Ganti metode pembayaran
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Langkah 2: pilih metode pembayaran ---------- */

  if (step === "pembayaran") {
    return (
      <div>
        <StoreBanner seller={seller} />
        <StepIndicator current="pembayaran" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_290px]">
          <section className="h-fit rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="font-display text-lg font-bold">Pilih Metode Pembayaran</h2>
            <p className="mt-1 text-xs text-moss">
              Pesanan dikirim ke {dropPoint?.name} — {building}, Lt. {floor}, {room}.
            </p>
            <ul className="mt-3 space-y-2">
              {PAYMENTS.map((p) => (
                <li key={p.id}>
                  <label
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3.5 transition-colors",
                      !p.available && "cursor-not-allowed opacity-50",
                      p.available && "cursor-pointer",
                      payment === p.id ? "border-brand bg-brand/5" : "border-ink/10",
                      p.available && payment !== p.id && "hover:border-brand/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === p.id}
                      disabled={!p.available}
                      onChange={() => setPayment(p.id)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{p.label}</span>
                      <span className="block text-xs text-moss">{p.hint}</span>
                    </span>
                    {p.id === "qris" && (
                      <span className="rounded-md bg-brand-deep px-2 py-1 font-display text-xs font-bold text-white">
                        QRIS
                      </span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setStep("pengiriman")}
              className="mt-4 text-sm font-semibold text-moss transition-colors hover:text-brand"
            >
              ← Kembali ke pengiriman
            </button>
          </section>

        <SummaryAside items={items} cost={cost} dropPoint={dropPoint} showAdmin={!!payment} paymentLabel={paymentLabel}>
            <button
              type="button"
              onClick={finishCheckout}
              disabled={busy || !payment}
              className={cn(
                "mt-4 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors",
                payment && !busy
                  ? "bg-brand hover:bg-brand-dark"
                  : "cursor-not-allowed bg-ink/20",
              )}
            >
              {busy ? "Membuat pesanan…" : "Selesaikan Checkout"}
            </button>
            {!payment ? (
              <p className="mt-2 text-center text-xs text-moss">
                Pilih metode pembayaran dulu
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-moss">
                Kode QRIS muncul setelah checkout diselesaikan
              </p>
            )}
          </SummaryAside>
        </div>
      </div>
    );
  }

  /* ---------- Langkah 1: drop point + lokasi pengiriman ---------- */

  return (
    <div>
      <StoreBanner seller={seller} />
      <StepIndicator current="pengiriman" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_290px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="font-display text-lg font-bold">Pilih Drop Point</h2>
            <p className="mt-1 text-xs text-moss">
              Paket akan diantar kurir ke drop point pilihan Anda — ambil atau terima di sana.
            </p>
            <ul className="mt-3 space-y-2">
              {dropPoints.map((dp) => (
                <li key={dp.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      dropPointId === dp.id
                        ? "border-brand bg-brand/5"
                        : "border-ink/10 hover:border-brand/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="dropPoint"
                      checked={dropPointId === dp.id}
                      onChange={() => setDropPointId(dp.id)}
                      className="mt-0.5 h-4 w-4 accent-brand"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{dp.name}</span>
                      <span className="block text-xs text-moss">{dp.address}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {touched && !dropPointId && (
              <p className="mt-2 text-xs text-red-600">Pilih drop point tujuan dulu</p>
            )}
          </section>

          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <h2 className="font-display text-lg font-bold">Lokasi Pengiriman</h2>
            <p className="mt-1 text-xs text-moss">
              Detail tempat penerimaan paket di lokasi drop point — gedung, lantai, dan ruangan.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label htmlFor="building" className="mb-1 block text-sm font-medium text-ink/80">
                  Gedung
                </label>
                <input
                  id="building"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="mis. Gedung A / Kantor Koperasi"
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label htmlFor="floor" className="mb-1 block text-sm font-medium text-ink/80">
                  Lantai
                </label>
                <input
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="mis. 3"
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="room" className="mb-1 block text-sm font-medium text-ink/80">
                  Ruangan
                </label>
                <input
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="mis. Ruang Sekretariat / R.301"
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="note" className="mb-1 block text-sm font-medium text-ink/80">
                  Penjelasan <span className="font-normal text-moss">(opsional)</span>
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="mis. Titip ke resepsionis bila penerima tidak di tempat"
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
            {touched && !locationComplete && (
              <p className="mt-2 text-xs text-red-600">Gedung, lantai, dan ruangan wajib diisi</p>
            )}
          </section>
        </div>

<SummaryAside items={items} cost={cost} dropPoint={dropPoint} showAdmin={false} paymentLabel="">
          <button
            type="button"
            onClick={goToPayment}
            className={cn(
              "mt-4 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors",
              shippingComplete ? "bg-brand hover:bg-brand-dark" : "cursor-not-allowed bg-ink/20",
            )}
          >
            Lanjut ke Pembayaran
          </button>
          {!shippingComplete && (
            <p className="mt-2 text-center text-xs text-moss">
              Lengkapi drop point & lokasi pengiriman
            </p>
          )}
          <a
            href="/cart"
            className="mt-2 block text-center text-xs font-semibold text-moss transition-colors hover:text-brand"
          >
            ← Ubah isi keranjang
          </a>
        </SummaryAside>
      </div>
    </div>
  );
}

/* ---------- Komponen bersama ---------- */

function StoreBanner({ seller }: { seller: string }) {
  if (!seller) return null;
  return (
    <p className="mb-1 text-center text-sm text-moss">
      Toko: <span className="font-semibold text-ink">{seller}</span>
    </p>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-3" aria-label="Langkah checkout">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && (
              <span
                className={cn("h-0.5 w-6 sm:w-10", done || active ? "bg-brand" : "bg-ink/15")}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-semibold",
                active && "bg-brand text-white",
                done && "text-brand",
                !active && !done && "text-moss",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                  active && "bg-white/20 text-white",
                  done && "bg-brand text-white",
                  !active && !done && "border border-ink/20 text-moss",
                )}
                aria-hidden="true"
              >
                {done ? "✓" : i + 1}
              </span>
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SummaryAside({
  items,
  cost,
  dropPoint,
  showAdmin,
  paymentLabel,
  children,
}: {
  items: CartItem[];
  cost: CheckoutCost;
  dropPoint?: DropPoint;
  showAdmin: boolean;
  paymentLabel: string;
  children: ReactNode;
}) {
  const total = showAdmin ? cost.grandTotal : cost.subtotal + cost.ongkir;
  const ratePct = cost.subtotal > 0 ? ((cost.adminFee / cost.subtotal) * 100).toFixed(1) : "0";
  return (
    <aside className="h-fit rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-bold">Ringkasan</h2>
      <ul className="mt-3 divide-y divide-ink/10">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3 py-2.5">
            <img
              src={item.image}
              alt={item.name}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{item.name}</p>
              <p className="text-[11px] text-moss">
                {item.qty} × {formatIDR(item.price)}
              </p>
            </div>
            <p className="text-xs font-semibold">{formatIDR(item.price * item.qty)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-1.5 border-t border-ink/10 pt-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-moss">Subtotal</dt>
          <dd className="font-semibold">{formatIDR(cost.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-moss">
            Ongkir{dropPoint ? ` · ${dropPoint.name}` : ""}
          </dt>
          <dd className="font-semibold">{formatIDR(cost.ongkir)}</dd>
        </div>
        {showAdmin && (
          <div className="flex justify-between">
            <dt className="text-moss">
              Biaya admin {paymentLabel} ({ratePct}%)
            </dt>
            <dd className="font-semibold">{formatIDR(cost.adminFee)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-ink/10 pt-2">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-lg font-bold">{formatIDR(total)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}

/** Kode QR tiruan untuk demo — pola deterministik, bukan QR asli. */
function QrMock() {
  const n = 21;
  const cell = 6;
  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const modules: { r: number; c: number }[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!inFinder(r, c) && (r * 3 + c * 7 + r * c) % 5 < 2) modules.push({ r, c });
    }
  }
  const finder = (x: number, y: number) => (
    <g>
      <rect x={x} y={y} width={7 * cell} height={7 * cell} fill="#1b2b38" />
      <rect x={x + cell} y={y + cell} width={5 * cell} height={5 * cell} fill="#ffffff" />
      <rect x={x + 2 * cell} y={y + 2 * cell} width={3 * cell} height={3 * cell} fill="#1b2b38" />
    </g>
  );
  return (
    <svg
      width={n * cell}
      height={n * cell}
      viewBox={`0 0 ${n * cell} ${n * cell}`}
      role="img"
      aria-label="Kode QR contoh untuk pembayaran QRIS (demo)"
    >
      <rect width={n * cell} height={n * cell} fill="#ffffff" />
      {modules.map(({ r, c }) => (
        <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1b2b38" />
      ))}
      {finder(0, 0)}
      {finder((n - 7) * cell, 0)}
      {finder(0, (n - 7) * cell)}
    </svg>
  );
}
