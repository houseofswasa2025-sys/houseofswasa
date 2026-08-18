"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/require-admin";

export type ProductFormState = { error?: string } | undefined;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function parseList(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).filter(Boolean);
}

async function compressImage(file: File): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

class ImageUploadError extends Error {}

async function uploadImages(formData: FormData): Promise<string[]> {
  const files = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new ImageUploadError(`"${file.name}" isn't an image file.`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new ImageUploadError(`"${file.name}" is larger than 8MB — please compress it and try again.`);
    }
  }

  const uploaded: string[] = [];
  try {
    for (const file of files) {
      const compressed = await compressImage(file);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const blob = await put(`products/${Date.now()}-${baseName}.webp`, compressed, {
        access: "public",
        addRandomSuffix: true,
        contentType: "image/webp",
      });
      uploaded.push(blob.url);
    }
  } catch (error) {
    // Best-effort cleanup of whatever did make it to Blob before the failure.
    await Promise.all(uploaded.map((url) => del(url).catch(() => {})));
    throw new ImageUploadError(
      `Couldn't upload "${files[uploaded.length]?.name ?? "an image"}" — please check your connection and try again.`
    );
  }

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

function friendlySaveError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "That slug is already used by another product — please choose a different one.";
  }
  return "Couldn't save the product. Please try again.";
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  let newImages: string[];
  try {
    newImages = await uploadImages(formData);
  } catch (error) {
    return { error: error instanceof ImageUploadError ? error.message : "Couldn't upload images." };
  }

  const keptExisting = parseList(formData, "existingImages");
  const data = buildProductData(formData);

  try {
    await prisma.product.create({
      data: { ...data, images: [...keptExisting, ...newImages] },
    });
  } catch (error) {
    await Promise.all(newImages.map((url) => del(url).catch(() => {})));
    return { error: friendlySaveError(error) };
  }

  revalidatePath("/admin/products");
  revalidatePath("/sarees");
  redirect("/admin/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  let newImages: string[];
  try {
    newImages = await uploadImages(formData);
  } catch (error) {
    return { error: error instanceof ImageUploadError ? error.message : "Couldn't upload images." };
  }

  const keptExisting = parseList(formData, "existingImages");
  const data = buildProductData(formData);

  const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    await Promise.all(newImages.map((url) => del(url).catch(() => {})));
    return { error: "This product no longer exists." };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { ...data, images: [...keptExisting, ...newImages] },
    });
  } catch (error) {
    await Promise.all(newImages.map((url) => del(url).catch(() => {})));
    return { error: friendlySaveError(error) };
  }

  // Only remove the now-unused old images from Blob after the DB update has
  // actually succeeded, so a failed save never leaves the product pointing
  // at deleted files.
  const removedImages = existingProduct.images.filter((img) => !keptExisting.includes(img));
  await Promise.all(removedImages.map((url) => del(url).catch(() => {})));

  revalidatePath("/admin/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/sarees");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product) {
    await prisma.product.delete({ where: { id: productId } });
    await Promise.all(product.images.map((url) => del(url).catch(() => {})));
  }
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
}

export async function toggleActive(productId: string, isActive: boolean) {
  await requireAdmin();

  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/admin/products");
  revalidatePath("/sarees");
}
