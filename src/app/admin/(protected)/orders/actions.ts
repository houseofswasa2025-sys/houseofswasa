"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success?: true; error?: string }> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { error: "Order not found." };
  if (order.status === status) return { success: true };

  const wasCancelled = order.status === "CANCELLED";
  const isCancelling = status === "CANCELLED";

  if (isCancelling && !wasCancelled) {
    // Restore stock for items tied to a product.
    await prisma.$transaction([
      ...order.items
        .filter((i) => i.productId)
        .map((i) =>
          prisma.product.update({
            where: { id: i.productId! },
            data: { stock: { increment: i.quantity } },
          })
        ),
      prisma.order.update({ where: { id: orderId }, data: { status } }),
    ]);
  } else if (wasCancelled && !isCancelling) {
    // Re-reserve stock; block if there isn't enough left.
    const products = await prisma.product.findMany({
      where: { id: { in: order.items.filter((i) => i.productId).map((i) => i.productId!) } },
    });
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return {
          error: `Cannot restore this order — "${item.productName}" no longer has enough stock (${product?.stock ?? 0} left, needs ${item.quantity}). Adjust stock first.`,
        };
      }
    }
    await prisma.$transaction([
      ...order.items
        .filter((i) => i.productId)
        .map((i) =>
          prisma.product.update({
            where: { id: i.productId! },
            data: { stock: { decrement: i.quantity } },
          })
        ),
      prisma.order.update({ where: { id: orderId }, data: { status } }),
    ]);
  } else {
    await prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  return { success: true };
}
