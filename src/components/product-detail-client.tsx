"use client";

import { useState } from "react";
import { formatPrice, whatsappLink } from "@/lib/constants";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/product-gallery";
import { WhatsAppTrackedLink } from "@/components/whatsapp-tracked-link";
import type { ProductWithColors } from "@/lib/products";

export function ProductDetailClient({ product }: { product: ProductWithColors }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = product.colors[activeIndex];
  const displayPrice = product.salePrice ?? product.price;
  const images = active?.images.length ? active.images : product.images;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <ProductGallery key={active?.id ?? "default"} images={images} name={`${product.name} — ${active?.name ?? ""}`} />

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
          {active && active.stock > 0 ? (
            <span className="text-green-700">
              In Stock {active.stock < 5 ? `(only ${active.stock} left in ${active.name})` : ""}
            </span>
          ) : (
            <span className="text-red-600">Out of Stock in {active?.name ?? "this color"}</span>
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

        {product.colors.length > 0 && (
          <div className="mt-5">
            <p className="mb-1.5 text-xs font-medium text-foreground/60">
              Color{product.colors.length > 1 ? "s" : ""}: <span className="text-foreground">{active?.name}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  title={c.name}
                  className={`relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all active:scale-90 ${
                    i === activeIndex ? "border-maroon" : "border-gold-light/60"
                  } ${c.stock <= 0 ? "opacity-40" : ""}`}
                  style={{
                    backgroundImage: c.images[0] ? `url(${c.images[0]})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {c.stock <= 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[8px] font-semibold text-white">
                      Sold
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={displayPrice}
            image={images[0] ?? ""}
            color={active?.name}
            stock={active?.stock ?? 0}
          />
        </div>

        <WhatsAppTrackedLink
          productId={product.id}
          productName={product.name}
          page="product-detail"
          href={whatsappLink(
            `Hi! I'd like to order "${product.name}"${active ? ` (${active.name})` : ""} (${formatPrice(displayPrice)}). Link: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product.slug}`
          )}
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
  );
}
