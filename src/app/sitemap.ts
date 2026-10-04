import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getVisibleCategories } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/constants";
import { toSlug } from "@/lib/slug";

// Rebuilt at most hourly; new products show up without a redeploy.
export const revalidate = 3600;

const STATIC_PATHS = [
  "",
  "/sarees",
  "/new-arrivals",
  "/best-sellers",
  "/offers",
  "/categories",
  "/reviews",
  "/about",
  "/contact",
  "/faqs",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getVisibleCategories();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...categories.map((c) => ({ url: `${SITE_URL}/categories/${toSlug(c)}` })),
    ...products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
