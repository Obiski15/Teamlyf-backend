/*
  Warnings:

  - The values [ADDED_COMMENTS,UPDATED_COMMENTS,DELETED_COMMENTS,COLLABORATOR_ADDED,COLLABORATOR_DELETED] on the enum `TaskAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProjectAction" AS ENUM ('ADDED_PROJECTS', 'UPDATED_PROJECTS', 'DELETED_PROJECTS', 'COMPLETED_PROJECTS', 'UNCOMPLETED_PROJECTS', 'ADDED_COMMENTS_TO_PROJECTS', 'UPDATED_COMMENTS_TO_PROJECTS', 'DELETED_COMMENTS_TO_PROJECTS', 'PROJECTS_COLLABORATOR_ADDED', 'PROJECTS_COLLABORATOR_DELETED');

-- AlterEnum
BEGIN;
CREATE TYPE "TaskAction_new" AS ENUM ('ADDED_TASKS', 'UPDATED_TASKS', 'DELETED_TASKS', 'COMPLETED_TASKS', 'UNCOMPLETED_TASKS', 'ADDED_COMMENTS_TO_TASKS', 'UPDATED_COMMENTS_TO_TASKS', 'DELETED_COMMENTS_TO_TASKS', 'TASKS_COLLABORATOR_ADDED', 'TASKS_COLLABORATOR_DELETED');
ALTER TABLE "TaskHistory" ALTER COLUMN "action" TYPE "TaskAction_new" USING ("action"::text::"TaskAction_new");
ALTER TYPE "TaskAction" RENAME TO "TaskAction_old";
ALTER TYPE "TaskAction_new" RENAME TO "TaskAction";
DROP TYPE "TaskAction_old";
COMMIT;

-- CreateTable
CREATE TABLE "ProjectHistory" (
    "id" TEXT NOT NULL,
    "action" "ProjectAction" NOT NULL,
    "projectId" TEXT,
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectHistory" ADD CONSTRAINT "ProjectHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectHistory" ADD CONSTRAINT "ProjectHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
