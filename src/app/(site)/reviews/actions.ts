"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToAdmins } from "@/lib/push";

// Reviews are unauthenticated and each one pings the admin's phone, so cap
// how many can arrive in a short window (checked in the DB, so it holds
// across serverless instances).
const RECENT_WINDOW_MS = 10 * 60 * 1000;
const MAX_RECENT_REVIEWS = 10;
const MAX_PENDING_REVIEWS = 100;

export async function submitReview(
  _prevState: { success?: boolean; error?: string } | undefined,
  formData: FormData
) {
  const name = String(formData.get("name") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const rating = Math.round(Number(formData.get("rating") || 5));

  if (!name || !text) {
    return { error: "Please fill in your name and review." };
  }
  if (name.length > 80) {
    return { error: "Please keep your name under 80 characters." };
  }
  if (text.length > 2000) {
    return { error: "Please keep your review under 2000 characters." };
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Please pick a rating from 1 to 5 stars." };
  }

  const [recent, pending] = await Promise.all([
    prisma.review.count({ where: { createdAt: { gte: new Date(Date.now() - RECENT_WINDOW_MS) } } }),
    prisma.review.count({ where: { approved: false } }),
  ]);
  if (recent >= MAX_RECENT_REVIEWS || pending >= MAX_PENDING_REVIEWS) {
    return { error: "We're receiving a lot of reviews right now. Please try again in a little while." };
  }

  await prisma.review.create({
    data: { name, text, rating },
  });

  after(async () => {
    await sendPushToAdmins({
      title: "New Review Submitted",
      body: `${name} left a ${rating}-star review, awaiting approval.`,
      url: "/admin/reviews",
    }).catch((err) => console.error("New review push failed:", err));
  });

  // New reviews start unapproved, so no public page changes until the admin
  // approves one (which revalidates the storefront).
  return { success: true };
}
