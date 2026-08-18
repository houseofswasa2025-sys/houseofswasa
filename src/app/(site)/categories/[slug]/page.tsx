import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product-grid";
import { CATEGORIES } from "@/lib/constants";
import { toSlug } from "@/lib/slug";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => toSlug(c) === slug);
  return { title: category ?? "Category" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => toSlug(c) === slug);
  if (!category) notFound();

  const products = await getProducts({ category });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-maroon">{category}</h1>
      <p className="mt-1 mb-6 text-sm text-foreground/60">{products.length} products</p>
      <ProductGrid products={products} />
    </div>
  );
}
