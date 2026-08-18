"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const identifier = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/account");

  try {
    await signIn("credentials", { identifier, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid phone or password." };
    }
    throw error;
  }
}
