"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/constants";
import { createManualOrder } from "../actions";

type ProductOption = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
};

type LineItem = { productId: string; name: string; price: number; quantity: number; maxStock: number };

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

export function ManualOrderForm({
  products,
  prefillProductId,
  prefillProductName,
}: {
  products: ProductOption[];
  prefillProductId?: string;
  prefillProductName?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("CONFIRMED");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const didPrefill = useRef(false);

  useEffect(() => {
    if (didPrefill.current) return;
    didPrefill.current = true;
    if (prefillProductId && products.some((p) => p.id === prefillProductId)) {
      addItem(prefillProductId);
    }
    if (prefillProductName) {
      setNotes((n) => n || `Enquired about: ${prefillProductName}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addItem(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.salePrice ?? product.price,
          quantity: 1,
          maxStock: product.stock,
        },
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) } : i))
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (!customerName.trim() || !phone.trim()) {
      setError("Customer name and phone are required.");
      return;
    }

    setPending(true);
    const result = await createManualOrder({
      customerName,
      phone,
      email: email || undefined,
      addressLine1: addressLine1 || undefined,
      addressLine2: addressLine2 || undefined,
      city: city || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
      notes: notes || undefined,
      status,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/orders");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Items</h2>
        <div className="flex gap-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                {p.name} — {formatPrice(p.salePrice ?? p.price)} {p.stock <= 0 ? "(out of stock)" : `(${p.stock} left)`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addItem(selectedProductId)}
            className="rounded-lg bg-maroon px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Add
          </button>
        </div>

        {items.length > 0 && (
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-2 rounded-lg bg-ivory px-3 py-2 text-sm">
                <span className="flex-1">{item.name}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="h-6 w-6 rounded-full border border-gold-light text-xs"
                  >
                    −
                  </button>
                  <span className="w-5 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="h-6 w-6 rounded-full border border-gold-light text-xs disabled:opacity-40"
                    disabled={item.quantity >= item.maxStock}
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right font-medium">{formatPrice(item.price * item.quantity)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex justify-between border-t border-gold-light/60 pt-2 text-sm font-semibold">
              <span>Total</span>
              <span className="text-maroon">{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gold-light/60 bg-white p-4">
        <h2 className="mb-3 font-semibold text-foreground">Customer</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            placeholder="Full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <input
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
        <input
          placeholder="Address line 1 (optional)"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
          <input
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
          <input
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-3 w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
      </div>

      <div className="rounded-xl border border-gold-light/60 bg-white p-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground/70">Order Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
          className="w-full max-w-xs rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-md active:scale-95 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Order"}
      </button>
    </form>
  );
}
