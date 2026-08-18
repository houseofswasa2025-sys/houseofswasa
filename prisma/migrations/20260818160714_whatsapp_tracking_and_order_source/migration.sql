-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WEBSITE', 'WHATSAPP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'WEBSITE';

-- CreateTable
CREATE TABLE "WhatsAppClick" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "page" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsAppClick_createdAt_idx" ON "WhatsAppClick"("createdAt");
