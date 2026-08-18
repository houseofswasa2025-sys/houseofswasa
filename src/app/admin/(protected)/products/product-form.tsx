"use client";

import { useState } from "react";
import Image from "next/image";
import { CATEGORIES, FABRICS, OCCASIONS, COLORS } from "@/lib/constants";
import type { Product } from "@/generated/prisma/client";

type Props = {
  product?: Product;
  action: (formData: FormData) => Promise<void>;
};

function CheckboxGroup({
  name,
  options,
  defaultValues,
}: {
  name: string;
  options: readonly string[];
  defaultValues: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-1.5 rounded-full border border-gold-light px-3 py-1 text-xs has-[:checked]:border-maroon has-[:checked]:bg-maroon has-[:checked]:text-white"
        >
          <input
            type="checkbox"
            name={name}
            value={opt}
            defaultChecked={defaultValues.includes(opt)}
            className="hidden"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function ProductForm({ product, action }: Props) {
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        await action(formData);
        setPending(false);
      }}
      className="max-w-3xl space-y-6"
    >
      {existingImages.map((url) => (
        <input key={url} type="hidden" name="existingImages" value={url} />
      ))}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Name</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">
            Slug (leave blank to auto-generate)
          </label>
          <input
            name="slug"
            defaultValue={product?.slug}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">Description</label>
        <textarea
          name="description"
          rows={3}
          required
          defaultValue={product?.description}
          className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Type</label>
          <select
            name="type"
            defaultValue={product?.type ?? "SAREE"}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          >
            <option value="SAREE">Saree</option>
            <option value="DRESS_MATERIAL">Dress Material</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Price (₹)</label>
          <input
            name="price"
            type="number"
            min={0}
            required
            defaultValue={product?.price}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Sale Price (₹)</label>
          <input
            name="salePrice"
            type="number"
            min={0}
            defaultValue={product?.salePrice ?? undefined}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Stock</label>
          <input
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={product?.stock ?? 0}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">Fabric</label>
        <input
          name="fabric"
          list="fabric-options"
          required
          defaultValue={product?.fabric}
          className="w-full max-w-xs rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
        <datalist id="fabric-options">
          {FABRICS.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground/70">Categories</p>
        <CheckboxGroup name="categories" options={CATEGORIES} defaultValues={product?.categories ?? []} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground/70">Occasions</p>
        <CheckboxGroup name="occasions" options={OCCASIONS} defaultValues={product?.occasions ?? []} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground/70">Colors</p>
        <CheckboxGroup name="colors" options={COLORS} defaultValues={product?.colors ?? []} />
      </div>

      <div className="flex flex-wrap gap-4">
        {[
          ["isNewArrival", "New Arrival"],
          ["isBestSeller", "Best Seller"],
          ["isOnSale", "On Sale"],
          ["isActive", "Active (visible on site)"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              name={key}
              defaultChecked={product ? Boolean(product[key as keyof Product]) : key === "isActive"}
            />
            {label}
          </label>
        ))}
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground/70">Images</p>
        {existingImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {existingImages.map((url) => (
              <div key={url} className="relative h-24 w-20 overflow-hidden rounded-lg border border-gold-light">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setExistingImages((imgs) => imgs.filter((i) => i !== url))}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          name="newImages"
          multiple
          accept="image/*"
          className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-maroon file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white hover:bg-maroon-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : product ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
