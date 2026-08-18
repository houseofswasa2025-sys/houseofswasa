"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="mb-6 text-center font-serif text-2xl font-semibold text-maroon">Create Account</h1>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Full Name</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Phone</label>
          <input
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Email (optional)</label>
          <input
            name="email"
            type="email"
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-maroon py-2.5 text-sm font-semibold text-white hover:bg-maroon-dark disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-maroon hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
