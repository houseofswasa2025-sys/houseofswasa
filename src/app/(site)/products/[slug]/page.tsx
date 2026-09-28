import { notFound } from "next/navigation";
import Link from "next/link";
import { coverImage, effectivePrice, getProductBySlug, getProducts, totalStock } from "@/lib/products";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { ProductGrid } from "@/components/product-grid";
import { ProductDetailClient } from "@/components/product-detail-client";

// Empty list = nothing prebuilt at deploy, but each page is cached after its
// first visit (ISR) and refreshed by revalidateStorefront().
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) return { title: "Product" };

  const description = product.description.slice(0, 160);
  const image = coverImage(product);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const related = (
    await getProducts({ category: product.categories[0], type: product.type })
  ).filter((p) => p.id !== product.id).slice(0, 4);

  // Product structured data so Google can show price and availability.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [...new Set([...product.colors.flatMap((c) => c.images), ...product.images])].slice(0, 6),
    category: product.categories[0],
    material: product.fabric,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "INR",
      price: effectivePrice(product),
      availability: totalStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-10 sm:py-8">
      <nav className="mb-4 text-xs text-foreground/50">
        <Link href="/sarees" className="hover:text-maroon">Sarees</Link> / {product.name}
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient product={product} />

      {related.length > 0 && (
        <div className="mt-10 sm:mt-14">
          <h2 className="mb-4 font-serif text-xl font-semibold text-maroon">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
