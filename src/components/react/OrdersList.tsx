import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { getLocalOrders } from "../../lib/my-orders";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "../../lib/order-status";
import { getOrders } from "../../services/order-service";
import { formatIDR } from "./ProductCard";
import type { Order } from "../../types";

interface Props {
  /** Pesanan contoh dari src/data/orders.ts (punya halaman statis /orders/[id]). */
  demoOrders: Order[];
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );

interface Row {
  order: Order;
  href: string;
  isNew: boolean;
}

export default function OrdersList({ demoOrders }: Props) {
  const [rows, setRows] = useState<Row[]>([]);

  // Daftar diambil dari GET /api/orders (lewat order-service); pesanan hasil
  // checkout di browser ini (localStorage) tampil paling atas. Bila API tak
  // terjangkau, jatuh ke pesanan contoh dari props.
  useEffect(() => {
    (async () => {
      let remote: Order[];
      try {
        remote = await getOrders();
      } catch {
        remote = demoOrders;
      }
      const local = getLocalOrders();
      const localIds = new Set(local.map((o) => o.id));
      const demoIds = new Set(demoOrders.map((o) => o.id));
      setRows([
        ...local.map((order) => ({ order, href: `/orders/lacak?id=${order.id}`, isNew: true })),
        ...remote
          .filter((o) => !localIds.has(o.id))
          .map((order) => ({
            order,
            href: demoIds.has(order.id) ? `/orders/${order.id}` : `/orders/lacak?id=${order.id}`,
            isNew: !demoIds.has(order.id),
          })),
      ]);
    })();
  }, [demoOrders]);

  return (
    <ul className="space-y-3">
      {rows.map(({ order, href, isNew }) => (
        <li key={order.id}>
          <a
            href={href}
            className="block rounded-xl border border-ink/10 bg-white p-4 transition-colors hover:border-forest"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-bold">
                {order.id}
                {isNew && (
                  <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-deep">
                    Pesanan Anda
                  </span>
                )}
              </p>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-bold uppercase",
                  ORDER_STATUS_BADGE[order.status],
                )}
              >
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-moss">
              {formatDate(order.date)} · {order.storeName}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item) => (
                  <img
                    key={item.productId}
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm text-ink/80">
                {order.items.map((i) => i.name).join(", ")}
              </p>
              <p className="font-display text-sm font-bold">{formatIDR(order.total)}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
