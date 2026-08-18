import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { toSlug } from "@/lib/slug";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-maroon">Shop by Category</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/categories/${toSlug(cat)}`}
            className="rounded-xl border border-gold-light/60 bg-white p-5 text-center font-medium text-foreground/80 hover:border-maroon hover:text-maroon"
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}
