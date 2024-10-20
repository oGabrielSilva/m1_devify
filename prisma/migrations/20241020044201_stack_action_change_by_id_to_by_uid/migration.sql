/*
  Warnings:

  - The primary key for the `ActionOnStack` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actionById` on the `ActionOnStack` table. All the data in the column will be lost.
  - Added the required column `actionByIud` to the `ActionOnStack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActionOnStack" DROP CONSTRAINT "ActionOnStack_pkey",
DROP COLUMN "actionById",
ADD COLUMN     "actionByIud" INTEGER NOT NULL,
ADD CONSTRAINT "ActionOnStack_pkey" PRIMARY KEY ("actionByIud", "targetStackId");
