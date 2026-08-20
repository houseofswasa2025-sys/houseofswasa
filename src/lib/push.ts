import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { CONTACT } from "@/lib/constants";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(`mailto:${CONTACT.email}`, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string };

export async function sendPushToAdmins(payload: PushPayload) {
  if (!ensureConfigured()) return;

  const subs = await prisma.pushSubscription.findMany({ where: { user: { role: "ADMIN" } } });
  if (subs.length === 0) return;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error("Push notification failed:", error);
        }
      }
    })
  );
}
