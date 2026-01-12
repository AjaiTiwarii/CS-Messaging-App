-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "priorityReason" TEXT,
ADD COLUMN     "priorityScore" INTEGER NOT NULL DEFAULT 0;
