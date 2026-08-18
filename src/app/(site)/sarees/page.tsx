import type { Metadata } from "next";
import { getProducts, type ProductFilters } from "@/lib/products";
import { ProductFilters as FiltersUI } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { SortSelect } from "@/components/sort-select";

export const metadata: Metadata = { title: "Shop Sarees" };

type SearchParams = Record<string, string | undefined>;

export default async function SareesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const filters: ProductFilters = {
    type: "SAREE",
    category: sp.category,
    fabric: sp.fabric,
    occasion: sp.occasion,
    color: sp.color,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    inStockOnly: sp.inStock === "true",
    search: sp.search,
    sort: sp.sort as ProductFilters["sort"],
  };

  const products = await getProducts(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-maroon">Sarees</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Silk, Cotton, Banarasi, Kanjivaram, Organza & more — handpicked for every occasion.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FiltersUI />
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-foreground/60">{products.length} sarees</p>
            <SortSelect />
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
