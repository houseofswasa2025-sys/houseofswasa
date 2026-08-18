import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, whatsappLink } from "@/lib/constants";
import { updateOrderStatus } from "../actions";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-maroon">{order.orderNumber}</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Placed on {order.createdAt.toLocaleString("en-IN")}
      </p>

      <div className="mb-6 rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-2 font-semibold text-foreground">Customer</h2>
        <p className="text-sm">{order.customerName}</p>
        <p className="text-sm text-foreground/70">{order.phone}</p>
        {order.email && <p className="text-sm text-foreground/70">{order.email}</p>}
        <p className="mt-2 text-sm text-foreground/70">
          {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city}, {order.state} - {order.pincode}
        </p>
        <a
          href={whatsappLink(`Hi ${order.customerName}, this is House of Swasa regarding your order ${order.orderNumber}.`, order.phone.replace(/\D/g, ""))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-full border border-[#25D366] px-3 py-1.5 text-xs font-semibold text-[#128C4A] hover:bg-[#25D366]/10"
        >
          Message on WhatsApp
        </a>
      </div>

      <div className="mb-6 rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Items</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productName} {item.color ? `(${item.color})` : ""} × {item.quantity}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-gold-light/60 pt-3 text-sm font-semibold">
          <span>Total ({order.paymentMethod})</span>
          <span className="text-maroon">{formatPrice(order.total)}</span>
        </div>
        {order.notes && (
          <p className="mt-3 text-sm text-foreground/60">
            <span className="font-medium">Notes:</span> {order.notes}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <form key={s} action={updateOrderStatus.bind(null, order.id, s)}>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  order.status === s
                    ? "bg-maroon text-white"
                    : "border border-gold-light text-foreground/70 hover:border-maroon"
                }`}
              >
                {s}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
