import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product-grid";

export const metadata: Metadata = { title: "Special Offers" };

export default async function OffersPage() {
  const products = await getProducts({ flag: "isOnSale" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-maroon">Special Offers</h1>
      <p className="mt-1 mb-6 text-sm text-foreground/60">Limited-time discounts on select sarees.</p>
      <ProductGrid products={products} />
    </div>
  );
}
