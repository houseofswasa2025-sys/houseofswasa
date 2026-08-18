"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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

  revalidatePath("/reviews");
  return { success: true };
}
