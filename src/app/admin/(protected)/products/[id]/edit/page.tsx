import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../product-form";
import { updateProduct } from "../../actions";
import { getAllPresetTags } from "@/lib/presets";

// Saving converts every new photo to WebP (HEIC conversion is slow), which can
// outlast the default function timeout when many photos are added at once.
export const maxDuration = 60;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, presets] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { colors: { orderBy: { sortOrder: "asc" } } },
    }),
    getAllPresetTags(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-maroon">Edit Product</h1>
      <ProductForm product={product} presets={presets} action={updateProduct.bind(null, product.id)} />
    </div>
  );
}
