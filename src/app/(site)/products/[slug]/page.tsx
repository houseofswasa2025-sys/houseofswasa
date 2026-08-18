import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/products";
import { formatPrice, whatsappLink } from "@/lib/constants";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGrid } from "@/components/product-grid";
import { ProductGallery } from "@/components/product-gallery";
import { WhatsAppTrackedLink } from "@/components/whatsapp-tracked-link";

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

  const displayPrice = product.salePrice ?? product.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-xs text-foreground/50">
        <Link href="/sarees" className="hover:text-maroon">Sarees</Link> / {product.name}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/50">{product.fabric}</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-semibold text-maroon">{formatPrice(displayPrice)}</span>
            {product.salePrice && (
              <span className="text-base text-foreground/40 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-700">In Stock {product.stock < 5 ? `(only ${product.stock} left)` : ""}</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </p>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/70">
            {product.description}
          </p>

          {product.occasions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.occasions.map((o) => (
                <span key={o} className="rounded-full bg-ivory px-2.5 py-1 text-xs text-foreground/60">
                  {o}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={displayPrice}
              image={product.images[0] ?? ""}
              colors={product.colors}
              stock={product.stock}
            />
          </div>

          <WhatsAppTrackedLink
            productId={product.id}
            productName={product.name}
            page="product-detail"
            href={whatsappLink(`Hi! I'd like to order "${product.name}" (${formatPrice(displayPrice)}). Link: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product.slug}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366] px-5 py-2.5 text-sm font-semibold text-[#128C4A] transition-transform duration-150 hover:bg-[#25D366]/10 active:scale-95"
          >
            Order on WhatsApp
          </WhatsAppTrackedLink>

          <p className="mt-4 text-xs text-foreground/50">
            No exchange or return. Cash on Delivery available. Payment QR sent via WhatsApp on confirmation.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-4 font-serif text-xl font-semibold text-maroon">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
