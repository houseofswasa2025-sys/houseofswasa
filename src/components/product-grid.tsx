import { ProductCard } from "@/components/product-card";
import { RevealGroup, RevealItem } from "@/components/reveal";
import type { ProductWithColors } from "@/lib/products";

export function ProductGrid({ products }: { products: ProductWithColors[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-foreground/60">No sarees found</p>
        <p className="mt-1 text-sm text-foreground/40">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <RevealGroup className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" stagger={0.06}>
      {products.map((p) => (
        <RevealItem key={p.id}>
          <ProductCard
            id={p.id}
            slug={p.slug}
            name={p.name}
            price={p.price}
            salePrice={p.salePrice}
            fabric={p.fabric}
            colors={p.colors}
            isNewArrival={p.isNewArrival}
            isOnSale={p.isOnSale}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
