import { formatIDR } from "./ProductCard";
import type { Order } from "../../types";

/**
 * Rincian biaya pesanan — tampilkan Subtotal + Ongkir + Biaya admin = Total
 * bila order menyimpan `ongkir` & `adminFee` (order baru). Bila tidak ada
 * (order contoh lama), tampilkan total saja (backward compat).
 */
export default function OrderCostSummary({ order }: { order: Order }) {
  const hasBreakdown =
    order.subtotal !== undefined && order.ongkir !== undefined && order.adminFee !== undefined;

  if (!hasBreakdown) {
    return (
      <p className="mt-2 flex justify-between border-t border-ink/10 pt-2 text-sm">
        <span className="font-semibold">Total</span>
        <span className="font-display text-lg font-bold">{formatIDR(order.total)}</span>
      </p>
    );
  }

  return (
    <dl className="mt-2 space-y-1.5 border-t border-ink/10 pt-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-moss">Subtotal</dt>
        <dd className="font-semibold">{formatIDR(order.subtotal!)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-moss">Ongkir</dt>
        <dd className="font-semibold">{formatIDR(order.ongkir!)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-moss">Biaya admin QRIS</dt>
        <dd className="font-semibold">{formatIDR(order.adminFee!)}</dd>
      </div>
      <div className="flex justify-between border-t border-ink/10 pt-2">
        <dt className="font-semibold">Total</dt>
        <dd className="font-display text-lg font-bold">{formatIDR(order.total)}</dd>
      </div>
    </dl>
  );
}