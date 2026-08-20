"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isValidEmail } from "@/lib/validate-email";

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
  email: string;
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
  if (!isValidEmail(input.email)) {
    return { error: "Please enter a valid email address." };
  }

  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return { error: "Invalid item quantity in your cart. Please refresh and try again." };
    }
  }

  const session = await auth();

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { colors: { orderBy: { sortOrder: "asc" } } },
  });

  // Resolve each cart line to its specific ProductColor row (never trust client price/name).
  const resolved = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const color = product?.colors.find((c) => c.name === item.color) ?? product?.colors[0];
    return { item, product, color };
  });

  for (const { item, product, color } of resolved) {
    if (!product || !product.isActive || !color || color.stock < item.quantity) {
      return { error: `Sorry, "${item.name}" doesn't have enough stock. Please update your cart.` };
    }
  }

  const orderItems = resolved.map(({ item, product, color }) => ({
    productId: product!.id,
    productName: product!.name,
    image: color!.images[0] ?? product!.images[0],
    price: product!.salePrice ?? product!.price,
    quantity: item.quantity,
    color: color!.name,
    colorId: color!.id,
  }));

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const orderNumber = `HOS${Date.now().toString().slice(-8)}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || undefined,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        notes: input.notes || undefined,
        subtotal,
        total: subtotal,
        items: {
          create: orderItems.map(({ colorId: _colorId, ...rest }) => rest),
        },
      },
    });

    for (const item of orderItems) {
      await tx.productColor.update({
        where: { id: item.colorId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  if (session?.user?.id && !session.user.email) {
    await prisma.user
      .update({ where: { id: session.user.id }, data: { email: input.email } })
      .catch(() => {}); // another account may already own this email — order still succeeds either way
  }

  return { success: true, orderNumber: order.orderNumber, orderId: order.id };
}
