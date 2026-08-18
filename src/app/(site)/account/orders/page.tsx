import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?redirect=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-semibold text-maroon">My Orders</h1>

      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-gold-light/60 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{o.orderNumber}</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                {o.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-foreground/50">
              {o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <div className="mt-2 space-y-1">
              {o.items.map((item) => (
                <p key={item.id} className="text-sm text-foreground/70">
                  {item.productName} × {item.quantity}
                </p>
              ))}
            </div>
            <p className="mt-2 text-sm font-semibold text-maroon">{formatPrice(o.total)}</p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-foreground/50">You haven&apos;t placed any orders yet.</p>
        )}
      </div>
    </div>
  );
}
