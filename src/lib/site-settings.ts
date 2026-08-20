import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return settings;
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
