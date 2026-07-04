import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { getSession } from "../../lib/session";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "../../lib/order-status";
import { formatIDR } from "./ProductCard";
import type { DropPoint, Office, Order, Product, Store, StoreMember } from "../../types";

interface Props {
  store: Store;
  products: Product[];
  members: StoreMember[];
  dropPoints: DropPoint[];
  offices: Office[];
  orders: Order[];
}

const TONE = {
  brand: "bg-brand/10 text-brand",
  amber: "bg-amber/15 text-amber-deep",
  rose: "bg-rose/15 text-rose",
  deep: "bg-brand-deep text-white",
};

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={cn("h-4.5 w-4.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons = {
  money: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  box: <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3 3.4-5 6.5-5s5.7 2 6.5 5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M16 15c2.5 0 4.7 1.8 5.5 4" /></>,
  pin: <><path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
  store: <><path d="M3 9 4 4h16l1 5M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M9 21v-6h6v6" /></>,
  cart: <><path d="M2 3h2.5l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.9a1.5 1.5 0 0 0 1.4-1.1L21 8H6" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm shadow-ink/5">
      {children}
    </section>
  );
}

export default function StoreDashboardHome({
  store,
  products,
  members,
  dropPoints,
  offices,
  orders,
}: Props) {
  const [greeting, setGreeting] = useState("Selamat datang");
  const [firstName, setFirstName] = useState("Siti");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam",
    );
    const session = getSession();
    if (session) setFirstName(session.name.split(" ")[0]);
  }, []);

  const published = products.filter((p) => p.published);
  const drafts = products.length - published.length;
  const activeMembers = members.filter((m) => m.status === "aktif").length;
  const needAction = orders.filter(
    (o) => o.status === "DIBAYAR" || o.status === "DISIAPKAN",
  ).length;
  const lowStock = products.filter((p) => p.stock < 20);
  const omzet = orders
    .filter((o) => o.storeName === store.name && o.status !== "MENUNGGU_PEMBAYARAN")
    .reduce((s, o) => s + o.total, 0);
  const office = offices.find((o) => o.id === store.officeId);
  const base = `/toko/${store.id}/kelola`;

  const stats: { label: string; value: string; chip: string; up: boolean; tone: keyof typeof TONE; icon: ReactNode }[] = [
    { label: "Omzet Hari Ini", value: formatIDR(omzet), chip: "12,4% dari kemarin", up: true, tone: "brand", icon: icons.money },
    { label: "Produk Tayang", value: String(published.length), chip: `${drafts} draft menunggu`, up: true, tone: "amber", icon: icons.box },
    { label: "Pesanan Aktif", value: String(needAction), chip: "perlu disiapkan", up: false, tone: "rose", icon: icons.cart },
    { label: "Anggota Aktif", value: String(activeMembers), chip: `${members.length - activeMembers} undangan terkirim`, up: true, tone: "deep", icon: icons.users },
  ];

  const modules: { title: string; hint: string; icon: ReactNode; href: string }[] = [
    { title: "Produk", hint: `${published.length} tayang · ${drafts} draft`, icon: icons.box, href: `${base}/produk` },
    { title: "Anggota", hint: `${activeMembers} anggota aktif`, icon: icons.users, href: `${base}/anggota` },
    { title: "Drop Point", hint: `${store.dropPointIds.length} titik dilayani`, icon: icons.pin, href: `${base}/droppoint` },
    { title: "Detail Toko", hint: office ? office.name : "Lengkapi profil toko", icon: icons.store, href: base },
  ];

  const stockBars = [...products].sort((a, b) => a.stock - b.stock).slice(0, 3);
  const barTone = ["bg-rose", "bg-amber", "bg-brand"];

  const activities = [
    { icon: icons.users, text: <><strong>Rina Marlina</strong> diundang sebagai staff</>, time: "5 menit lalu" },
    { icon: icons.box, text: <><strong>Rendang Kemasan Vakum</strong> disimpan sebagai draft</>, time: "27 menit lalu" },
    { icon: icons.clock, text: <>Pesanan <strong>PK-2026-0412</strong> menunggu disiapkan</>, time: "1 jam lalu" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-deep">Dashboard Toko</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{greeting}, {firstName} 👋</h1>
        </div>
      </header>

      {/* Kartu statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm shadow-ink/5">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", TONE[s.tone])}>
              <Icon>{s.icon}</Icon>
            </span>
            <p className="mt-3 text-xs font-medium text-moss">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight">{s.value}</p>
            <span className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", s.up ? "bg-brand/10 text-brand" : "bg-rose/15 text-rose")}>
              {s.up ? "↑" : "↓"} {s.chip}
            </span>
          </div>
        ))}
      </div>

      {/* Panel gelap: navigasi modul toko */}
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-deep p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="lg:max-w-xs">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber">Semua Terhubung</p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-snug">Satu dashboard, semua urusan toko</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Produk, anggota, drop point, dan detail toko dikelola dari satu tempat dan langsung tersinkron ke katalog Pasar Koperasi.
            </p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((m) => (
              <a
                key={m.title}
                href={m.href}
                className="rounded-xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Icon>{m.icon}</Icon>
                </span>
                <p className="mt-2.5 text-sm font-bold">{m.title}</p>
                <p className="mt-0.5 text-xs text-white/60">{m.hint}</p>
              </a>
            ))}
            <a href={`${base}/produk`} className="flex flex-col justify-center rounded-xl border border-dashed border-white/30 p-4 text-left transition-colors hover:bg-white/10">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Icon>{icons.plus}</Icon>
              </span>
              <p className="mt-2.5 text-sm font-bold">Tambah Produk</p>
              <p className="mt-0.5 text-xs text-white/60">Foto, harga, stok, kategori</p>
            </a>
          </div>
        </div>
      </div>

      {/* Tabel pesanan + kolom kanan */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">Pesanan Terbaru</h2>
            <a href="/orders" className="text-sm font-semibold text-brand hover:underline">Lihat semua →</a>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] font-bold uppercase tracking-wider text-moss">
                  <th className="py-2 pr-4 font-bold">Pesanan</th>
                  <th className="py-2 pr-4 font-bold">Tujuan</th>
                  <th className="py-2 pr-4 font-bold">Nominal</th>
                  <th className="py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => {
                  const dp = dropPoints.find((d) => d.id === o.dropPointId);
                  return (
                    <tr key={o.id} className="border-b border-ink/5 last:border-0">
                      <td className="py-2.5 pr-4 font-semibold">{o.id}</td>
                      <td className="py-2.5 pr-4 text-moss">
                        <span className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", o.status === "SELESAI" ? "bg-brand" : o.status === "MENUNGGU_PEMBAYARAN" ? "bg-rose" : "bg-amber")} aria-hidden="true" />
                          {dp?.name.replace("Drop Point ", "") ?? "—"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-display font-bold">{formatIDR(o.total)}</td>
                      <td className="py-2.5">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", ORDER_STATUS_BADGE[o.status])}>
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="font-display text-lg font-bold">Stok Menipis</h2>
            <ul className="mt-3 space-y-3.5">
              {stockBars.map((p, i) => (
                <li key={p.id}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <p className="min-w-0 truncate font-medium">{p.name}</p>
                    <p className="shrink-0 text-xs text-moss">{p.stock} / 100</p>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-ink/10">
                    <div className={cn("h-full rounded-full", barTone[i % barTone.length])} style={{ width: `${Math.min(p.stock, 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            {lowStock.length > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose">
                <Icon className="h-3.5 w-3.5">{icons.alert}</Icon>
                {lowStock.length} produk perlu segera di-restock
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-lg font-bold">Aktivitas Terbaru</h2>
            <ul className="mt-2 divide-y divide-ink/5">
              {activities.map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-4 w-4">{a.icon}</Icon>
                  </span>
                  <div className="text-sm">
                    <p className="leading-snug text-ink/90">{a.text}</p>
                    <p className="mt-0.5 text-xs text-moss">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}