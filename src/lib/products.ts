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
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = filters.minPrice;
    if (filters.maxPrice != null) where.price.lte = filters.maxPrice;
  }

  return where;
}

export function buildOrderBy(sort?: ProductFilters["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getProducts(filters: ProductFilters = {}) {
  return prisma.product.findMany({
    where: buildProductWhere(filters),
    orderBy: buildOrderBy(filters.sort),
    include: { colors: colorsOrder },
  });
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
