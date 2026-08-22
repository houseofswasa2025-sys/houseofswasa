"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import convertHeic from "heic-convert";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/require-admin";

export type ProductFormState = { error?: string } | undefined;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function parseList(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).filter(Boolean);
}

class ImageUploadError extends Error {}

const HEIC_NAME_RE = /\.hei[cf]$/i;

async function compressImage(file: File): Promise<Buffer> {
  let buffer = Buffer.from(await file.arrayBuffer());

  // iPhones default to HEIC, which the sharp build here can't decode (no
  // libheif codec in the prebuilt binary, only the royalty-free AVIF
  // sibling format). Transcode to JPEG first so the rest of the pipeline
  // never needs to know the source format.
  const isHeic = /^image\/hei[cf]/i.test(file.type) || HEIC_NAME_RE.test(file.name);
  if (isHeic) {
    const jpeg = await convertHeic({ buffer, format: "JPEG", quality: 0.92 });
    buffer = Buffer.from(jpeg);
  }

  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  for (const file of files) {
    if (!file.type.startsWith("image/") && !HEIC_NAME_RE.test(file.name)) {
      throw new ImageUploadError(`"${file.name}" isn't an image file.`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new ImageUploadError(`"${file.name}" is larger than 8MB, please compress it and try again.`);
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
  } catch {
    await Promise.all(uploaded.map((url) => del(url).catch(() => {})));
    throw new ImageUploadError(`Couldn't upload one of the images: the file may be corrupted or in an unsupported format. Please try a JPEG, PNG, WebP, or HEIC photo.`);
  }

  return uploaded;
}

type ColorRowInput = {
  key: string;
  colorId: string | null;
  name: string;
  stock: number;
  existingImages: string[];
  newFiles: File[];
};

function parseColorRows(formData: FormData): ColorRowInput[] {
  const rowKeys = formData.getAll("colorRowKeys").map(String);
  const colorIds = formData.getAll("colorIds").map(String);
  const names = formData.getAll("colorNames").map(String);
  const stocks = formData.getAll("colorStocks").map(String);

  return rowKeys.map((key, i) => ({
    key,
    colorId: colorIds[i] || null,
    name: (names[i] ?? "").trim(),
    stock: Math.max(0, Math.floor(Number(stocks[i]) || 0)),
    existingImages: formData.getAll(`colorExistingImages_${key}`).map(String).filter(Boolean),
    newFiles: formData
      .getAll(`colorNewImages_${key}`)
      .filter((f): f is File => f instanceof File && f.size > 0),
  }));
}

function validateColorRows(rows: ColorRowInput[]): string | null {
  if (rows.length === 0) return "Add at least one color.";
  const names = rows.map((r) => r.name.toLowerCase());
  if (rows.some((r) => !r.name)) return "Every color needs a name.";
  if (new Set(names).size !== names.length) return "Color names must be unique for this product.";
  return null;
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
    isNewArrival: formData.get("isNewArrival") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isOnSale: formData.get("isOnSale") === "on",
    isActive: formData.get("isActive") !== "off",
  };
}

function friendlySaveError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "That slug or color name is already used — please make it unique.";
  }
  return "Couldn't save the product. Please try again.";
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const rows = parseColorRows(formData);
  const validationError = validateColorRows(rows);
  if (validationError) return { error: validationError };

  const data = buildProductData(formData);

  let uploadedByRow: string[][];
  try {
    uploadedByRow = await Promise.all(rows.map((r) => uploadFiles(r.newFiles)));
  } catch (error) {
    return { error: error instanceof ImageUploadError ? error.message : "Couldn't upload images." };
  }
  const allUploaded = uploadedByRow.flat();

  try {
    await prisma.product.create({
      data: {
        ...data,
        images: uploadedByRow[0] ?? [],
        colors: {
          create: rows.map((row, i) => ({
            name: row.name,
            stock: row.stock,
            images: [...row.existingImages, ...uploadedByRow[i]],
            sortOrder: i,
          })),
        },
      },
    });
  } catch (error) {
    await Promise.all(allUploaded.map((url) => del(url).catch(() => {})));
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

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { colors: true },
  });
  if (!existingProduct) return { error: "This product no longer exists." };

  const rows = parseColorRows(formData);
  const validationError = validateColorRows(rows);
  if (validationError) return { error: validationError };

  const data = buildProductData(formData);

  let uploadedByRow: string[][];
  try {
    uploadedByRow = await Promise.all(rows.map((r) => uploadFiles(r.newFiles)));
  } catch (error) {
    return { error: error instanceof ImageUploadError ? error.message : "Couldn't upload images." };
  }
  const allUploaded = uploadedByRow.flat();

  const submittedColorIds = new Set(rows.map((r) => r.colorId).filter(Boolean));
  const removedColors = existingProduct.colors.filter((c) => !submittedColorIds.has(c.id));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: productId }, data });

      for (const color of removedColors) {
        await tx.productColor.delete({ where: { id: color.id } });
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const images = [...row.existingImages, ...uploadedByRow[i]];
        if (row.colorId) {
          await tx.productColor.update({
            where: { id: row.colorId },
            data: { name: row.name, stock: row.stock, images, sortOrder: i },
          });
        } else {
          await tx.productColor.create({
            data: { productId, name: row.name, stock: row.stock, images, sortOrder: i },
          });
        }
      }
    });
  } catch (error) {
    await Promise.all(allUploaded.map((url) => del(url).catch(() => {})));
    return { error: friendlySaveError(error) };
  }

  // Only remove now-unused Blob images after the DB update has actually succeeded.
  const keptImages = new Set(rows.flatMap((r, i) => [...r.existingImages, ...uploadedByRow[i]]));
  const orphanedImages = [
    ...existingProduct.images.filter((img) => !keptImages.has(img)),
    ...removedColors.flatMap((c) => c.images.filter((img) => !keptImages.has(img))),
  ];
  await Promise.all(orphanedImages.map((url) => del(url).catch(() => {})));

  revalidatePath("/admin/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/sarees");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id: productId }, include: { colors: true } });
  if (product) {
    await prisma.product.delete({ where: { id: productId } });
    const allImages = [...product.images, ...product.colors.flatMap((c) => c.images)];
    await Promise.all(allImages.map((url) => del(url).catch(() => {})));
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
