import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = { title: "Customer Reviews" };

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-maroon">Customer Reviews</h1>

      <div className="mt-8 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-gold-light/60 bg-white p-4">
            <p className="text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
            <p className="mt-2 text-sm italic text-foreground/70">&ldquo;{r.text}&rdquo;</p>
            <p className="mt-2 text-xs font-medium text-foreground/50">— {r.name}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-foreground/50">Be the first to leave a review!</p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-maroon">Leave a Review</h2>
        <ReviewForm />
      </div>
    </div>
  );
}
