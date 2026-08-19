"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, whatsappLink } from "@/lib/constants";
import { QuickAddButton } from "@/components/quick-add-button";
import { WhatsAppTrackedLink } from "@/components/whatsapp-tracked-link";
import type { ProductColor } from "@/lib/products";

type Props = {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  fabric: string;
  colors: ProductColor[];
  isNewArrival?: boolean;
  isOnSale?: boolean;
};

export function ProductCard({
  id,
  slug,
  name,
  price,
  salePrice,
  fabric,
  colors,
  isNewArrival,
  isOnSale,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = colors[activeIndex];
  const totalStock = colors.reduce((sum, c) => sum + c.stock, 0);
  const displayPrice = salePrice ?? price;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const productUrl = `/products/${slug}`;
  const image = active?.images[0] ?? "";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gold-light/50 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <Link href={productUrl} className="relative block aspect-[3/4] overflow-hidden bg-ivory">
        {image ? (
          <Image
            src={image}
            alt={`${name} — ${active.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground/30">No Image</div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isNewArrival && (
            <span className="rounded-full bg-maroon px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              New
            </span>
          )}
          {isOnSale && discount > 0 && (
            <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {discount}% Off
            </span>
          )}
        </div>

        {totalStock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[11px] uppercase tracking-wide text-foreground/50">{fabric}</p>
        <Link href={productUrl} className="line-clamp-2 text-sm font-medium text-foreground hover:text-maroon">
          {name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-maroon">{formatPrice(displayPrice)}</span>
          {salePrice && (
            <span className="text-xs text-foreground/40 line-through">{formatPrice(price)}</span>
          )}
        </div>

        {colors.length > 1 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {colors.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveIndex(i);
                }}
                title={c.name}
                aria-label={c.name}
                className={`h-5 w-5 rounded-full border-2 transition-transform ${
                  i === activeIndex ? "scale-110 border-maroon" : "border-white ring-1 ring-gold-light"
                } ${c.stock <= 0 ? "opacity-30" : ""}`}
                style={{ backgroundImage: c.images[0] ? `url(${c.images[0]})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <QuickAddButton
            productId={id}
            slug={slug}
            name={name}
            price={displayPrice}
            image={image}
            color={active?.name}
            stock={active?.stock ?? 0}
          />

          <WhatsAppTrackedLink
            productId={id}
            productName={name}
            page="product-card"
            href={whatsappLink(`Hi! I'm interested in "${name}" (${active?.name ?? ""}, ${formatPrice(displayPrice)}). Is it available?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 block rounded-full border border-[#25D366] px-3 py-1.5 text-center text-xs font-semibold text-[#128C4A] transition-transform duration-150 hover:bg-[#25D366]/10 active:scale-95"
          >
            Order on WhatsApp
          </WhatsAppTrackedLink>
        </div>
      </div>
    </div>
  );
}
