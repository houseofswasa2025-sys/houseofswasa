import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { toSlug } from "@/lib/slug";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 pb-10 sm:py-10">
      <h1 className="font-serif text-2xl font-semibold text-maroon sm:text-3xl">Shop by Category</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3">
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
