import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import { AnimatedNumber } from "@/components/animated-number";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import type { OrderStatus, OrderSource } from "@/generated/prisma/client";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const card = (
    <div className="rounded-xl border border-gold-light/60 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <p className="text-xs uppercase tracking-wide text-foreground/50">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-maroon">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>
    </div>
  );
  return <RevealItem>{href ? <Link href={href}>{card}</Link> : card}</RevealItem>;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    whatsappClicks7d,
    recentOrders,
    revenueAgg,
    revenueThisMonthAgg,
    statusGroups,
    sourceGroups,
    saleProducts,
    orderItemsForTopSellers,
    ordersByUserGroup,
    guestOrderCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.productColor.count({ where: { stock: { lte: 5 }, product: { isActive: true } } }),
    prisma.productColor.count({ where: { stock: { lte: 0 }, product: { isActive: true } } }),
    prisma.whatsAppClick.count({ where: { createdAt: { gte: since7d } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.groupBy({ by: ["source"], _count: true }),
    prisma.product.findMany({
      where: { salePrice: { not: null }, isActive: true },
      select: { price: true, salePrice: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } } },
      select: { productId: true, productName: true, price: true, quantity: true },
    }),
    prisma.order.groupBy({ by: ["userId"], where: { userId: { not: null } }, _count: true }),
    prisma.order.count({ where: { userId: null } }),
  ]);

  const revenue = revenueAgg._sum.total ?? 0;
  const revenueThisMonth = revenueThisMonthAgg._sum.total ?? 0;
  const nonCancelledCount = revenueAgg._count;
  const avgOrderValue = nonCancelledCount > 0 ? Math.round(revenue / nonCancelledCount) : 0;

  const statusCounts = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count])
  ) as Partial<Record<OrderStatus, number>>;
  const cancelledCount = statusCounts.CANCELLED ?? 0;
  const cancelledRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;

  const sourceCounts = Object.fromEntries(
    sourceGroups.map((g) => [g.source, g._count])
  ) as Partial<Record<OrderSource, number>>;

  const avgDiscountPct =
    saleProducts.length > 0
      ? Math.round(
          saleProducts.reduce((sum, p) => sum + ((p.price - p.salePrice!) / p.price) * 100, 0) /
            saleProducts.length
        )
      : 0;

  const sellerMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of orderItemsForTopSellers) {
    const key = item.productId ?? item.productName;
    const existing = sellerMap.get(key);
    if (existing) {
      existing.qty += item.quantity;
      existing.revenue += item.price * item.quantity;
    } else {
      sellerMap.set(key, { name: item.productName, qty: item.quantity, revenue: item.price * item.quantity });
    }
  }
  const topSellers = [...sellerMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  const repeatCustomers = ordersByUserGroup.filter((g) => g._count >= 2).length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Dashboard</h1>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">Revenue</h2>
      <RevealGroup className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.07}>
        <StatCard label="Total Revenue" value={formatPrice(revenue)} />
        <StatCard label="Revenue This Month" value={formatPrice(revenueThisMonth)} />
        <StatCard label="Average Order Value" value={formatPrice(avgOrderValue)} />
      </RevealGroup>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">Orders</h2>
      <RevealGroup className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.07}>
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard label="Pending Orders" value={pendingOrders} />
        <StatCard label="Cancelled Rate" value={`${cancelledRate.toFixed(1)}%`} />
        <StatCard label="WhatsApp Clicks (7d)" value={whatsappClicks7d} href="/admin/whatsapp" />
      </RevealGroup>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">Inventory & Discounts</h2>
      <RevealGroup className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.07}>
        <StatCard label="Products" value={totalProducts} href="/admin/products" />
        <StatCard label="Low Stock Colors (≤5)" value={lowStockCount} href="/admin/products" />
        <StatCard label="Out of Stock Colors" value={outOfStockCount} href="/admin/products" />
        <StatCard
          label="On Sale"
          value={saleProducts.length > 0 ? `${saleProducts.length} (avg ${avgDiscountPct}% off)` : "0"}
          href="/admin/products"
        />
      </RevealGroup>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal className="rounded-xl border border-gold-light/60 bg-white p-4">
          <h2 className="mb-3 font-semibold text-foreground">Orders by Status</h2>
          <div className="space-y-2">
            {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => {
              const count = statusCounts[s] ?? 0;
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 text-foreground/70">{STATUS_LABEL[s]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory">
                    <div className="h-full rounded-full bg-maroon" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right font-medium text-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="rounded-xl border border-gold-light/60 bg-white p-4">
          <h2 className="mb-3 font-semibold text-foreground">Customers & Channels</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground/70">Website Orders</span>
              <span className="font-medium text-foreground">{sourceCounts.WEBSITE ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/70">WhatsApp Orders</span>
              <span className="font-medium text-foreground">{sourceCounts.WHATSAPP ?? 0}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gold-light/40 pt-2">
              <span className="text-foreground/70">Guest Checkouts</span>
              <span className="font-medium text-foreground">{guestOrderCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/70">Repeat Customers</span>
              <span className="font-medium text-foreground">{repeatCustomers}</span>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mb-8 rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Top Selling Products</h2>
        {topSellers.length === 0 ? (
          <p className="text-sm text-foreground/50">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {topSellers.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground/70">{s.name}</span>
                <span className="text-foreground/50">
                  {s.qty} sold &middot; <span className="font-medium text-maroon">{formatPrice(s.revenue)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Reveal>

      <div className="rounded-xl border border-gold-light/60 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-maroon hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-ivory"
            >
              <div>
                <p className="font-medium text-foreground">{o.orderNumber}</p>
                <p className="text-xs text-foreground/50">{o.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{formatPrice(o.total)}</p>
                <p className="text-xs uppercase text-foreground/50">{o.status}</p>
              </div>
            </Link>
          ))}
          {recentOrders.length === 0 && <p className="text-sm text-foreground/50">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
