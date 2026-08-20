import type { Prisma } from "@/generated/prisma/client";

export class InsufficientStockError extends Error {}

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
