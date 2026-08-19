import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product-grid";
import { ProductDetailClient } from "@/components/product-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const related = (
    await getProducts({ category: product.categories[0], type: product.type })
  ).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-xs text-foreground/50">
        <Link href="/sarees" className="hover:text-maroon">Sarees</Link> / {product.name}
      </nav>

      <ProductDetailClient product={product} />

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-4 font-serif text-xl font-semibold text-maroon">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
