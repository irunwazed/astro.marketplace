import type { OrderStatus } from "../types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  DIBAYAR: "Dibayar",
  DISIAPKAN: "Disiapkan",
  DISERAHKAN_KE_KURIR: "Diserahkan ke Kurir",
  DIANTAR: "Diantar",
  TIBA_DI_DROP_POINT: "Tiba di Drop Point",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

/** Kelas warna badge status (token tema di global.css). */
export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  MENUNGGU_PEMBAYARAN: "bg-amber/15 text-amber-deep",
  DIBAYAR: "bg-forest/10 text-forest",
  DISIAPKAN: "bg-forest/10 text-forest",
  DISERAHKAN_KE_KURIR: "bg-forest/10 text-forest",
  DIANTAR: "bg-forest/10 text-forest",
  TIBA_DI_DROP_POINT: "bg-amber/15 text-amber-deep",
  SELESAI: "bg-forest text-white",
  DIBATALKAN: "bg-terracotta/15 text-terracotta",
};

/** Lima tahap tracking yang dipantau pembeli (poin 13 requirement). */
export const TRACKING_STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: "DISIAPKAN", label: "Disiapkan", hint: "Toko sedang menyiapkan pesanan" },
  { status: "DISERAHKAN_KE_KURIR", label: "Diserahkan ke Kurir", hint: "Paket diberikan ke kurir" },
  { status: "DIANTAR", label: "Diantar", hint: "Kurir dalam perjalanan" },
  { status: "TIBA_DI_DROP_POINT", label: "Tiba di Drop Point", hint: "Paket siap diambil/diserahkan" },
  { status: "SELESAI", label: "Selesai", hint: "Barang pesanan sudah diterima" },
];

/**
 * Indeks tahap tracking yang sudah tercapai (0–4).
 * -1 = belum masuk tahap tracking (belum dibayar / baru dibayar / batal).
 */
export function trackingIndex(status: OrderStatus): number {
  return TRACKING_STEPS.findIndex((s) => s.status === status);
}
