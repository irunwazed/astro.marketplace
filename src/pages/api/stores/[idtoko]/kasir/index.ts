import type { APIRoute } from "astro";
import { err, ok } from "../../../../../lib/server/response";
import { addTransaction, getTransactions } from "../../../../../lib/server/kasir-store";
import { getProducts, updateProduct } from "../../../../../lib/server/store-products-store";
import { myStore } from "../../../../../data/my-store";
import type { KasirPaymentMethod, KasirTransaction, OrderItem } from "../../../../../types";

export const prerender = false;

export function getStaticPaths() {
  return [{ params: { idtoko: "ST-1" } }, { params: { idtoko: "ST-2" } }];
}

interface CheckoutBody {
  items?: { productId?: string; qty?: number }[];
  paymentMethod?: string;
  memberNo?: string;
  memberName?: string;
  kasirName?: string;
  kasirEmail?: string;
}

/** GET /api/stores/:idtoko/kasir — daftar transaksi kasir toko. */
export const GET: APIRoute = ({ params }) => ok(getTransactions(params.idtoko!));

/** POST /api/stores/:idtoko/kasir — checkout kasir. */
export const POST: APIRoute = async ({ params, request }) => {
  const storeId = params.idtoko!;
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return err("Body harus JSON", 400);
  }

  if (!body.items?.length) return err("Item kosong", 400);

  const method: KasirPaymentMethod =
    body.paymentMethod === "qris" || body.paymentMethod === "transfer"
      ? body.paymentMethod
      : "cash";

  // Bangun item transaksi & hitung subtotal dari harga produk terpercaya (server-side).
  const products = getProducts(storeId);
  const items: OrderItem[] = [];
  let subtotal = 0;
  for (const line of body.items) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return err(`Produk ${line.productId ?? "?"} tidak ditemukan`, 400);
    const qty = Math.min(Math.max(1, Math.floor(line.qty ?? 1)), product.stock);
    if (qty > product.stock) return err(`Stok ${product.name} tidak cukup`, 400);
    const lineTotal = product.price * qty;
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
      image: product.image,
    });
    subtotal += lineTotal;
  }

  // Kurangi stok produk di toko.
  for (const line of body.items) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) continue;
    const qty = Math.min(Math.max(1, Math.floor(line.qty ?? 1)), product.stock);
    updateProduct(storeId, product.id, { stock: product.stock - qty });
  }

  const storeName = storeId === "ST-1" ? myStore.name : "Kopi Tani Makmur";

  const tx: KasirTransaction = {
    id: `KSR-${Date.now()}`,
    storeId,
    storeName,
    kasirName: body.kasirName?.trim() || "Kasir",
    kasirEmail: body.kasirEmail?.trim() || "",
    memberNo: body.memberNo?.trim() || undefined,
    memberName: body.memberName?.trim() || undefined,
    items,
    subtotal,
    adminFee: 0, // kasir: selalu 0 (QRIS statis, cash, transfer manual)
    total: subtotal,
    paymentMethod: method,
    datetime: new Date().toISOString(),
    status: "selesai",
  };
  return ok(addTransaction(storeId, tx), 201);
};