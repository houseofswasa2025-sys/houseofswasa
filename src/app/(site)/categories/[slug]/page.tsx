import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product-grid";
import { CATEGORIES } from "@/lib/constants";
import { toSlug } from "@/lib/slug";

// Empty list = nothing prebuilt at deploy, but each page is cached after its
// first visit (ISR) and refreshed by revalidateStorefront().
export function generateStaticParams() {
  return [];
}

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
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10 sm:py-10">
      <h1 className="font-serif text-2xl font-semibold text-maroon sm:text-3xl">{category}</h1>
      <p className="mt-1 mb-4 text-sm text-foreground/60 sm:mb-6">{products.length} products</p>
      <ProductGrid products={products} />
    </div>
  );
}
