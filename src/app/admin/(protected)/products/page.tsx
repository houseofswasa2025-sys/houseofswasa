import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import { deleteProduct, toggleActive } from "./actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-maroon">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-dark"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gold-light/60 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-gold-light/60 text-left text-xs uppercase tracking-wide text-foreground/50">
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gold-light/30 last:border-0">
                <td className="flex items-center gap-3 p-3">
                  <div className="relative h-14 w-11 overflow-hidden rounded bg-ivory">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-foreground/50">{p.fabric}</p>
                  </div>
                </td>
                <td className="p-3">
                  {formatPrice(p.salePrice ?? p.price)}
                  {p.salePrice && (
                    <span className="ml-1 text-xs text-foreground/40 line-through">
                      {formatPrice(p.price)}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span className={p.stock <= 0 ? "text-red-600" : p.stock < 5 ? "text-amber-600" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <form action={toggleActive.bind(null, p.id, !p.isActive)}>
                    <button
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.isActive ? "bg-green-100 text-green-700" : "bg-foreground/10 text-foreground/50"
                      }`}
                    >
                      {p.isActive ? "Active" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-maroon hover:underline">
                      Edit
                    </Link>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-foreground/50">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
