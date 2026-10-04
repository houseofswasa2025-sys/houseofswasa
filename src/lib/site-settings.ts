import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import type { SiteSettings } from "@/generated/prisma/client";

// Mirrors the column defaults in schema.prisma, used until the admin first
// saves settings (updateSiteSettings upserts the row).
const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  instagramUrl: null,
  facebookUrl: null,
  whatsappUrl: null,
  youtubeUrl: null,
  pinterestUrl: null,
  whatsappNumber: "919652282268",
  contactEmail: "swathi.pisarla98@gmail.com",
  orderNotificationEmails: [],
  hiddenCategories: [],
};

// Read-only on purpose: this runs on every storefront render, and the old
// upsert turned each page view into a database write.
export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return settings ?? DEFAULT_SETTINGS;
}

export async function getOrderNotificationRecipients(): Promise<string[]> {
  const [admins, settings] = await Promise.all([
    prisma.user.findMany({ where: { role: "ADMIN", email: { not: null } }, select: { email: true } }),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { orderNotificationEmails: true } }),
  ]);

  const emails = [
    ...admins.map((a) => a.email!),
    ...(settings?.orderNotificationEmails ?? []),
  ];

  return [...new Set(emails)];
}

// Categories the admin has not hidden; drives every storefront category list.
export async function getVisibleCategories(): Promise<string[]> {
  const { hiddenCategories } = await getSiteSettings();
  return CATEGORIES.filter((c) => !hiddenCategories.includes(c));
}
