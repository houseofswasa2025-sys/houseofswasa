"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES, FABRICS, OCCASIONS, COLORS } from "@/lib/constants";
import { Combobox } from "@/components/combobox";
import type { Product, ProductColor } from "@/generated/prisma/client";
import type { ProductFormState } from "./actions";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 9.5 * 1024 * 1024;
const HEIC_NAME_RE = /\.hei[cf]$/i;

function isHeic(file: File) {
  return /^image\/hei[cf]/i.test(file.type) || HEIC_NAME_RE.test(file.name);
}

// Compress in the browser before upload - a phone camera photo is often
// 3-12MB, well over what the server will accept in one request. HEIC files
// are skipped here since most browsers can't decode them either; they go
// up as-is and get converted server-side instead.
async function compressForUpload(file: File): Promise<File> {
  if (isHeic(file) || !("createImageBitmap" in window)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

type ProductWithColors = Product & { colors: ProductColor[] };

type Props = {
  product?: ProductWithColors;
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

type ColorRowState = {
  key: string;
  colorId: string | null;
  name: string;
  stock: number;
  existingImages: string[];
  staged: StagedFile[];
};

function newRow(): ColorRowState {
  return {
    key: `new-${Date.now()}-${Math.random()}`,
    colorId: null,
    name: "",
    stock: 0,
    existingImages: [],
    staged: [],
  };
}

function ColorRowEditor({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: ColorRowState;
  index: number;
  onChange: (row: ColorRowState) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState("");
  const [compressing, setCompressing] = useState(false);

  function syncInputFiles(files: StagedFile[]) {
    const dt = new DataTransfer();
    files.forEach((s) => dt.items.add(s.file));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFileError("");

    const candidates: File[] = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/") && !HEIC_NAME_RE.test(file.name)) {
        setFileError(`"${file.name}" isn't an image file, skipped.`);
        continue;
      }
      if (isHeic(file) && file.size > MAX_IMAGE_BYTES) {
        setFileError(`"${file.name}" is larger than 8MB, skipped.`);
        continue;
      }
      candidates.push(file);
    }

    if (candidates.length === 0) return;

    setCompressing(true);
    const compressed = await Promise.all(candidates.map(compressForUpload));
    setCompressing(false);

    const accepted: StagedFile[] = compressed.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
    }));

    const next = [...row.staged, ...accepted];
    syncInputFiles(next);
    onChange({ ...row, staged: next });
  }

  function removeStaged(id: string) {
    const removed = row.staged.find((s) => s.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    const next = row.staged.filter((s) => s.id !== id);
    syncInputFiles(next);
    onChange({ ...row, staged: next });
  }

  useEffect(() => {
    return () => {
      row.staged.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl border border-gold-light/60 bg-ivory/40 p-4">
      <input type="hidden" name="colorRowKeys" value={row.key} />
      <input type="hidden" name="colorIds" value={row.colorId ?? ""} />
      {row.existingImages.map((url) => (
        <input key={url} type="hidden" name={`colorExistingImages_${row.key}`} value={url} />
      ))}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-foreground/60">Color name</label>
          <Combobox
            name="colorNames"
            options={COLORS}
            required
            value={row.name}
            onChange={(name) => onChange({ ...row, name })}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
            placeholder="e.g. Maroon"
          />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs font-medium text-foreground/60">Stock</label>
          <input
            name="colorStocks"
            type="number"
            min={0}
            required
            value={row.stock}
            onChange={(e) => onChange({ ...row, stock: Number(e.target.value) })}
            className="w-full rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="mb-0.5 text-xs font-medium text-red-600 hover:underline"
        >
          Remove color
        </button>
      </div>

      <div className="mt-3">
        {(row.existingImages.length > 0 || row.staged.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-3">
            {row.existingImages.map((url) => (
              <div key={url} className="relative h-24 w-20 overflow-hidden rounded-lg border border-gold-light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange({ ...row, existingImages: row.existingImages.filter((i) => i !== url) })}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white transition-transform active:scale-90"
                >
                  ✕
                </button>
              </div>
            ))}
            {row.staged.map((s) => (
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
          name={`colorNewImages_${row.key}`}
          multiple
          accept="image/*"
          disabled={compressing}
          onChange={handlePick}
          className="block w-full text-xs text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-maroon file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white disabled:opacity-60"
        />
        {compressing && <p className="mt-1 text-xs text-foreground/50">Compressing photo(s)...</p>}
        {!compressing && row.existingImages.length === 0 && row.staged.length === 0 && (
          <p className="mt-1 text-xs text-amber-600">No photo yet for this color.</p>
        )}
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
    </div>
  );
}

export function ProductForm({ product, action }: Props) {
  const [rows, setRows] = useState<ColorRowState[]>(() =>
    product && product.colors.length > 0
      ? product.colors.map((c) => ({
          key: c.id,
          colorId: c.id,
          name: c.name,
          stock: c.stock,
          existingImages: c.images,
          staged: [],
        }))
      : [newRow()]
  );
  const [fabric, setFabric] = useState(product?.fabric ?? "");
  const [state, formAction, pending] = useActionState(action, undefined);

  function updateRow(index: number, next: ColorRowState) {
    setRows((prev) => prev.map((r, i) => (i === index ? next : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Type</label>
          <div className="relative">
            <select
              name="type"
              defaultValue={product?.type ?? "SAREE"}
              className="w-full appearance-none rounded-lg border border-gold-light bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-maroon"
            >
              <option value="SAREE">Saree</option>
              <option value="DRESS_MATERIAL">Dress Material</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
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
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">Fabric</label>
        <Combobox
          name="fabric"
          options={FABRICS}
          required
          value={fabric}
          onChange={setFabric}
          className="w-full max-w-xs rounded-lg border border-gold-light px-3 py-2 text-sm outline-none focus:border-maroon"
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground/70">Categories</p>
        <CheckboxGroup name="categories" options={CATEGORIES} defaultValues={product?.categories ?? []} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground/70">Occasions</p>
        <CheckboxGroup name="occasions" options={OCCASIONS} defaultValues={product?.occasions ?? []} />
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
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground/70">Colors, stock &amp; photos</p>
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, newRow()])}
            className="rounded-full border border-maroon px-3 py-1 text-xs font-semibold text-maroon transition-transform active:scale-95"
          >
            + Add Color
          </button>
        </div>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <ColorRowEditor
              key={row.key}
              row={row}
              index={i}
              onChange={(next) => updateRow(i, next)}
              onRemove={() => removeRow(i)}
            />
          ))}
        </div>
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
