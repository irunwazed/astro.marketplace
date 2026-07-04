import { useEffect, useState, type ReactNode, type SyntheticEvent } from "react";
import { cn } from "../../lib/utils";
import { getSession, initialsOf, nameFromEmail } from "../../lib/session";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "../../lib/order-status";
import { formatIDR } from "./ProductCard";
import FormField from "./FormField";
import type { DropPoint, Office, Order, Product, Store, StoreMember } from "../../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Section = "dashboard" | "produk" | "anggota" | "droppoint" | "detail";

interface Props {
  store: Store;
  members: StoreMember[];
  products: Product[];
  offices: Office[];
  dropPoints: DropPoint[];
  orders: Order[];
}

/* ---------- Ikon ---------- */

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
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3 3.4-5 6.5-5s5.7 2 6.5 5" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M16 15.5c2.5.3 4.6 1.9 5.5 4.5" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  store: (
    <>
      <path d="M4 11v9h16v-9" />
      <path d="M2 7.5 4 3h16l2 4.5c0 1.4-1.2 2.5-2.7 2.5-1.4 0-2.6-1.1-2.6-2.5 0 1.4-1.2 2.5-2.7 2.5S11.3 8.9 11.3 7.5c0 1.4-1.2 2.5-2.6 2.5S6 8.9 6 7.5C6 8.9 4.8 10 3.3 10 2.5 10 2 8.9 2 7.5Z" />
    </>
  ),
  money: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h2.5l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.9a1.5 1.5 0 0 0 1.4-1.1L21 8H6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17.5h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  back: <path d="m14 6-6 6 6 6" />,
};

/* ---------- Kerangka dashboard ---------- */

const NAV: { id: Section; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard Toko", icon: icons.dashboard },
  { id: "produk", label: "Produk", icon: icons.box },
  { id: "anggota", label: "Anggota", icon: icons.users },
  { id: "droppoint", label: "Drop Point", icon: icons.pin },
  { id: "detail", label: "Detail Toko", icon: icons.store },
];

export default function StoreDashboard({
  store,
  members,
  products,
  offices,
  dropPoints,
  orders,
}: Props) {
  const [section, setSection] = useState<Section>("dashboard");
  const [greeting, setGreeting] = useState("Selamat datang");
  const [firstName, setFirstName] = useState("Siti");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam",
    );
    const session = getSession();
    if (session) setFirstName(session.name.split(" ")[0]);
  }, []);

  const draftCount = products.filter((p) => !p.published).length;
  const invitedCount = members.filter((m) => m.status === "diundang").length;
  const badges: Partial<Record<Section, number>> = { produk: draftCount, anggota: invitedCount };

  const handleSearch = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSection("produk");
  };

  const navButton = (item: (typeof NAV)[number], compact = false) => (
    <button
      key={item.id}
      type="button"
      onClick={() => setSection(item.id)}
      aria-current={section === item.id ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        compact ? "shrink-0 px-3 py-2" : "w-full px-3.5 py-2.5",
        section === item.id ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon>{item.icon}</Icon>
      {item.label}
      {!!badges[item.id] && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1.5 text-[10px] font-bold text-white">
          {badges[item.id]}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-deep px-4 py-6 text-white lg:flex">
        <a href="/" className="flex items-center gap-2.5 px-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-display text-xl font-bold text-brand"
            aria-hidden="true"
          >
            K
          </span>
          <span>
            <span className="block font-display text-base font-bold leading-tight">
              {store.name}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-amber">
              Pasar Koperasi
            </span>
          </span>
        </a>

        <nav className="mt-8 space-y-1" aria-label="Menu kelola toko">
          {NAV.slice(0, 1).map((i) => navButton(i))}
          <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            Kelola Toko
          </p>
          {NAV.slice(1).map((i) => navButton(i))}
          <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            Lainnya
          </p>
          <a
            href="/toko"
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon>{icons.back}</Icon>
            Toko Saya
          </a>
          <a
            href="/"
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon>{icons.cart}</Icon>
            Kembali Belanja
          </a>
        </nav>
      </aside>

      {/* Bar atas (mobile) */}
      <div className="bg-brand-deep px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-display text-lg font-bold text-brand"
            aria-hidden="true"
          >
            K
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold leading-tight">
              {store.name}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-amber">
              Pasar Koperasi
            </span>
          </span>
          <a href="/toko" className="ml-auto text-xs font-semibold text-white/70 hover:text-white">
            ← Toko Saya
          </a>
        </div>
        <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1" aria-label="Menu kelola toko">
          {NAV.map((i) => navButton(i, true))}
        </nav>
      </div>

      {/* Konten utama */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-deep">
              Dashboard Toko
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              {greeting}, {firstName} 👋
            </h1>
          </div>
          <form onSubmit={handleSearch} className="relative" role="search">
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-moss">
              {icons.search}
            </Icon>
            <label htmlFor="dash-search" className="sr-only">
              Cari produk toko
            </label>
            <input
              id="dash-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk toko..."
              className="w-48 rounded-full border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-moss focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-64"
            />
          </form>
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <Icon>{icons.bell}</Icon>
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="mt-6">
          {section === "dashboard" && (
            <DashboardSection
              store={store}
              products={products}
              members={members}
              dropPoints={dropPoints}
              offices={offices}
              orders={orders}
              onNavigate={setSection}
            />
          )}
          {section === "produk" && (
            <SectionShell
              title="Produk"
              hint="Kelola stok dan status tayang produk toko."
            >
              <ProductsPanel initialProducts={products} filter={query} />
            </SectionShell>
          )}
          {section === "anggota" && (
            <SectionShell title="Anggota" hint="Undang user lain menjadi owner atau staff toko.">
              <MembersPanel initialMembers={members} />
            </SectionShell>
          )}
          {section === "droppoint" && (
            <SectionShell
              title="Drop Point"
              hint="Pilih titik ambil/terima paket yang dilayani toko."
            >
              <DropPointPanel store={store} dropPoints={dropPoints} />
            </SectionShell>
          )}
          {section === "detail" && (
            <SectionShell
              title="Detail Toko"
              hint="Nama, logo, deskripsi, lokasi map, dan office toko."
            >
              <DetailPanel store={store} offices={offices} />
            </SectionShell>
          )}
        </div>
      </main>
    </div>
  );
}

function SectionShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-moss">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm shadow-ink/5">
      {children}
    </section>
  );
}

/* ---------- Seksi Dashboard (ringkasan) ---------- */

const TONE = {
  brand: "bg-brand/10 text-brand",
  amber: "bg-amber/15 text-amber-deep",
  rose: "bg-rose/15 text-rose",
  deep: "bg-brand-deep text-white",
};

function DashboardSection({
  store,
  products,
  members,
  dropPoints,
  offices,
  orders,
  onNavigate,
}: {
  store: Store;
  products: Product[];
  members: StoreMember[];
  dropPoints: DropPoint[];
  offices: Office[];
  orders: Order[];
  onNavigate: (s: Section) => void;
}) {
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

  const stats: {
    label: string;
    value: string;
    chip: string;
    up: boolean;
    tone: keyof typeof TONE;
    icon: ReactNode;
  }[] = [
    {
      label: "Omzet Hari Ini",
      value: formatIDR(omzet),
      chip: "12,4% dari kemarin",
      up: true,
      tone: "brand",
      icon: icons.money,
    },
    {
      label: "Produk Tayang",
      value: String(published.length),
      chip: `${drafts} draft menunggu`,
      up: true,
      tone: "amber",
      icon: icons.box,
    },
    {
      label: "Pesanan Aktif",
      value: String(needAction),
      chip: "perlu disiapkan",
      up: false,
      tone: "rose",
      icon: icons.cart,
    },
    {
      label: "Anggota Aktif",
      value: String(activeMembers),
      chip: "1 undangan terkirim",
      up: true,
      tone: "deep",
      icon: icons.users,
    },
  ];

  const modules: { title: string; hint: string; icon: ReactNode; section: Section }[] = [
    { title: "Produk", hint: `${published.length} tayang · ${drafts} draft`, icon: icons.box, section: "produk" },
    { title: "Anggota", hint: `${activeMembers} anggota aktif`, icon: icons.users, section: "anggota" },
    { title: "Drop Point", hint: `${store.dropPointIds.length} titik dilayani`, icon: icons.pin, section: "droppoint" },
    { title: "Detail Toko", hint: office ? office.name : "Lengkapi profil toko", icon: icons.store, section: "detail" },
  ];

  const stockBars = [...products].sort((a, b) => a.stock - b.stock).slice(0, 3);
  const barTone = ["bg-rose", "bg-amber", "bg-brand"];

  const activities = [
    {
      icon: icons.users,
      text: (
        <>
          <strong>Rina Marlina</strong> diundang sebagai staff
        </>
      ),
      time: "5 menit lalu",
    },
    {
      icon: icons.box,
      text: (
        <>
          Produk <strong>Rendang Kemasan Vakum</strong> disimpan sebagai draft
        </>
      ),
      time: "27 menit lalu",
    },
    {
      icon: icons.clock,
      text: (
        <>
          Pesanan <strong>PK-2026-0412</strong> menunggu disiapkan
        </>
      ),
      time: "1 jam lalu",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Kartu statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm shadow-ink/5"
          >
            <span
              className={cn("flex h-10 w-10 items-center justify-center rounded-xl", TONE[s.tone])}
            >
              <Icon>{s.icon}</Icon>
            </span>
            <p className="mt-3 text-xs font-medium text-moss">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight">{s.value}</p>
            <span
              className={cn(
                "mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                s.up ? "bg-brand/10 text-brand" : "bg-rose/15 text-rose",
              )}
            >
              {s.up ? "↑" : "↓"} {s.chip}
            </span>
          </div>
        ))}
      </div>

      {/* Panel gelap: navigasi modul toko */}
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-deep p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="lg:max-w-xs">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber">
              Semua Terhubung
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-snug">
              Satu dashboard, semua urusan toko
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Produk, anggota, drop point, dan detail toko dikelola dari satu tempat dan langsung
              tersinkron ke katalog Pasar Koperasi.
            </p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((m) => (
              <button
                key={m.title}
                type="button"
                onClick={() => onNavigate(m.section)}
                className="rounded-xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Icon>{m.icon}</Icon>
                </span>
                <p className="mt-2.5 text-sm font-bold">{m.title}</p>
                <p className="mt-0.5 text-xs text-white/60">{m.hint}</p>
              </button>
            ))}
            <a
              href="/toko/kelola/produk-baru"
              className="flex flex-col justify-center rounded-xl border border-dashed border-white/30 p-4 text-left transition-colors hover:bg-white/10"
            >
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
            <a href="/orders" className="text-sm font-semibold text-brand hover:underline">
              Lihat semua →
            </a>
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
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              o.status === "SELESAI"
                                ? "bg-brand"
                                : o.status === "MENUNGGU_PEMBAYARAN"
                                  ? "bg-rose"
                                  : "bg-amber",
                            )}
                            aria-hidden="true"
                          />
                          {dp?.name.replace("Drop Point ", "") ?? "—"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-display font-bold">{formatIDR(o.total)}</td>
                      <td className="py-2.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                            ORDER_STATUS_BADGE[o.status],
                          )}
                        >
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
                    <div
                      className={cn("h-full rounded-full", barTone[i % barTone.length])}
                      style={{ width: `${Math.min(p.stock, 100)}%` }}
                    />
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

/* ---------- Seksi Detail Toko ---------- */

function DetailPanel({ store, offices }: { store: Store; offices: Office[] }) {
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);
  const [address, setAddress] = useState(store.address);
  const [officeId, setOfficeId] = useState(store.officeId ?? "");
  const [saved, setSaved] = useState(false);
  const office = offices.find((o) => o.id === officeId);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <Panel>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <img src={store.logo} alt={`Logo ${store.name}`} className="h-16 w-16 rounded-xl" />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">Logo toko</span>
            <input
              type="file"
              accept="image/*"
              className="text-sm text-moss file:mr-3 file:rounded-full file:border-0 file:bg-brand/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand"
            />
          </label>
        </div>
        <FormField label="Nama Toko" name="name" value={name} onChange={setName} />
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink/80">
            Deskripsi
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <FormField label="Alamat" name="address" value={address} onChange={setAddress} />

        <div>
          <span className="mb-1 block text-sm font-medium text-ink/80">Lokasi map toko</span>
          <div className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/20 bg-cream">
            <Icon className="h-6 w-6 text-rose">{icons.pin}</Icon>
            <p className="text-xs font-semibold">
              {store.location.lat}, {store.location.lng}
            </p>
            <p className="text-xs text-moss">Peta interaktif menyusul saat integrasi backend</p>
          </div>
        </div>

        <div>
          <label htmlFor="office" className="mb-1 block text-sm font-medium text-ink/80">
            Office (kantor mitra) <span className="font-normal text-moss">— pilih dari daftar</span>
          </label>
          <select
            id="office"
            value={officeId}
            onChange={(e) => {
              setOfficeId(e.target.value);
              setSaved(false);
            }}
            className="w-full cursor-pointer rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Tidak memakai office</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {office && <p className="mt-1 text-xs text-moss">{office.address}</p>}
        </div>

        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Simpan Detail
        </button>
        {saved && <p className="text-sm text-brand">Detail toko disimpan (demo).</p>}
      </form>
    </Panel>
  );
}

/* ---------- Seksi Anggota ---------- */

function MembersPanel({ initialMembers }: { initialMembers: StoreMember[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "owner">("staff");
  const [error, setError] = useState("");

  const handleInvite = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setError("Format email tidak valid");
      return;
    }
    if (members.some((m) => m.email === email)) {
      setError("Email ini sudah menjadi anggota / sudah diundang");
      return;
    }
    setError("");
    setMembers([
      ...members,
      { id: `M-${Date.now()}`, name: nameFromEmail(email), email, role, status: "diundang" },
    ]);
    setEmail("");
  };

  return (
    <Panel>
      <ul className="divide-y divide-ink/10">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand"
              aria-hidden="true"
            >
              {initialsOf(m.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="truncate text-xs text-moss">{m.email}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase",
                m.role === "owner" ? "bg-brand text-white" : "bg-brand/10 text-brand",
              )}
            >
              {m.role}
            </span>
            {m.status === "diundang" && (
              <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-[11px] font-bold uppercase text-amber-deep">
                Diundang
              </span>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleInvite} className="mt-4 border-t border-ink/10 pt-4">
        <p className="mb-2 text-sm font-semibold">Undang anggota baru</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            aria-label="Email anggota baru"
            className="flex-1 rounded-md border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "owner")}
            aria-label="Peran anggota baru"
            className="cursor-pointer rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Kirim Undangan
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </form>
    </Panel>
  );
}

/* ---------- Seksi Produk ---------- */

function ProductsPanel({ initialProducts, filter }: { initialProducts: Product[]; filter: string }) {
  const [products, setProducts] = useState(initialProducts);
  const keyword = filter.trim().toLowerCase();
  const visible = keyword
    ? products.filter((p) => p.name.toLowerCase().includes(keyword))
    : products;
  const publishedCount = products.filter((p) => p.published).length;

  const togglePublish = (id: string) =>
    setProducts(products.map((p) => (p.id === id ? { ...p, published: !p.published } : p)));

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-moss">
          {publishedCount} tayang · {products.length - publishedCount} draft
          {keyword && ` · filter: "${filter.trim()}"`}
        </p>
        <a
          href="/toko/kelola/produk-baru"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          + Tambah Produk
        </a>
      </div>
      <ul className="divide-y divide-ink/10">
        {visible.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-3">
            <img src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-moss">
                {formatIDR(p.price)} · stok {p.stock} · {p.volume}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={p.published}
              aria-label={`${p.published ? "Unpublish" : "Publish"} ${p.name}`}
              onClick={() => togglePublish(p.id)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                p.published ? "bg-brand" : "bg-ink/20",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left]",
                  p.published ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
            <span
              className={cn(
                "w-14 text-right text-[11px] font-bold uppercase",
                p.published ? "text-brand" : "text-moss",
              )}
            >
              {p.published ? "Tayang" : "Draft"}
            </span>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="py-6 text-center text-sm text-moss">
            Tidak ada produk cocok dengan pencarian.
          </li>
        )}
      </ul>
    </Panel>
  );
}

/* ---------- Seksi Drop Point ---------- */

function DropPointPanel({ store, dropPoints }: { store: Store; dropPoints: DropPoint[] }) {
  const [selected, setSelected] = useState<string[]>(store.dropPointIds);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    setSaved(false);
  };

  return (
    <Panel>
      <p className="text-sm text-moss">
        Pilih drop point (dari master list) yang bisa dilayani toko — pembeli memilih salah satunya
        saat checkout.
      </p>
      <ul className="mt-4 space-y-2">
        {dropPoints.map((dp) => (
          <li key={dp.id}>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                selected.includes(dp.id)
                  ? "border-brand bg-brand/5"
                  : "border-ink/10 hover:border-brand/50",
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(dp.id)}
                onChange={() => toggle(dp.id)}
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
      <button
        type="button"
        onClick={() => setSaved(true)}
        className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Simpan Drop Point
      </button>
      {saved && (
        <p className="mt-2 text-sm text-brand">{selected.length} drop point disimpan (demo).</p>
      )}
    </Panel>
  );
}
