"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES, FABRICS, OCCASIONS, COLORS } from "@/lib/constants";
import type { Product } from "@/generated/prisma/client";
import type { ProductFormState } from "./actions";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type Props = {
  product?: Product;
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
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

type StagedFile = { file: File; id: string; previewUrl: string };

function StagedImagePicker({ staged, setStaged }: { staged: StagedFile[]; setStaged: (fn: (s: StagedFile[]) => StagedFile[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState("");

  function syncInputFiles(files: StagedFile[]) {
    const dt = new DataTransfer();
    files.forEach((s) => dt.items.add(s.file));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFileError("");

    const accepted: StagedFile[] = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setFileError(`"${file.name}" isn't an image file — skipped.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setFileError(`"${file.name}" is larger than 8MB — skipped.`);
        continue;
      }
      accepted.push({ file, id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`, previewUrl: URL.createObjectURL(file) });
    }

    setStaged((prev) => {
      const next = [...prev, ...accepted];
      syncInputFiles(next);
      return next;
    });
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const removed = prev.find((s) => s.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = prev.filter((s) => s.id !== id);
      syncInputFiles(next);
      return next;
    });
  }

  useEffect(() => {
    return () => {
      staged.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {staged.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {staged.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-24 w-20 overflow-hidden rounded-lg border-2 border-gold"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.previewUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[9px] font-medium text-white">
                New
              </span>
              <button
                type="button"
                onClick={() => removeStaged(s.id)}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white transition-transform active:scale-90"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        name="newImages"
        multiple
        accept="image/*"
        onChange={handlePick}
        className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-maroon file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
      />
      <p className="mt-1 text-xs text-foreground/50">JPG, PNG or WebP, up to 8MB each. Images are compressed automatically.</p>

      <AnimatePresence>
        {fileError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-xs text-red-600"
          >
            {fileError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductForm({ product, action }: Props) {
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
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
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white transition-transform active:scale-90"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <StagedImagePicker staged={staged} setStaged={setStaged} />
        {existingImages.length === 0 && staged.length === 0 && (
          <p className="mt-2 text-xs text-amber-600">
            No images yet — the product will show a placeholder on the site until you add one.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-maroon-dark hover:shadow-md active:scale-95 disabled:opacity-60"
        >
          {pending ? "Saving..." : product ? "Save Changes" : "Create Product"}
        </button>

        <AnimatePresence>
          {state?.error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium text-red-600"
            >
              {state.error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
