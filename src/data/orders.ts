import type { Order } from "../types";
import { products } from "./products";

const item = (productId: string, qty: number) => {
  const p = products.find((prod) => prod.id === productId)!;
  return { productId, name: p.name, price: p.price, qty, image: p.image };
};

const total = (items: { price: number; qty: number }[]) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0);

const buildOrder = (
  order: Omit<Order, "total" | "payment"> & Partial<Pick<Order, "payment">>,
): Order => ({ ...order, payment: "QRIS", total: total(order.items) });

/** Pesanan demo user — mencakup tiap tahap tracking untuk demo halaman pesanan. */
export const orders: Order[] = [
  buildOrder({
    id: "PK-2026-0412",
    date: "2026-07-03",
    storeName: "Warung Ibu Ani",
    items: [item("4", 1), item("8", 2)],
    dropPointId: "DP-1",
    status: "DISIAPKAN",
  }),
  buildOrder({
    id: "PK-2026-0398",
    date: "2026-07-02",
    storeName: "Kopi Tani Makmur",
    items: [item("1", 2)],
    dropPointId: "DP-2",
    status: "DIANTAR",
  }),
  buildOrder({
    id: "PK-2026-0375",
    date: "2026-07-01",
    storeName: "Kerajinan Sari Rotan",
    items: [item("3", 1), item("12", 1)],
    dropPointId: "DP-4",
    status: "TIBA_DI_DROP_POINT",
  }),
  buildOrder({
    id: "PK-2026-0311",
    date: "2026-06-26",
    storeName: "Batik Rumahan",
    items: [item("6", 1)],
    dropPointId: "DP-3",
    status: "SELESAI",
  }),
  buildOrder({
    id: "PK-2026-0420",
    date: "2026-07-04",
    storeName: "Tani Segar Bersama",
    items: [item("2", 3)],
    dropPointId: "DP-1",
    status: "MENUNGGU_PEMBAYARAN",
  }),
];
