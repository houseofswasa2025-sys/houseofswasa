"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function adminLoginAction(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string } | undefined> {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { phone, password, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid phone or password." };
    }
    throw error;
  }
}
