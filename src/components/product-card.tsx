import Link from "next/link";
import Image from "next/image";
import { formatPrice, whatsappLink } from "@/lib/constants";

type Props = {
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
  fabric: string;
  stock: number;
  isNewArrival?: boolean;
  isOnSale?: boolean;
};

export function ProductCard({
  slug,
  name,
  price,
  salePrice,
  image,
  fabric,
  stock,
  isNewArrival,
  isOnSale,
}: Props) {
  const displayPrice = salePrice ?? price;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const productUrl = `/products/${slug}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gold-light/50 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <Link href={productUrl} className="relative block aspect-[3/4] overflow-hidden bg-ivory">
        {image ? (
          <Image
            src={image}
            alt={name}
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

        {stock <= 0 && (
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

        <a
          href={whatsappLink(`Hi! I'm interested in "${name}" (${formatPrice(displayPrice)}). Is it available?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 rounded-full border border-[#25D366] px-3 py-1.5 text-center text-xs font-semibold text-[#128C4A] transition-transform duration-150 hover:bg-[#25D366]/10 active:scale-95"
        >
          Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
