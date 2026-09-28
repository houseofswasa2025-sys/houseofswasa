"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import convertHeic from "heic-convert";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/require-admin";
import { registerPresets } from "@/lib/presets";
import { RAW_UPLOAD_PREFIX } from "@/lib/upload-limits";

export type ProductFormState = { error?: string } | undefined;

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

function parseList(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).filter(Boolean);
}

class ImageUploadError extends Error {}

const HEIC_NAME_RE = /\.hei[cf]$/i;

async function compressImage(buffer: Buffer, isHeic: boolean): Promise<Buffer> {
  // iPhones default to HEIC, which the sharp build here can't decode (no
  // libheif codec in the prebuilt binary, only the royalty-free AVIF
  // sibling format). Transcode to JPEG first so the rest of the pipeline
  // never needs to know the source format.
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

// Only accept raw uploads the admin just made through /api/admin/upload.
function isRawUploadUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(BLOB_HOST_SUFFIX) &&
      url.pathname.startsWith(`/${RAW_UPLOAD_PREFIX}`)
    );
  } catch {
    return false;
  }
}

async function processRawImage(rawUrl: string): Promise<string> {
  const res = await fetch(rawUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const pathname = new URL(rawUrl).pathname;
  const isHeic =
    /^image\/hei[cf]/i.test(res.headers.get("content-type") ?? "") || HEIC_NAME_RE.test(pathname);
  const compressed = await compressImage(buffer, isHeic);

  const baseName = decodeURIComponent(pathname.split("/").pop() ?? "photo").replace(/\.[^.]+$/, "");
  const blob = await put(`products/${Date.now()}-${baseName}.webp`, compressed, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/webp",
  });
  return blob.url;
}

// Converts the browser's raw uploads to compressed WebP. The raw originals
// are deleted by the caller only after the product save succeeds, so a failed
// save can be retried without the admin re-uploading anything.
async function processUploads(rawUrls: string[]): Promise<string[]> {
  if (rawUrls.some((u) => !isRawUploadUrl(u))) {
    throw new ImageUploadError("One of the photos has an invalid upload link. Please remove it and add it again.");
  }

  const results: string[] = new Array(rawUrls.length);
  let next = 0;
  let failed = false;
  // Small pool: HEIC conversion is memory heavy, so never run all at once.
  async function worker() {
    while (!failed && next < rawUrls.length) {
      const i = next++;
      try {
        results[i] = await processRawImage(rawUrls[i]);
      } catch (error) {
        console.error("Product image processing failed:", rawUrls[i], error);
        failed = true;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, rawUrls.length) }, worker));

  if (failed) {
    await Promise.all(results.filter(Boolean).map((url) => del(url).catch(() => {})));
    throw new ImageUploadError(
      "Couldn't process one of the photos: it may be corrupted or in an unsupported format. Please try a JPEG, PNG, WebP, or HEIC photo."
    );
  }
  return results;
}

// Deletes Blob images that no longer belong to the product, keeping any that
// past orders still show as their thumbnail (OrderItem.image).
async function deleteUnreferencedImages(urls: string[]) {
  if (urls.length === 0) return;
  const referenced = await prisma.orderItem.findMany({
    where: { image: { in: urls } },
    select: { image: true },
    distinct: ["image"],
  });
  const keep = new Set(referenced.map((r) => r.image));
  await Promise.all(urls.filter((url) => !keep.has(url)).map((url) => del(url).catch(() => {})));
}

type ColorRowInput = {
  key: string;
  colorId: string | null;
  name: string;
  stock: number;
  existingImages: string[];
  newUploadUrls: string[];
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
    newUploadUrls: formData.getAll(`colorNewImageUrls_${key}`).map(String).filter(Boolean),
  }));
}

function validateColorRows(rows: ColorRowInput[]): string | null {
  if (rows.length === 0) return "Add at least one color.";
  const names = rows.map((r) => r.name.toLowerCase());
  if (rows.some((r) => !r.name)) return "Every color needs a name.";
  if (new Set(names).size !== names.length) return "Color names must be unique for this product.";
  return null;
}

function validateProductData(data: ReturnType<typeof buildProductData>): string | null {
  if (!data.name.trim()) return "Please enter a product name.";
  if (!Number.isInteger(data.price) || data.price <= 0) return "Price must be a whole number above 0.";
  if (data.salePrice != null && (!Number.isInteger(data.salePrice) || data.salePrice >= data.price)) {
    return "Sale price must be a whole number lower than the price.";
  }
  if (!data.fabric.trim()) return "Please select or add a fabric.";
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
    return "That slug or color name is already used, please make it unique.";
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
  const dataError = validateProductData(data);
  if (dataError) return { error: dataError };

  let uploadedByRow: string[][];
  try {
    const processed = await processUploads(rows.flatMap((r) => r.newUploadUrls));
    let offset = 0;
    uploadedByRow = rows.map((r) => processed.slice(offset, (offset += r.newUploadUrls.length)));
  } catch (error) {
    return { error: error instanceof ImageUploadError ? error.message : "Couldn't process images." };
  }
  const allUploaded = uploadedByRow.flat();
  const rawUploads = rows.flatMap((r) => r.newUploadUrls);

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

  await Promise.all(rawUploads.map((url) => del(url).catch(() => {})));

  await registerPresets({
    categories: data.categories,
    occasions: data.occasions,
    fabric: data.fabric,
    colors: rows.map((r) => r.name),
  });

  revalidatePath("/admin/products");
  revalidateStorefront();
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
  const dataError = validateProductData(data);
  if (dataError) return { error: dataError };

  let uploadedByRow: string[][];
  try {
    const processed = await processUploads(rows.flatMap((r) => r.newUploadUrls));
    let offset = 0;
    uploadedByRow = rows.map((r) => processed.slice(offset, (offset += r.newUploadUrls.length)));
  } catch (error) {
    return { error: error instanceof ImageUploadError ? error.message : "Couldn't process images." };
  }
  const allUploaded = uploadedByRow.flat();
  const rawUploads = rows.flatMap((r) => r.newUploadUrls);

  const ownColorIds = new Set(existingProduct.colors.map((c) => c.id));
  if (rows.some((r) => r.colorId && !ownColorIds.has(r.colorId))) {
    return { error: "This form is out of date. Please reload the page and try again." };
  }

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

  await Promise.all(rawUploads.map((url) => del(url).catch(() => {})));

  await registerPresets({
    categories: data.categories,
    occasions: data.occasions,
    fabric: data.fabric,
    colors: rows.map((r) => r.name),
  });

  // Only remove now-unused Blob images after the DB update has actually succeeded.
  const keptImages = new Set(rows.flatMap((r, i) => [...r.existingImages, ...uploadedByRow[i]]));
  const orphanedImages = [
    ...existingProduct.images.filter((img) => !keptImages.has(img)),
    ...removedColors.flatMap((c) => c.images.filter((img) => !keptImages.has(img))),
  ];
  await deleteUnreferencedImages(orphanedImages);

  revalidatePath("/admin/products");
  revalidateStorefront();
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id: productId }, include: { colors: true } });
  if (product) {
    await prisma.product.delete({ where: { id: productId } });
    const allImages = [...product.images, ...product.colors.flatMap((c) => c.images)];
    await deleteUnreferencedImages([...new Set(allImages)]);
  }
  revalidatePath("/admin/products");
  revalidateStorefront();
}

export async function toggleActive(productId: string, isActive: boolean) {
  await requireAdmin();

  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/admin/products");
  revalidateStorefront();
}
