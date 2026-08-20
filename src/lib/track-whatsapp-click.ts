"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToAdmins } from "@/lib/push";

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

  after(async () => {
    await sendPushToAdmins({
      title: "WhatsApp Click",
      body: input.productName ? `Someone tapped "Order on WhatsApp" for ${input.productName}.` : "Someone tapped an \"Order on WhatsApp\" link.",
      url: "/admin/whatsapp",
    }).catch((err) => console.error("WhatsApp click push failed:", err));
  });
}
