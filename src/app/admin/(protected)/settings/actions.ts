"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateSiteSettings(formData: FormData) {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      instagramUrl: String(formData.get("instagramUrl") || "") || null,
      facebookUrl: String(formData.get("facebookUrl") || "") || null,
      whatsappUrl: String(formData.get("whatsappUrl") || "") || null,
      youtubeUrl: String(formData.get("youtubeUrl") || "") || null,
      pinterestUrl: String(formData.get("pinterestUrl") || "") || null,
      whatsappNumber: String(formData.get("whatsappNumber") || "919652282268"),
      contactEmail: String(formData.get("contactEmail") || "swathi.pisarla98@gmail.com"),
    },
    create: {
      id: 1,
      instagramUrl: String(formData.get("instagramUrl") || "") || null,
      facebookUrl: String(formData.get("facebookUrl") || "") || null,
      whatsappUrl: String(formData.get("whatsappUrl") || "") || null,
      youtubeUrl: String(formData.get("youtubeUrl") || "") || null,
      pinterestUrl: String(formData.get("pinterestUrl") || "") || null,
    },
  });

  revalidatePath("/", "layout");
}
