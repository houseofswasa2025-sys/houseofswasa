import { prisma } from "@/lib/prisma";
import { setReviewApproval, deleteReview } from "./actions";
import { AdminActionButton } from "@/components/admin/action-button";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Reviews</h1>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-gold-light/60 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{r.name}</p>
              <span className="text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            <p className="mt-1 text-sm text-foreground/70">{r.text}</p>
            <div className="mt-3 flex gap-2">
              <AdminActionButton
                action={() => setReviewApproval(r.id, !r.approved)}
                pendingLabel="..."
                className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${
                  r.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {r.approved ? "Approved" : "Pending — Approve"}
              </AdminActionButton>
              <AdminActionButton
                action={() => deleteReview(r.id)}
                pendingLabel="Deleting..."
                confirmMessage={`Delete this review from "${r.name}"? This can't be undone.`}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-60"
              >
                Delete
              </AdminActionButton>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-foreground/50">No reviews yet.</p>}
      </div>
    </div>
  );
}
