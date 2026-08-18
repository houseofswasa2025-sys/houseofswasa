"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type CheckoutItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
};

export type CheckoutInput = {
  customerName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  items: CheckoutItem[];
};

export async function placeOrder(input: CheckoutInput) {
  if (input.items.length === 0) {
    return { error: "Your cart is empty." };
  }

  const session = await auth();

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return { error: `Sorry, "${item.name}" doesn't have enough stock. Please update your cart.` };
    }
  }

  const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const orderNumber = `HOS${Date.now().toString().slice(-8)}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || undefined,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || undefined,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        notes: input.notes || undefined,
        subtotal,
        total: subtotal,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            image: products.find((p) => p.id === i.productId)?.images[0],
            price: i.price,
            quantity: i.quantity,
            color: i.color,
          })),
        },
      },
    });

    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return { success: true, orderNumber: order.orderNumber, orderId: order.id };
}
