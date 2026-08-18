import Link from "next/link";
import { prisma } from "@/lib/prisma";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const PAGE_LABELS: Record<string, string> = {
  "product-card": "Product listing",
  "product-detail": "Product page",
  floater: "Chat button",
};

export default async function AdminWhatsAppPage() {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [recentClicks, topProducts, totalLast30d] = await Promise.all([
    prisma.whatsAppClick.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.whatsAppClick.groupBy({
      by: ["productId", "productName"],
      where: { createdAt: { gte: since30d }, productId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 8,
    }),
    prisma.whatsAppClick.count({ where: { createdAt: { gte: since30d } } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-maroon">WhatsApp Interest</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Every tap on an "Order on WhatsApp" button or the chat bubble is logged here — this shows
        interest, not confirmed sales. When a chat turns into a real order,{" "}
        <Link href="/admin/orders/new" className="font-medium text-maroon hover:underline">
          log it as an order
        </Link>{" "}
        so it's tracked alongside your website orders.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gold-light/60 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-foreground/50">Clicks (30 days)</p>
          <p className="mt-1 text-2xl font-semibold text-maroon">{totalLast30d}</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Most Asked About (30 days)</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-foreground/50">No product-specific clicks yet.</p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p) => (
              <div key={p.productId} className="flex items-center justify-between text-sm">
                <span className="text-foreground/80">{p.productName ?? "Unknown product"}</span>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-ivory px-2.5 py-1 text-xs font-medium text-foreground/60">
                    {p._count._all} clicks
                  </span>
                  <Link
                    href={`/admin/orders/new?productId=${p.productId}&productName=${encodeURIComponent(p.productName ?? "")}`}
                    className="text-xs font-medium text-maroon hover:underline"
                  >
                    + Log order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Recent Activity</h2>
        {recentClicks.length === 0 ? (
          <p className="text-sm text-foreground/50">No WhatsApp clicks yet.</p>
        ) : (
          <div className="space-y-2">
            {recentClicks.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-gold-light/30 pb-2 text-sm last:border-0 last:pb-0">
                <div>
                  <p className="text-foreground/80">{c.productName ?? "General inquiry"}</p>
                  <p className="text-xs text-foreground/40">{PAGE_LABELS[c.page ?? ""] ?? c.page ?? "Unknown"}</p>
                </div>
                <span className="text-xs text-foreground/50">{timeAgo(c.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
