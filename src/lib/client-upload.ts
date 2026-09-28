// Browser-side direct upload of admin product photos to Vercel Blob (token
// issued by /api/admin/upload). Each photo is its own request, so no single
// request can hit Vercel's 4.5MB function body limit.

import { upload } from "@vercel/blob/client";
import { RAW_UPLOAD_PREFIX } from "@/lib/upload-limits";
import { isHeic } from "@/lib/client-image";

const ATTEMPTS = 3;

function uploadPathname(file: File) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "photo.jpg";
  return `${RAW_UPLOAD_PREFIX}${safe}`;
}

export async function uploadProductImage(file: File): Promise<string> {
  const contentType = file.type || (isHeic(file) ? "image/heic" : "image/jpeg");
  let lastError: unknown;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const blob = await upload(uploadPathname(file), file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType,
        multipart: file.size > 5 * 1024 * 1024,
      });
      return blob.url;
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  throw lastError;
}

// Runs `fn` over `items` with at most `limit` in flight. Every item is
// attempted even if some fail; returns how many failed.
export async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  let failures = 0;
  async function worker() {
    while (next < items.length) {
      const item = items[next++];
      try {
        await fn(item);
      } catch (error) {
        console.error("Upload failed:", error);
        failures++;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return failures;
}
