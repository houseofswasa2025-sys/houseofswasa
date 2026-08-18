"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function setReviewApproval(reviewId: string, approved: boolean) {
  await requireAdmin();

  await prisma.review.update({ where: { id: reviewId }, data: { approved } });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();

  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}
