-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "isProrated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proratedNote" TEXT;

