-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "clientId" DROP NOT NULL,
ALTER COLUMN "employeeId" DROP NOT NULL,
ALTER COLUMN "managerId" DROP NOT NULL;
