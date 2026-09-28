import { ProductForm } from "../product-form";
import { createProduct } from "../actions";
import { getAllPresetTags } from "@/lib/presets";

// Saving converts every new photo to WebP (HEIC conversion is slow), which can
// outlast the default function timeout when many photos are added at once.
export const maxDuration = 60;

export default async function NewProductPage() {
  const presets = await getAllPresetTags();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Add Product</h1>
      <ProductForm action={createProduct} presets={presets} />
    </div>
  );
}
