-- CreateEnum
CREATE TYPE "PresetTagType" AS ENUM ('CATEGORY', 'OCCASION', 'FABRIC', 'COLOR');

-- CreateTable
CREATE TABLE "PresetTag" (
    "id" TEXT NOT NULL,
    "type" "PresetTagType" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PresetTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresetTag_type_name_key" ON "PresetTag"("type", "name");

-- Seed initial presets from what used to be hardcoded lists, so nothing already in use is lost.
INSERT INTO "PresetTag" ("id", "type", "name") VALUES
  (gen_random_uuid()::text, 'FABRIC', 'Silk'),
  (gen_random_uuid()::text, 'FABRIC', 'Cotton'),
  (gen_random_uuid()::text, 'FABRIC', 'Organza'),
  (gen_random_uuid()::text, 'FABRIC', 'Banarasi'),
  (gen_random_uuid()::text, 'FABRIC', 'Kanjivaram'),
  (gen_random_uuid()::text, 'FABRIC', 'Linen'),
  (gen_random_uuid()::text, 'FABRIC', 'Chiffon'),
  (gen_random_uuid()::text, 'FABRIC', 'Georgette'),
  (gen_random_uuid()::text, 'FABRIC', 'Tissue'),
  (gen_random_uuid()::text, 'CATEGORY', 'Silk Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Cotton Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Linen Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Banarasi Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Kanjivaram Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Organza Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Chiffon Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Georgette Sarees'),
  (gen_random_uuid()::text, 'CATEGORY', 'Party Wear'),
  (gen_random_uuid()::text, 'CATEGORY', 'Wedding Collection'),
  (gen_random_uuid()::text, 'CATEGORY', 'Handloom Collection'),
  (gen_random_uuid()::text, 'CATEGORY', 'Daily Wear'),
  (gen_random_uuid()::text, 'OCCASION', 'Festive Wear'),
  (gen_random_uuid()::text, 'OCCASION', 'Party Wear'),
  (gen_random_uuid()::text, 'OCCASION', 'Office Wear'),
  (gen_random_uuid()::text, 'OCCASION', 'Casual Wear'),
  (gen_random_uuid()::text, 'OCCASION', 'Weddings'),
  (gen_random_uuid()::text, 'COLOR', 'Red'),
  (gen_random_uuid()::text, 'COLOR', 'Maroon'),
  (gen_random_uuid()::text, 'COLOR', 'Pink'),
  (gen_random_uuid()::text, 'COLOR', 'Orange'),
  (gen_random_uuid()::text, 'COLOR', 'Yellow'),
  (gen_random_uuid()::text, 'COLOR', 'Green'),
  (gen_random_uuid()::text, 'COLOR', 'Blue'),
  (gen_random_uuid()::text, 'COLOR', 'Purple'),
  (gen_random_uuid()::text, 'COLOR', 'Black'),
  (gen_random_uuid()::text, 'COLOR', 'White'),
  (gen_random_uuid()::text, 'COLOR', 'Cream'),
  (gen_random_uuid()::text, 'COLOR', 'Gold'),
  (gen_random_uuid()::text, 'COLOR', 'Silver'),
  (gen_random_uuid()::text, 'COLOR', 'Multicolor')
ON CONFLICT ("type", "name") DO NOTHING;
