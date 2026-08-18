"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";

function parseList(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).filter(Boolean);
}

async function uploadImages(formData: FormData): Promise<string[]> {
  const files = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const blob = await put(`products/${Date.now()}-${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      return blob.url;
    })
  );
  return uploaded;
}

function buildProductData(formData: FormData) {
  const name = String(formData.get("name") || "");
  const price = Number(formData.get("price"));
  const salePriceRaw = formData.get("salePrice");
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null;

  return {
    name,
    slug: toSlug(String(formData.get("slug") || name)),
    description: String(formData.get("description") || ""),
    type: String(formData.get("type") || "SAREE") as "SAREE" | "DRESS_MATERIAL",
    price,
    salePrice: salePrice && salePrice > 0 ? salePrice : null,
    fabric: String(formData.get("fabric") || ""),
    categories: parseList(formData, "categories"),
    occasions: parseList(formData, "occasions"),
    colors: parseList(formData, "colors"),
    stock: Number(formData.get("stock") || 0),
    isNewArrival: formData.get("isNewArrival") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isOnSale: formData.get("isOnSale") === "on",
    isActive: formData.get("isActive") !== "off",
  };
}

export async function createProduct(formData: FormData) {
  const newImages = await uploadImages(formData);
  const keptExisting = parseList(formData, "existingImages");
  const data = buildProductData(formData);

  await prisma.product.create({
    data: { ...data, images: [...keptExisting, ...newImages] },
  });

  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const newImages = await uploadImages(formData);
  const keptExisting = parseList(formData, "existingImages");
  const data = buildProductData(formData);

  const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
  const removedImages = (existingProduct?.images || []).filter((img) => !keptExisting.includes(img));
  await Promise.all(removedImages.map((url) => del(url).catch(() => {})));

  await prisma.product.update({
    where: { id: productId },
    data: { ...data, images: [...keptExisting, ...newImages] },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/sarees");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product) {
    await Promise.all(product.images.map((url) => del(url).catch(() => {})));
    await prisma.product.delete({ where: { id: productId } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
}

export async function toggleActive(productId: string, isActive: boolean) {
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
}
