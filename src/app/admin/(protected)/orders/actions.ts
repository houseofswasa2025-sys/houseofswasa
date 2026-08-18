"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/require-admin";
import type { OrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return { error: "Unauthorized." };

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

export type ManualOrderItem = { productId: string; quantity: number };

export type ManualOrderInput = {
  customerName: string;
  phone: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  status: OrderStatus;
  items: ManualOrderItem[];
};

export async function createManualOrder(input: ManualOrderInput) {
  await requireAdmin();

  if (input.items.length === 0) {
    return { error: "Add at least one item." };
  }
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return { error: "Item quantities must be positive whole numbers." };
    }
  }
  if (!input.customerName.trim() || !input.phone.trim()) {
    return { error: "Customer name and phone are required." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) } },
  });

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { error: "One of the selected products no longer exists." };
    if (product.stock < item.quantity) {
      return { error: `"${product.name}" only has ${product.stock} in stock.` };
    }
  }

  const orderItems = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      productId: product.id,
      productName: product.name,
      image: product.images[0],
      price: product.salePrice ?? product.price,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const orderNumber = `HOS${Date.now().toString().slice(-8)}`;

  let orderId: string;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || undefined,
          addressLine1: input.addressLine1?.trim() || "Shared via WhatsApp",
          addressLine2: input.addressLine2?.trim() || undefined,
          city: input.city?.trim() || "-",
          state: input.state?.trim() || "-",
          pincode: input.pincode?.trim() || "-",
          notes: input.notes?.trim() || undefined,
          subtotal,
          total: subtotal,
          status: input.status,
          source: "WHATSAPP",
          items: { create: orderItems },
        },
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });
    orderId = order.id;
  } catch {
    return { error: "Couldn't save this order. Please try again." };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  redirect(`/admin/orders/${orderId}`);
}
