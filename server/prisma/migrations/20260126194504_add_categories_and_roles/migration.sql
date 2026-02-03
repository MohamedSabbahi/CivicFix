/*
  Warnings:

  - The `status` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The required column `accessSecret` was added to the `Report` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `categoryId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Made the column `photoUrl` on table `Report` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "accessSecret" TEXT NOT NULL,
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ALTER COLUMN "photoUrl" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CITIZEN';

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_categoryId_idx" ON "Report"("categoryId");

-- CreateIndex
CREATE INDEX "Report_latitude_longitude_idx" ON "Report"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Report_title_idx" ON "Report"("title");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
