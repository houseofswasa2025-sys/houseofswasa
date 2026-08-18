import { prisma } from "@/lib/prisma";
import { ManualOrderForm } from "./manual-order-form";

export default async function NewManualOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; productName?: string }>;
}) {
  const { productId, productName } = await searchParams;

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, salePrice: true, stock: true, images: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-maroon">Log a WhatsApp Order</h1>
      <p className="mb-6 text-sm text-foreground/60">
        For a sale you closed over WhatsApp or in person — this keeps stock and your order list in
        sync just like a website order.
      </p>
      <ManualOrderForm products={products} prefillProductId={productId} prefillProductName={productName} />
    </div>
  );
}
