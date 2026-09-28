import { Prisma } from "@/generated/prisma/client";

// HOS + YYMMDD + 4 random digits, e.g. HOS2609281234. The old scheme (last 8
// digits of Date.now()) repeated every ~28 hours and collided on orders
// placed in the same millisecond.
export function generateOrderNumber(now = new Date()) {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `HOS${ymd}${rand}`;
}

export function isOrderNumberCollision(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return false;
  return JSON.stringify(error.meta ?? {}).includes("orderNumber");
}

// Runs `create` with a fresh order number, retrying on the rare collision.
export async function withOrderNumber<T>(create: (orderNumber: string) => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await create(generateOrderNumber());
    } catch (error) {
      if (attempt >= 5 || !isOrderNumberCollision(error)) throw error;
    }
  }
}
