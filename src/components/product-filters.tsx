"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, FABRICS, OCCASIONS, COLORS } from "@/lib/constants";

const PRICE_RANGES = [
  { label: "Under ₹1,500", min: 0, max: 1500 },
  { label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
  { label: "₹3,000 – ₹6,000", min: 3000, max: 6000 },
  { label: "Above ₹6,000", min: 6000, max: undefined },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gold-light/50 py-4">
      <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = {
    category: searchParams.get("category") ?? "",
    fabric: searchParams.get("fabric") ?? "",
    occasion: searchParams.get("occasion") ?? "",
    color: searchParams.get("color") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    inStock: searchParams.get("inStock") ?? "",
  };

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggle(key: string, value: string) {
    setParam(key, current[key as keyof typeof current] === value ? "" : value);
  }

  function clearAll() {
    router.push(pathname);
  }

  const activeCount = Object.values(current).filter(Boolean).length;

  const body = (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-serif text-lg font-semibold text-maroon">Filters</p>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-maroon hover:underline">
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Price">
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="radio"
                name="price"
                checked={current.minPrice === String(r.min) && current.maxPrice === (r.max ? String(r.max) : "")}
                onChange={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("minPrice", String(r.min));
                  if (r.max) params.set("maxPrice", String(r.max));
                  else params.delete("maxPrice");
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
              {r.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => toggle("category", c)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                current.category === c ? "border-maroon bg-maroon text-white" : "border-gold-light text-foreground/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fabric">
        <div className="flex flex-wrap gap-1.5">
          {FABRICS.map((f) => (
            <button
              key={f}
              onClick={() => toggle("fabric", f)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                current.fabric === f ? "border-maroon bg-maroon text-white" : "border-gold-light text-foreground/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Occasion">
        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              onClick={() => toggle("occasion", o)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                current.occasion === o ? "border-maroon bg-maroon text-white" : "border-gold-light text-foreground/70"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => toggle("color", c)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                current.color === c ? "border-maroon bg-maroon text-white" : "border-gold-light text-foreground/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterSection>

      <div className="pt-4">
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={current.inStock === "true"}
            onChange={(e) => setParam("inStock", e.target.checked ? "true" : "")}
          />
          In stock only
        </label>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-maroon px-4 py-2 text-sm font-medium text-maroon"
        >
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 lg:block">{body}</aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-4">
            <button onClick={() => setOpen(false)} className="mb-2 text-sm text-foreground/60">
              ✕ Close
            </button>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
