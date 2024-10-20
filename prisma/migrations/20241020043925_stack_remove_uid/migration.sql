/*
  Warnings:

  - You are about to drop the column `uid` on the `Stack` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Stack_uid_key";

-- AlterTable
ALTER TABLE "Stack" DROP COLUMN "uid";
