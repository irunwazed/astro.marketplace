import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { getLocalOrder } from "../../lib/my-orders";
import { getOrder } from "../../services/order-service";
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABEL,
  TRACKING_STEPS,
  trackingIndex,
} from "../../lib/order-status";
import { formatIDR } from "./ProductCard";
import type { DropPoint, Order } from "../../types";

interface Props {
  dropPoints: DropPoint[];
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );

/** Detail + pelacakan pesanan hasil checkout (tersimpan di localStorage). */
export default function OrderTracking({ dropPoints }: Props) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  // Cari lewat GET /api/orders/:id (order-service); bila tidak ada di server
  // (mis. server sudah restart), pakai salinan localStorage.
  useEffect(() => {
    (async () => {
      const id = new URLSearchParams(window.location.search).get("id") ?? "";
      try {
        setOrder(await getOrder(id));
      } catch {
        setOrder(getLocalOrder(id) ?? null);
      }
    })();
  }, []);

  if (order === undefined) return null;

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-bold">Pesanan tidak ditemukan</p>
        <p className="mt-1 text-sm text-moss">
          Pesanan mungkin dibuat dari perangkat lain (demo menyimpan pesanan di browser ini saja).
        </p>
        <a
          href="/orders"
          className="mt-5 inline-block rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
        >
          Semua Pesanan
        </a>
      </div>
    );
  }

  const dropPoint = dropPoints.find((dp) => dp.id === order.dropPointId);
  const reached = trackingIndex(order.status);

  return (
    <div>
      <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{order.id}</h1>
          <p className="mt-1 text-sm text-moss">
            {formatDate(order.date)} · {order.storeName}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase",
            ORDER_STATUS_BADGE[order.status],
          )}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </header>

      <section className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm shadow-ink/5">
        <h2 className="font-display text-lg font-bold">Lacak Pesanan</h2>
        <ol className="mt-5">
          {TRACKING_STEPS.map((step, i) => {
            const done = reached >= i;
            const current = i === reached;
            const last = i === TRACKING_STEPS.length - 1;
            return (
              <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                {!last && (
                  <span
                    className={cn(
                      "absolute left-3.75 top-8 h-[calc(100%-2rem)] w-0.5",
                      i < reached ? "bg-forest" : "bg-ink/10",
                    )}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    done ? "bg-forest text-white" : "border-2 border-ink/15 bg-white text-moss",
                  )}
                  aria-hidden="true"
                >
                  {done ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m4 12.5 5 5L20 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="pt-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      done ? "text-ink" : "text-moss",
                      current && "text-forest",
                    )}
                  >
                    {step.label}
                    {current && (
                      <span className="ml-2 rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold uppercase text-forest">
                        Saat ini
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-moss">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold">Tujuan Pengiriman</h2>
          {dropPoint && (
            <>
              <p className="mt-2 text-sm font-semibold">{dropPoint.name}</p>
              <p className="text-xs text-moss">{dropPoint.address}</p>
            </>
          )}
          {order.delivery && (
            <dl className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-moss">Gedung</dt>
                <dd className="text-right font-semibold">{order.delivery.building}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-moss">Lantai</dt>
                <dd className="text-right font-semibold">{order.delivery.floor}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-moss">Ruangan</dt>
                <dd className="text-right font-semibold">{order.delivery.room}</dd>
              </div>
              {order.delivery.note && (
                <div className="pt-1">
                  <dt className="text-moss">Penjelasan</dt>
                  <dd className="mt-0.5 text-ink/80">{order.delivery.note}</dd>
                </div>
              )}
            </dl>
          )}
          <p className="mt-3 border-t border-ink/10 pt-3 text-xs text-moss">
            Pembayaran: <strong className="text-ink">{order.payment}</strong>
          </p>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold">Barang</h2>
          <ul className="mt-2 divide-y divide-ink/10">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 py-2.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-11 w-11 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-moss">
                    {item.qty} × {formatIDR(item.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatIDR(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between border-t border-ink/10 pt-2 text-sm">
            <span className="font-semibold">Total</span>
            <span className="font-display text-lg font-bold">{formatIDR(order.total)}</span>
          </p>
        </section>
      </div>
    </div>
  );
}
