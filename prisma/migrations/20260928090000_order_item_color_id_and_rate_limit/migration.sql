-- Additive only: safe to run against a database with live orders.

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "colorId" TEXT;

-- Backfill existing order lines where the color still exists under the same name.
UPDATE "OrderItem" oi
SET "colorId" = pc."id"
FROM "ProductColor" pc
WHERE oi."colorId" IS NULL
  AND oi."productId" = pc."productId"
  AND oi."color" = pc."name";

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");
