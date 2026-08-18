"use client";

import { useActionState } from "react";
import Image from "next/image";
import { adminLoginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLoginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gold-light bg-white p-8 shadow-md">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/images/icon-192.png"
            alt="House of Swasa"
            width={56}
            height={56}
            className="rounded-full"
          />
          <h1 className="mt-3 font-serif text-xl font-semibold text-maroon">Admin Login</h1>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Email</label>
            <input
              name="identifier"
              type="email"
              required
              autoFocus
              className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
              placeholder="houseofswasa2025@gmail.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon-dark disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
