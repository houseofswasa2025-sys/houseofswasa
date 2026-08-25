import { ProductForm } from "../product-form";
import { createProduct } from "../actions";
import { getAllPresetTags } from "@/lib/presets";

export default async function NewProductPage() {
  const presets = await getAllPresetTags();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Add Product</h1>
      <ProductForm action={createProduct} presets={presets} />
    </div>
  );
}
