import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, whatsappLink } from "@/lib/constants";
import { OrderStatusButtons } from "../order-status-buttons";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-maroon">{order.orderNumber}</h1>
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
          className="mt-3 inline-block rounded-full border border-[#25D366] px-3 py-1.5 text-xs font-semibold text-[#128C4A] transition-transform active:scale-95 hover:bg-[#25D366]/10"
        >
          Message on WhatsApp
        </a>
      </div>

      <div className="mb-6 rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-ivory">
                {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
              </div>
              <span className="flex-1">
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
        <OrderStatusButtons orderId={order.id} status={order.status} />
      </div>
    </div>
  );
}
