"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isValidEmail } from "@/lib/validate-email";

export async function updateEmail(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) return { error: "Please log in." };

  const email = String(formData.get("email") || "").trim();
  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== session.user.id) {
    return { error: "This email is already used by another account." };
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { email } });
  revalidatePath("/account");
}
