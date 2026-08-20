"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, whatsappLink, CONTACT } from "@/lib/constants";
import { placeOrder } from "./actions";
import { EmailInput } from "@/components/email-input";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clear = useCartStore((s) => s.clear);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: session?.user?.name ?? "",
    phone: session?.user?.phone ?? "",
    email: session?.user?.email ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-lg font-medium text-foreground/70">Your cart is empty</p>
        <Link
          href="/sarees"
          className="mt-4 inline-block rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white hover:bg-maroon-dark"
        >
          Shop Sarees
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    const result = await placeOrder({
      ...form,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        color: i.color,
      })),
    });

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    clear();
    router.push(`/checkout/confirmation?order=${result.orderNumber}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-maroon">Checkout</h1>

      {!session && (
        <p className="mb-4 rounded-lg bg-ivory p-3 text-sm text-foreground/70">
          <Link href="/login?redirect=/checkout" className="font-medium text-maroon hover:underline">
            Log in
          </Link>{" "}
          for faster checkout, or continue as guest below.
        </p>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">Full Name</label>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">Phone</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Email</label>
            <EmailInput
              value={form.email}
              onChange={(email) => setForm({ ...form, email })}
              required
              className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Address Line 1</label>
            <input
              required
              value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Address Line 2 (optional)</label>
            <input
              value={form.addressLine2}
              onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
              className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">State</label>
              <input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/70">Pincode</label>
              <input
                required
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Order Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>

          <div className="rounded-lg border border-gold-light bg-ivory p-3 text-sm">
            <p className="font-medium text-foreground">Payment Method</p>
            <p className="mt-1 text-foreground/60">Cash on Delivery. A payment QR code (if needed) will be sent via WhatsApp.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-maroon py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {pending ? "Placing Order..." : "Place Order (Cash on Delivery)"}
          </button>
        </form>

        <div className="rounded-xl border border-gold-light/60 bg-white p-4 lg:sticky lg:top-24 lg:h-fit">
          <h2 className="mb-3 font-semibold text-foreground">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex justify-between text-sm">
                <span className="text-foreground/70">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-gold-light/60 pt-3 text-sm font-semibold">
            <span>Total</span>
            <span className="text-maroon">{formatPrice(totalPrice)}</span>
          </div>
          <a
            href={whatsappLink("Hi! I have a question about placing my order.", CONTACT.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-full border border-[#25D366] py-2 text-center text-xs font-semibold text-[#128C4A] hover:bg-[#25D366]/10"
          >
            Need help? Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
