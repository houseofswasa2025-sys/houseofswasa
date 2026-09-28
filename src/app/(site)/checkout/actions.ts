"use server";

import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isValidEmail } from "@/lib/validate-email";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/email";
import { getOrderNotificationRecipients } from "@/lib/site-settings";
import { InsufficientStockError, decrementStock, notifyLowStock } from "@/lib/stock";
import { sendPushToAdmins } from "@/lib/push";
import { formatPrice } from "@/lib/constants";
import { revalidateStorefront } from "@/lib/revalidate";
import { withOrderNumber } from "@/lib/order-number";

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

export type PriceUpdate = { productId: string; color?: string; price: number };

export type PlaceOrderResult =
  | { success: true; orderNumber: string; orderId: string; error?: undefined }
  | { success?: undefined; error: string; priceUpdates?: PriceUpdate[] };

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();

const checkoutSchema = z.object({
  customerName: text(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return /^\+?[\d\s-]+$/.test(v) && digits >= 10 && digits <= 13;
    }),
  email: z.string().trim().max(254),
  addressLine1: text(200),
  addressLine2: optionalText(200),
  city: text(80),
  state: text(80),
  pincode: z.string().trim().regex(/^\d{6}$/),
  notes: optionalText(500),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(64),
        name: z.string().max(200),
        price: z.number(),
        quantity: z.number().int().min(1).max(20),
        color: z.string().max(60).optional(),
      })
    )
    .min(1)
    .max(30),
});

const FIELD_ERRORS: Record<string, string> = {
  customerName: "Please enter your full name.",
  phone: "Please enter a valid phone number.",
  email: "Please enter a valid email address.",
  addressLine1: "Please enter your address.",
  addressLine2: "Address line 2 is too long.",
  city: "Please enter your city.",
  state: "Please enter your state.",
  pincode: "Please enter a valid 6-digit pincode.",
  notes: "Order notes are too long (500 characters max).",
  items: "Invalid items in your cart. Please refresh and try again.",
};

// DB-backed throttle, so it holds across serverless instances: stops a bot
// from placing a stream of fake COD orders that lock up all the stock.
const RECENT_WINDOW_MS = 15 * 60 * 1000;
const MAX_RECENT_PER_CUSTOMER = 3;
const MAX_RECENT_GLOBAL = 40;

export async function placeOrder(rawInput: CheckoutInput): Promise<PlaceOrderResult> {
  if (!rawInput?.items?.length) {
    return { error: "Your cart is empty." };
  }
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    return { error: FIELD_ERRORS[field] ?? "Please check your details and try again." };
  }
  const input = parsed.data;
  if (!isValidEmail(input.email)) {
    return { error: "Please enter a valid email address." };
  }

  const since = new Date(Date.now() - RECENT_WINDOW_MS);
  const [recentForCustomer, recentGlobal] = await Promise.all([
    prisma.order.count({
      where: {
        source: "WEBSITE",
        createdAt: { gte: since },
        OR: [{ phone: input.phone }, { email: input.email }],
      },
    }),
    prisma.order.count({ where: { source: "WEBSITE", createdAt: { gte: since } } }),
  ]);
  if (recentForCustomer >= MAX_RECENT_PER_CUSTOMER || recentGlobal >= MAX_RECENT_GLOBAL) {
    return {
      error:
        "We've received several orders in the last few minutes. Please message us on WhatsApp to place another one.",
    };
  }

  const session = await auth();

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { colors: { orderBy: { sortOrder: "asc" } } },
  });

  // Resolve each cart line to its specific ProductColor row (never trust client price/name).
  // Fall back to the first color only for cart lines that carry no color; a
  // named color that no longer exists must not silently become a different one.
  const resolved = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const color = item.color
      ? product?.colors.find((c) => c.name === item.color)
      : product?.colors[0];
    return { item, product, color };
  });

  for (const { item, product, color } of resolved) {
    if (!product || !product.isActive) {
      return { error: `Sorry, "${item.name}" is no longer available. Please remove it from your cart.` };
    }
    if (!color) {
      return {
        error: `Sorry, "${item.name}" in ${item.color} is no longer available. Please remove it from your cart.`,
      };
    }
    if (color.stock < item.quantity) {
      return { error: `Sorry, "${item.name}" doesn't have enough stock. Please update your cart.` };
    }
  }

  // The cart keeps the price from when an item was added. If it changed
  // since, hand back the current prices instead of charging an amount the
  // customer never saw.
  const priceUpdates: PriceUpdate[] = [];
  for (const { item, product } of resolved) {
    const current = product!.salePrice ?? product!.price;
    if (current !== item.price) {
      priceUpdates.push({ productId: item.productId, color: item.color, price: current });
    }
  }
  if (priceUpdates.length > 0) {
    return {
      error:
        "Some prices in your cart have changed. Your cart has been updated, please check the total and place the order again.",
      priceUpdates,
    };
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

  let order;
  try {
    order = await withOrderNumber((orderNumber) =>
      prisma.$transaction(async (tx) => {
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
              create: orderItems,
            },
          },
          include: { items: true },
        });

        for (const item of orderItems) {
          await decrementStock(tx, item.colorId, item.quantity, item.productName);
        }

        return created;
      })
    );
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return { error: `Sorry, ${error.message} Please update your cart.` };
    }
    throw error;
  }

  // Stock changed, so cached product pages need to pick up the new counts.
  revalidateStorefront();

  if (session?.user?.id && !session.user.email) {
    await prisma.user
      .update({ where: { id: session.user.id }, data: { email: input.email } })
      .catch(() => {}); // another account may already own this email, order still succeeds either way
  }

  after(async () => {
    await sendOrderConfirmationEmail(order).catch((err) =>
      console.error("Order confirmation email failed:", err)
    );
    const recipients = await getOrderNotificationRecipients().catch(() => []);
    await sendAdminNewOrderEmail(recipients, order).catch((err) =>
      console.error("Admin new-order email failed:", err)
    );

    await sendPushToAdmins({
      title: "New Order Received",
      body: `${input.customerName} just placed order ${order.orderNumber} (${formatPrice(subtotal)}).`,
      url: `/admin/orders/${order.id}`,
    }).catch((err) => console.error("New order push failed:", err));

    await notifyLowStock(orderItems.map((i) => i.colorId)).catch((err) =>
      console.error("Low stock push failed:", err)
    );
  });

  return { success: true, orderNumber: order.orderNumber, orderId: order.id };
}
