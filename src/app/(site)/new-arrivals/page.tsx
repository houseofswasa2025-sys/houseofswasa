import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product-grid";

export const metadata: Metadata = { title: "New Arrivals" };

export default async function NewArrivalsPage() {
  const products = await getProducts({ flag: "isNewArrival", sort: "newest" });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10 sm:py-10">
      <h1 className="font-serif text-2xl font-semibold text-maroon sm:text-3xl">New Arrivals</h1>
      <p className="mt-1 mb-4 text-sm text-foreground/60 sm:mb-6">Our latest saree collection, fresh in.</p>
      <ProductGrid products={products} />
    </div>
  );
}
