"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/constants";
import { createManualOrder } from "../actions";

type ColorOption = { id: string; name: string; stock: number };

type ProductOption = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  images: string[];
  colors: ColorOption[];
};

type LineItem = {
  productId: string;
  colorId: string;
  label: string;
  price: number;
  quantity: number;
  maxStock: number;
};

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
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const [selectedColorId, setSelectedColorId] = useState(selectedProduct?.colors[0]?.id ?? "");
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
    if (prefillProductId) {
      const product = products.find((p) => p.id === prefillProductId);
      if (product?.colors[0]) {
        addItem(prefillProductId, product.colors[0].id);
      }
    }
    if (prefillProductName) {
      setNotes((n) => n || `Enquired about: ${prefillProductName}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSelectProduct(productId: string) {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === productId);
    setSelectedColorId(product?.colors[0]?.id ?? "");
  }

  function addItem(productId: string, colorId: string) {
    const product = products.find((p) => p.id === productId);
    const color = product?.colors.find((c) => c.id === colorId);
    if (!product || !color) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.colorId === colorId);
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          colorId: color.id,
          label: `${product.name} — ${color.name}`,
          price: product.salePrice ?? product.price,
          quantity: 1,
          maxStock: color.stock,
        },
      ];
    });
  }

  function updateQuantity(key: string, quantity: number) {
    setItems((prev) =>
      prev.map((i) =>
        `${i.productId}-${i.colorId}` === key
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i
      )
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => `${i.productId}-${i.colorId}` !== key));
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
      items: items.map((i) => ({ productId: i.productId, colorId: i.colorId, quantity: i.quantity })),
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
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <select
              value={selectedProductId}
              onChange={(e) => onSelectProduct(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gold-light bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-maroon"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatPrice(p.salePrice ?? p.price)}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="relative sm:w-48">
            <select
              value={selectedColorId}
              onChange={(e) => setSelectedColorId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gold-light bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-maroon"
            >
              {selectedProduct?.colors.map((c) => (
                <option key={c.id} value={c.id} disabled={c.stock <= 0}>
                  {c.name} {c.stock <= 0 ? "(out of stock)" : `(${c.stock} left)`}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => addItem(selectedProductId, selectedColorId)}
            disabled={!selectedColorId}
            className="rounded-lg bg-maroon px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-50 sm:py-2"
          >
            Add
          </button>
        </div>

        {items.length > 0 && (
          <div className="mt-4 space-y-2">
            {items.map((item) => {
              const key = `${item.productId}-${item.colorId}`;
              return (
                <div key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-ivory px-3 py-2 text-sm">
                  <span className="flex-1 basis-full sm:basis-auto">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-light text-sm active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-light text-sm disabled:opacity-40 active:scale-90"
                      disabled={item.quantity >= item.maxStock}
                    >
                      +
                    </button>
                  </div>
                  <span className="w-20 text-right font-medium">{formatPrice(item.price * item.quantity)}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(key)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
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
