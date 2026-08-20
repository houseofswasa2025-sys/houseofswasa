import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = statuses.find((s) => s === status);
  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-maroon">Orders</h1>
        <Link
          href="/admin/orders/new"
          className="rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-md active:scale-95"
        >
          + Log Order
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-transform active:scale-95 ${!status ? "bg-maroon text-white" : "bg-white text-foreground/70 border border-gold-light"}`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-transform active:scale-95 ${status === s ? "bg-maroon text-white" : "bg-white text-foreground/70 border border-gold-light"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gold-light/60 bg-white p-6 text-center text-foreground/50">
          No orders found.
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="block rounded-xl border border-gold-light/60 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-maroon">
                    {o.orderNumber}
                    {o.source === "WHATSAPP" && (
                      <span className="rounded-full bg-[#25D366]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#128C4A]">
                        WA
                      </span>
                    )}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                    {o.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/70">{o.customerName}</p>
                <div className="mt-2 flex -space-x-2">
                  {o.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="relative h-10 w-8 shrink-0 overflow-hidden rounded border-2 border-white bg-ivory"
                    >
                      {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-foreground/50">
                  <span>{o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="font-semibold text-foreground">{formatPrice(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gold-light/60 bg-white md:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-gold-light/60 text-left text-xs uppercase tracking-wide text-foreground/50">
                  <th className="p-3">Order</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gold-light/30 last:border-0">
                    <td className="p-3">
                      <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-1.5 font-medium text-maroon hover:underline">
                        {o.orderNumber}
                        {o.source === "WHATSAPP" && (
                          <span className="rounded-full bg-[#25D366]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#128C4A]">
                            WA
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="p-3">
                      <div className="flex -space-x-2">
                        {o.items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="relative h-10 w-8 shrink-0 overflow-hidden rounded border-2 border-white bg-ivory"
                          >
                            {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <p>{o.customerName}</p>
                      <p className="text-xs text-foreground/50">{o.phone}</p>
                    </td>
                    <td className="p-3">{formatPrice(o.total)}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-foreground/60">
                      {o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
