// Browser-only image helpers shared by the admin product form: the
// pre-upload compression pass and the crop / straighten editor. Every
// export here touches canvas / createImageBitmap, so it must only run on
// the client.

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const HEIC_NAME_RE = /\.hei[cf]$/i;

// Product photos render at aspect-[3/4] with object-cover on the storefront
// (product-card, product-gallery), so that is the crop ratio the admin
// should frame to - what she sees in the editor is what the site shows.
export const PRODUCT_ASPECT = 3 / 4;

const MAX_UPLOAD_WIDTH = 1600;
const JPEG_QUALITY = 0.82;

export function isHeic(file: File) {
  return /^image\/hei[cf]/i.test(file.type) || HEIC_NAME_RE.test(file.name);
}

// True when this file can be decoded onto a <canvas> in this browser, i.e.
// the crop editor can open it. HEIC can't (no browser codec) and goes up
// as-is for server-side conversion instead.
export function isCanvasEditable(file: File) {
  return !isHeic(file) && typeof document !== "undefined";
}

function canvasToJpegFile(canvas: HTMLCanvasElement, sourceName: string, fallback: File): Promise<File> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(fallback);
          return;
        }
        const name = sourceName.replace(/\.[^.]+$/, "") + ".jpg";
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

// Compress in the browser before upload - a phone camera photo is often
// 3-12MB, well over what the server will accept in one request. HEIC files
// are skipped here since most browsers can't decode them either; they go
// up as-is and get converted server-side instead.
export async function compressForUpload(file: File): Promise<File> {
  if (isHeic(file) || !("createImageBitmap" in window)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_UPLOAD_WIDTH / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const out = await canvasToJpegFile(canvas, file.name, file);
    return out.size < file.size ? out : file;
  } catch {
    return file;
  }
}

export type CropArea = { x: number; y: number; width: number; height: number };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("image decode failed")));
    img.src = url;
  });
}

function rotatedBounds(width: number, height: number, radians: number) {
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  return {
    width: cos * width + sin * height,
    height: sin * width + cos * height,
  };
}

// Apply the crop rectangle + rotation react-easy-crop reports, then scale
// the result down to the same 1600px / q0.82 JPEG the plain upload path
// produces. `cropPixels` is in the source image's natural-pixel space.
export async function cropAndCompress(
  file: File,
  cropPixels: CropArea,
  rotation: number
): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const radians = (rotation * Math.PI) / 180;
    const bounds = rotatedBounds(image.width, image.height, radians);

    // Draw the (possibly rotated) image onto a canvas sized to its bounding
    // box, then lift out the crop rect.
    const full = document.createElement("canvas");
    full.width = Math.round(bounds.width);
    full.height = Math.round(bounds.height);
    const fullCtx = full.getContext("2d");
    if (!fullCtx) return file;
    fullCtx.translate(full.width / 2, full.height / 2);
    fullCtx.rotate(radians);
    fullCtx.drawImage(image, -image.width / 2, -image.height / 2);

    const scale = Math.min(1, MAX_UPLOAD_WIDTH / cropPixels.width);
    const outWidth = Math.max(1, Math.round(cropPixels.width * scale));
    const outHeight = Math.max(1, Math.round(cropPixels.height * scale));

    const out = document.createElement("canvas");
    out.width = outWidth;
    out.height = outHeight;
    const outCtx = out.getContext("2d");
    if (!outCtx) return file;
    outCtx.drawImage(
      full,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      outWidth,
      outHeight
    );

    return canvasToJpegFile(out, file.name, file);
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
