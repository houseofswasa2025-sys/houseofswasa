import { prisma } from "@/lib/prisma";
import { sendPushToAdmins } from "@/lib/push";
import type { Prisma } from "@/generated/prisma/client";

export class InsufficientStockError extends Error {}

const LOW_STOCK_THRESHOLD = 5;

type Tx = Prisma.TransactionClient;

/**
 * Atomically decrements a color's stock, guarded by the current stock level
 * in the same SQL statement (WHERE stock >= quantity). This avoids the
 * check-then-act race where two concurrent transactions both read enough
 * stock before either commits its decrement, overselling the color.
 */
export async function decrementStock(tx: Tx, colorId: string, quantity: number, label: string) {
  const result = await tx.productColor.updateMany({
    where: { id: colorId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });
  if (result.count === 0) {
    throw new InsufficientStockError(`"${label}" doesn't have enough stock right now.`);
  }
}

/**
 * Checks the current stock of the given colors (call after a decrement
 * commits) and pushes one batched admin notification for any that are now
 * low or out of stock.
 */
export async function notifyLowStock(colorIds: string[]) {
  const colors = await prisma.productColor.findMany({
    where: { id: { in: colorIds }, stock: { lte: LOW_STOCK_THRESHOLD } },
    select: { stock: true, name: true, product: { select: { name: true } } },
  });
  if (colors.length === 0) return;

  const lines = colors.map(
    (c) => `${c.product.name} (${c.name}): ${c.stock <= 0 ? "out of stock" : `${c.stock} left`}`
  );

  await sendPushToAdmins({
    title: colors.some((c) => c.stock <= 0) ? "Product Out of Stock" : "Low Stock Alert",
    body: lines.join(", "),
    url: "/admin/products",
  });
}
