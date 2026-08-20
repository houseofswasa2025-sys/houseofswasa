-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "orderNotificationEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];
