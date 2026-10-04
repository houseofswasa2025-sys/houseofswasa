-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "hiddenCategories" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Retire the Chiffon Sarees category
DELETE FROM "PresetTag" WHERE "type" = 'CATEGORY' AND "name" = 'Chiffon Sarees';
UPDATE "Product" SET "categories" = array_remove("categories", 'Chiffon Sarees');
