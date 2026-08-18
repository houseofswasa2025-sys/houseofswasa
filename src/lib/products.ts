import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

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

export function buildProductWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.type) where.type = filters.type;
  if (filters.flag) where[filters.flag] = true;
  if (filters.category) where.categories = { has: filters.category };
  if (filters.fabric) where.fabric = { equals: filters.fabric, mode: "insensitive" };
  if (filters.occasion) where.occasions = { has: filters.occasion };
  if (filters.color) where.colors = { has: filters.color };
  if (filters.inStockOnly) where.stock = { gt: 0 };
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
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}
