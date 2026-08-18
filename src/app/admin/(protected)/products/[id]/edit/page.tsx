import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../product-form";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-maroon">Edit Product</h1>
      <ProductForm product={product} action={updateProduct.bind(null, product.id)} />
    </div>
  );
}
