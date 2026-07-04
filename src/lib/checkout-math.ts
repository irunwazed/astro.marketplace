/**
 * Perhitungan biaya checkout — dipakai bersama oleh UI (CartView, CheckoutFlow)
 * dan API (POST /api/orders) agar selalu konsisten.
 *
 * Model biaya:
 *   subtotal (y)   = Σ (price × qty)            // harga barang asli
 *   adminFee       = ceil(y / (1 - rate)) − y   // biaya admin sesuai metode pembayaran
 *   ongkir         = DropPoint.shippingCost     // flat per drop point
 *   grandTotal     = y + adminFee + ongkir
 *
 * `x − rate·x ≥ y` terpenuhi, sehingga penjual tetap menerima harga barang
 * asli y. Biaya admin dibulatkan ke atas ke kelipatan Rp 100.
 */
export const ADMIN_RATE = 0.007;

/** Tarif biaya admin per metode pembayaran. 0 = gratis. */
export const PAYMENT_ADMIN_RATES: Record<string, number> = {
  qris: 0.007,
  transfer: 0.005,
  cod: 0.01,
};

/** Pembulatan ke atas ke kelipatan Rp 100 terdekat. */
export function roundUp100(value: number): number {
  return Math.ceil(value / 100) * 100;
}

/**
 * Biaya admin untuk rate tertentu.
 *
 * `x = ceil(y / (1 − rate))` adalah total pembayaran minimum sehingga
 * `x − rate·x ≥ y` (penjual tetap menerima y). Biaya admin = x − y,
 * dibulatkan ke atas ke kelipatan Rp 100.
 */
export function computeAdminFee(subtotal: number, rate: number = ADMIN_RATE): number {
  if (subtotal <= 0 || rate <= 0) return 0;
  const x = Math.ceil(subtotal / (1 - rate));
  return roundUp100(x) - subtotal;
}

/** Total akhir yang dibayar pembeli. */
export function computeGrandTotal(subtotal: number, ongkir: number, adminFee: number): number {
  return subtotal + ongkir + adminFee;
}

export interface CheckoutCost {
  subtotal: number;
  ongkir: number;
  adminFee: number;
  grandTotal: number;
}

/** Ringkas satu perhitungan rincian biaya dari subtotal + ongkir + rate admin. */
export function computeCheckoutCost(
  subtotal: number,
  ongkir: number,
  adminRate: number = ADMIN_RATE,
): CheckoutCost {
  const adminFee = computeAdminFee(subtotal, adminRate);
  return { subtotal, ongkir, adminFee, grandTotal: computeGrandTotal(subtotal, ongkir, adminFee) };
}