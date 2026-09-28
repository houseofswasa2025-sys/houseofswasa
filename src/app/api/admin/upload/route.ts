import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";
import { RAW_UPLOAD_PREFIX, MAX_RAW_UPLOAD_BYTES } from "@/lib/upload-limits";

// Issues short-lived tokens so the admin's browser can upload product photos
// straight to Vercel Blob. Photos used to travel inside the product-save
// Server Action request, and Vercel rejects any function request body over
// 4.5MB, so saving a product with several photos failed intermittently.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();
        if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
        if (!pathname.startsWith(RAW_UPLOAD_PREFIX)) throw new Error("Invalid upload path");

        return {
          allowedContentTypes: ["image/*"],
          maximumSizeInBytes: MAX_RAW_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
