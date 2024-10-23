/*
  Warnings:

  - The primary key for the `ActionOnStack` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ArticleAction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserAction` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ActionOnStack" DROP CONSTRAINT "ActionOnStack_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ActionOnStack_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ArticleAction" DROP CONSTRAINT "ArticleAction_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ArticleAction_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserAction" DROP CONSTRAINT "UserAction_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserAction_pkey" PRIMARY KEY ("id");
