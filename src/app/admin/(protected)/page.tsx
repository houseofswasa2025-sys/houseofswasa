import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import { AnimatedNumber } from "@/components/animated-number";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";

export default async function AdminDashboardPage() {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalOrders, pendingOrders, totalProducts, lowStock, whatsappClicks7d, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.productColor.count({ where: { stock: { lte: 5 }, product: { isActive: true } } }),
    prisma.whatsAppClick.count({ where: { createdAt: { gte: since7d } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Total Orders", value: totalOrders },
    { label: "Pending Orders", value: pendingOrders },
    { label: "Products", value: totalProducts },
    { label: "Low Stock Colors (≤5)", value: lowStock },
    { label: "WhatsApp Clicks (7d)", value: whatsappClicks7d, href: "/admin/whatsapp" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Dashboard</h1>

      <RevealGroup className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5" stagger={0.07}>
        {stats.map((s) => {
          const card = (
            <div className="rounded-xl border border-gold-light/60 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-foreground/50">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-maroon">
                <AnimatedNumber value={s.value} />
              </p>
            </div>
          );
          return (
            <RevealItem key={s.label}>
              {s.href ? <Link href={s.href}>{card}</Link> : card}
            </RevealItem>
          );
        })}
      </RevealGroup>

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
