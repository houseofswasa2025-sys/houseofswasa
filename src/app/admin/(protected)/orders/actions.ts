"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/require-admin";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email";
import { InsufficientStockError, decrementStock, notifyLowStock } from "@/lib/stock";
import type { OrderStatus } from "@/generated/prisma/client";

async function findColorRow(productId: string, colorName: string | null) {
  if (!colorName) return null;
  return prisma.productColor.findUnique({
    where: { productId_name: { productId, name: colorName } },
  });
}

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

  const itemsWithProduct = order.items.filter((i) => i.productId);
  const colorRows = await Promise.all(
    itemsWithProduct.map((i) => findColorRow(i.productId!, i.color))
  );

  if (isCancelling && !wasCancelled) {
    // Restore stock for items tied to a known color.
    await prisma.$transaction([
      ...itemsWithProduct
        .map((i, idx) => ({ item: i, colorRow: colorRows[idx] }))
        .filter((x) => x.colorRow)
        .map((x) =>
          prisma.productColor.update({
            where: { id: x.colorRow!.id },
            data: { stock: { increment: x.item.quantity } },
          })
        ),
      prisma.order.update({ where: { id: orderId }, data: { status } }),
    ]);
  } else if (wasCancelled && !isCancelling) {
    // Re-reserve stock; block if a color no longer exists at all.
    for (let i = 0; i < itemsWithProduct.length; i++) {
      const item = itemsWithProduct[i];
      if (!colorRows[i]) {
        return {
          error: `Cannot restore this order: "${item.productName}"${item.color ? ` (${item.color})` : ""} no longer has a matching color. Adjust manually first.`,
        };
      }
    }
    try {
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < itemsWithProduct.length; i++) {
          const item = itemsWithProduct[i];
          const label = `${item.productName}${item.color ? ` (${item.color})` : ""}`;
          await decrementStock(tx, colorRows[i]!.id, item.quantity, label);
        }
        await tx.order.update({ where: { id: orderId }, data: { status } });
      });
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return { error: `Cannot restore this order: ${error.message} Adjust stock first.` };
      }
      throw error;
    }
  } else {
    await prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  after(async () => {
    await sendOrderStatusUpdateEmail({ ...order, status }).catch((err) =>
      console.error("Order status update email failed:", err)
    );
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  return { success: true };
}

export type ManualOrderItem = { productId: string; colorId: string; quantity: number };

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
    include: { colors: true },
  });

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    const color = product?.colors.find((c) => c.id === item.colorId);
    if (!product || !color) return { error: "One of the selected products/colors no longer exists." };
    if (color.stock < item.quantity) {
      return { error: `"${product.name}" (${color.name}) only has ${color.stock} in stock.` };
    }
  }

  const orderItems = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const color = product.colors.find((c) => c.id === item.colorId)!;
    return {
      productId: product.id,
      colorId: color.id,
      productName: product.name,
      image: color.images[0] ?? product.images[0],
      price: product.salePrice ?? product.price,
      quantity: item.quantity,
      color: color.name,
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
          items: {
            create: orderItems.map(({ colorId: _colorId, ...rest }) => rest),
          },
        },
        include: { items: true },
      });

      for (const item of orderItems) {
        await decrementStock(tx, item.colorId, item.quantity, `${item.productName} (${item.color})`);
      }

      return created;
    });
    orderId = order.id;
    after(async () => {
      await sendOrderConfirmationEmail(order).catch((err) =>
        console.error("Order confirmation email failed:", err)
      );
      await notifyLowStock(orderItems.map((i) => i.colorId)).catch((err) =>
        console.error("Low stock push failed:", err)
      );
    });
  } catch (error) {
    if (error instanceof InsufficientStockError) return { error: error.message };
    return { error: "Couldn't save this order. Please try again." };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  redirect(`/admin/orders/${orderId}`);
}
