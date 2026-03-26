-- CreateEnum
CREATE TYPE "DepartmentWorkStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "ReportDepartment" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "status" "DepartmentWorkStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReportDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportDepartment_reportId_departmentId_key" ON "ReportDepartment"("reportId", "departmentId");

-- AddForeignKey
ALTER TABLE "ReportDepartment" ADD CONSTRAINT "ReportDepartment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportDepartment" ADD CONSTRAINT "ReportDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
