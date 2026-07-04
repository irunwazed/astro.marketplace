import type { APIRoute } from "astro";
import { products } from "../../../data/products";
import { dropPoints } from "../../../data/drop-points";
import { allOrders, saveOrder } from "../../../lib/server/orders-store";
import { err, ok } from "../../../lib/server/response";
import { computeCheckoutCost, PAYMENT_ADMIN_RATES } from "../../../lib/checkout-math";
import type { DeliveryLocation, Order, OrderItem } from "../../../types";

export const prerender = false;

/** GET /api/orders — pesanan contoh + pesanan yang dibuat lewat POST. */
export const GET: APIRoute = () => ok(allOrders());

interface CreateOrderBody {
  items?: { productId?: string; qty?: number }[];
  dropPointId?: string;
  delivery?: Partial<DeliveryLocation>;
  payment?: string;
}

/**
 * POST /api/orders — buat pesanan dari checkout.
 * Body: { items: [{ productId, qty }], dropPointId, delivery: { building, floor, room, note? } }
 * Harga dihitung ulang di server dari data produk; status awal MENUNGGU_PEMBAYARAN.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  if (!body.items?.length) return err("Item pesanan kosong", 400);
  if (!dropPoints.some((dp) => dp.id === body.dropPointId)) {
    return err("Drop point tidak ditemukan", 400);
  }
  const { building, floor, room, note } = body.delivery ?? {};
  if (!building?.trim() || !floor?.trim() || !room?.trim()) {
    return err("Lokasi pengiriman (gedung, lantai, ruangan) wajib diisi", 400);
  }

  const items: OrderItem[] = [];
  const sellers = new Set<string>();
  for (const line of body.items) {
    const product = products.find((p) => p.id === line.productId && p.published);
    if (!product) return err(`Produk ${line.productId ?? "?"} tidak ditemukan`, 400);
    const qty = Math.min(Math.max(1, Math.floor(line.qty ?? 1)), product.stock);
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
      image: product.image,
    });
    sellers.add(product.seller);
  }

  // Satu pesanan = satu toko. Berbeda toko harus di-checkout terpisah.
  if (sellers.size > 1) {
    return err("Item pesanan harus dari satu toko. Checkout tiap toko secara terpisah.", 400);
  }

  const dropPoint = dropPoints.find((dp) => dp.id === body.dropPointId)!;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const paymentMethod = body.payment ?? "qris";
  const adminRate = PAYMENT_ADMIN_RATES[paymentMethod] ?? 0;
  const cost = computeCheckoutCost(subtotal, dropPoint.shippingCost, adminRate);

  const order: Order = {
    id: `PK-2026-${String(Date.now()).slice(-4)}`,
    date: new Date().toISOString().slice(0, 10),
    storeName: [...sellers][0],
    items,
    subtotal: cost.subtotal,
    ongkir: cost.ongkir,
    adminFee: cost.adminFee,
    total: cost.grandTotal,
    dropPointId: body.dropPointId!,
    delivery: { building: building.trim(), floor: floor.trim(), room: room.trim(), note: note?.trim() || undefined },
    payment: "QRIS",
    status: "MENUNGGU_PEMBAYARAN",
  };
  saveOrder(order);
  return ok(order, 201);
};
