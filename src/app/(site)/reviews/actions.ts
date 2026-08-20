"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToAdmins } from "@/lib/push";

export async function submitReview(
  _prevState: { success?: boolean; error?: string } | undefined,
  formData: FormData
) {
  const name = String(formData.get("name") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const rating = Number(formData.get("rating") || 5);

  if (!name || !text) {
    return { error: "Please fill in your name and review." };
  }

  await prisma.review.create({
    data: { name, text, rating: Math.min(5, Math.max(1, rating)) },
  });

  after(async () => {
    await sendPushToAdmins({
      title: "New Review Submitted",
      body: `${name} left a ${rating}-star review, awaiting approval.`,
      url: "/admin/reviews",
    }).catch((err) => console.error("New review push failed:", err));
  });

  revalidatePath("/reviews");
  return { success: true };
}
