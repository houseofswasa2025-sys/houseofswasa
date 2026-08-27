import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product-grid";

export const metadata: Metadata = { title: "Best Sellers" };

export default async function BestSellersPage() {
  const products = await getProducts({ flag: "isBestSeller" });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10 sm:py-10">
      <h1 className="font-serif text-2xl font-semibold text-maroon sm:text-3xl">Best Sellers</h1>
      <p className="mt-1 mb-4 text-sm text-foreground/60 sm:mb-6">Our most loved sarees, picked by you.</p>
      <ProductGrid products={products} />
    </div>
  );
}
