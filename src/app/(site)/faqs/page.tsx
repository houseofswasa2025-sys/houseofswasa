import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQs" };

const FAQS = [
  {
    q: "What is your Return/Exchange Policy?",
    a: "No Exchange or Return on any orders. Please review product photos and details carefully before ordering.",
  },
  {
    q: "How do you deliver orders?",
    a: "Delivery timelines will be communicated to you once your order is confirmed.",
  },
  {
    q: "What is your Payment method?",
    a: "Cash on Delivery is available. Alternatively, a payment QR code will be sent to your WhatsApp on order confirmation.",
  },
];

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold text-maroon">Frequently Asked Questions</h1>
      <div className="mt-6 space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-xl border border-gold-light/60 bg-white p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:content-none">
              <span className="flex items-center justify-between">
                {f.q}
                <span className="text-maroon transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-2 text-sm text-foreground/70">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
