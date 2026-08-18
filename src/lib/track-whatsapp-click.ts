"use server";

import { prisma } from "@/lib/prisma";

export async function logWhatsAppClick(input: { productId?: string; productName?: string; page: string }) {
  await prisma.whatsAppClick
    .create({
      data: {
        productId: input.productId,
        productName: input.productName,
        page: input.page,
      },
    })
    .catch(() => {});
}
