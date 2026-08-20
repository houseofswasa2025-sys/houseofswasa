"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function updateSiteSettings(
  _prevState: { success: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const orderNotificationEmails = String(formData.get("orderNotificationEmails") || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      instagramUrl: String(formData.get("instagramUrl") || "") || null,
      facebookUrl: String(formData.get("facebookUrl") || "") || null,
      whatsappUrl: String(formData.get("whatsappUrl") || "") || null,
      youtubeUrl: String(formData.get("youtubeUrl") || "") || null,
      pinterestUrl: String(formData.get("pinterestUrl") || "") || null,
      whatsappNumber: String(formData.get("whatsappNumber") || "919652282268"),
      contactEmail: String(formData.get("contactEmail") || "swathi.pisarla98@gmail.com"),
      orderNotificationEmails,
    },
    create: {
      id: 1,
      instagramUrl: String(formData.get("instagramUrl") || "") || null,
      facebookUrl: String(formData.get("facebookUrl") || "") || null,
      whatsappUrl: String(formData.get("whatsappUrl") || "") || null,
      youtubeUrl: String(formData.get("youtubeUrl") || "") || null,
      pinterestUrl: String(formData.get("pinterestUrl") || "") || null,
      orderNotificationEmails,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const session = await requireAdmin();

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { userId: session.user.id, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    create: {
      userId: session.user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  });
}

export async function deleteSubscription(endpoint: string) {
  const session = await requireAdmin();
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: session.user.id } });
}

export async function isSubscribed(endpoint: string) {
  const session = await requireAdmin();
  const sub = await prisma.pushSubscription.findFirst({ where: { endpoint, userId: session.user.id } });
  return !!sub;
}
