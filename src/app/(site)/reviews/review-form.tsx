"use client";

import { useActionState, useState } from "react";
import { submitReview } from "./actions";

export function ReviewForm() {
  const [state, formAction, pending] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(5);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        Thank you! Your review has been submitted and will appear after approval.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-gold-light/60 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">Your Name</label>
        <input
          name="name"
          required
          className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium text-foreground/70">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl ${n <= rating ? "text-gold" : "text-foreground/20"}`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">Your Review</label>
        <textarea
          name="text"
          rows={3}
          required
          className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon-dark disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
