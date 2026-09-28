"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToAdmins } from "@/lib/push";

// Unauthenticated and fired from every "Order on WhatsApp" tap. Bound the
// stored text, drop clicks during an obvious flood, and send at most one
// admin push per couple of minutes so a busy (or scripted) spell can't turn
// the admin's phone into a notification stream.
const FLOOD_WINDOW_MS = 60 * 1000;
const MAX_CLICKS_PER_WINDOW = 60;
const PUSH_COOLDOWN_MS = 2 * 60 * 1000;

const clip = (value: unknown, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;

export async function logWhatsAppClick(input: { productId?: string; productName?: string; page: string }) {
  const productId = clip(input?.productId, 64);
  const productName = clip(input?.productName, 200);
  const page = clip(input?.page, 100) ?? "unknown";

  const now = Date.now();
  const [lastMinute, lastPushWindow] = await Promise.all([
    prisma.whatsAppClick.count({ where: { createdAt: { gte: new Date(now - FLOOD_WINDOW_MS) } } }),
    prisma.whatsAppClick.count({ where: { createdAt: { gte: new Date(now - PUSH_COOLDOWN_MS) } } }),
  ]).catch(() => [0, 0]);
  if (lastMinute >= MAX_CLICKS_PER_WINDOW) return;

  await prisma.whatsAppClick.create({ data: { productId, productName, page } }).catch(() => {});

  if (lastPushWindow > 0) return;
  after(async () => {
    await sendPushToAdmins({
      title: "WhatsApp Click",
      body: productName
        ? `Someone tapped "Order on WhatsApp" for ${productName}.`
        : "Someone tapped an \"Order on WhatsApp\" link.",
      url: "/admin/whatsapp",
    }).catch((err) => console.error("WhatsApp click push failed:", err));
  });
}
