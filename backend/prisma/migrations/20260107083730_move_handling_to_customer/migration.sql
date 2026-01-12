/*
  Warnings:

  - You are about to drop the column `handledAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `handledBy` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "assignedAgent" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "handledAt",
DROP COLUMN "handledBy";
