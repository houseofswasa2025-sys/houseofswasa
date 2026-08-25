import { prisma } from "@/lib/prisma";
import type { PresetTagType } from "@/generated/prisma/client";

export async function getPresetTags(type: PresetTagType): Promise<string[]> {
  const rows = await prisma.presetTag.findMany({ where: { type }, orderBy: { name: "asc" } });
  return rows.map((r) => r.name);
}

export async function getAllPresetTags() {
  const [categories, occasions, fabrics, colors] = await Promise.all([
    getPresetTags("CATEGORY"),
    getPresetTags("OCCASION"),
    getPresetTags("FABRIC"),
    getPresetTags("COLOR"),
  ]);
  return { categories, occasions, fabrics, colors };
}

/**
 * Whatever category/occasion/fabric/color values a product actually uses get
 * remembered as reusable presets automatically - no separate "save as
 * preset" step. Safe to call on every product save; existing values are
 * skipped via the unique (type, name) constraint.
 */
export async function registerPresets(values: {
  categories: string[];
  occasions: string[];
  fabric: string;
  colors: string[];
}) {
  const rows = [
    ...values.categories.map((name) => ({ type: "CATEGORY" as const, name })),
    ...values.occasions.map((name) => ({ type: "OCCASION" as const, name })),
    ...(values.fabric ? [{ type: "FABRIC" as const, name: values.fabric }] : []),
    ...values.colors.map((name) => ({ type: "COLOR" as const, name })),
  ].filter((r) => r.name.trim().length > 0);

  if (rows.length === 0) return;
  await prisma.presetTag.createMany({ data: rows, skipDuplicates: true });
}
