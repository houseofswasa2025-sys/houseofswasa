import { prisma } from "@/lib/prisma";
import type { Prisma, Product as PrismaProduct, ProductColor } from "@/generated/prisma/client";

export type ProductWithColors = PrismaProduct & { colors: ProductColor[] };
export type { ProductColor };

export type ProductFilters = {
  category?: string;
  fabric?: string;
  occasion?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  type?: "SAREE" | "DRESS_MATERIAL";
  flag?: "isNewArrival" | "isBestSeller" | "isOnSale";
  sort?: "price-asc" | "price-desc" | "newest";
};

const colorsOrder = { orderBy: { sortOrder: "asc" as const } };

export function buildProductWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.type) where.type = filters.type;
  if (filters.flag) where[filters.flag] = true;
  if (filters.category) where.categories = { has: filters.category };
  if (filters.fabric) where.fabric = { equals: filters.fabric, mode: "insensitive" };
  if (filters.occasion) where.occasions = { has: filters.occasion };

  const colorConditions: Prisma.ProductColorWhereInput[] = [];
  if (filters.color) colorConditions.push({ name: filters.color });
  if (filters.inStockOnly) colorConditions.push({ stock: { gt: 0 } });
  if (colorConditions.length > 0) {
    where.colors = { some: { AND: colorConditions } };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { fabric: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  // Price range is applied in getProducts against the effective price
  // (sale price when set), which Prisma can't express as a column filter.

  return where;
}

export function effectivePrice(product: { price: number; salePrice: number | null }) {
  return product.salePrice ?? product.price;
}

export async function getProducts(filters: ProductFilters = {}) {
  const products = await prisma.product.findMany({
    where: buildProductWhere(filters),
    orderBy: { createdAt: "desc" },
    include: { colors: colorsOrder },
  });

  // Filter and sort on what the customer actually pays. The catalog is small
  // enough that doing this in memory is cheaper than a computed column.
  const { minPrice, maxPrice, sort } = filters;
  const inRange = products.filter((p) => {
    const price = effectivePrice(p);
    return (minPrice == null || price >= minPrice) && (maxPrice == null || price <= maxPrice);
  });
  if (sort === "price-asc") inRange.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  if (sort === "price-desc") inRange.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  return inRange;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { colors: colorsOrder },
  });
}

export function totalStock(product: { colors: { stock: number }[] }) {
  return product.colors.reduce((sum, c) => sum + c.stock, 0);
}

export function coverImage(product: { images: string[]; colors: { images: string[] }[] }) {
  return product.colors[0]?.images[0] ?? product.images[0] ?? "";
}
