"use client";

import { useActionState, useState } from "react";
import { updateEmail } from "./actions";
import { EmailInput } from "@/components/email-input";

export function AddEmailForm() {
  const [state, formAction, pending] = useActionState(updateEmail, undefined);
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="mt-2">
      <div className="flex gap-2">
        <EmailInput
          name="email"
          value={email}
          onChange={setEmail}
          required
          className="w-full rounded-lg border border-gold-light px-3 py-1.5 text-sm outline-none focus:border-maroon"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-maroon px-3 py-1.5 text-sm font-semibold text-white hover:bg-maroon-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {state?.error && <p className="mt-1 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
