"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { isValidEmail } from "@/lib/validate-email";

export async function registerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/account");

  if (!name || !phone || password.length < 8) {
    return { error: "Please fill all required fields. Password must be at least 8 characters." };
  }
  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return { error: "An account with this phone number already exists." };
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, phone, email, passwordHash },
  });

  try {
    await signIn("credentials", { identifier: phone, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in." };
    }
    throw error;
  }
}
