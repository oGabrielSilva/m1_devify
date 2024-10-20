-- CreateEnum
CREATE TYPE "ActionOnStackType" AS ENUM ('ENABLE', 'DISABLE', 'EDIT');

-- CreateTable
CREATE TABLE "Stack" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" VARCHAR(55) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "metaDescription" VARCHAR(220) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserUid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionOnStack" (
    "actionById" INTEGER NOT NULL,
    "targetStackId" INTEGER NOT NULL,
    "reason" TEXT,
    "details" TEXT,
    "action" "ActionOnStackType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionOnStack_pkey" PRIMARY KEY ("actionById","targetStackId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stack_uid_key" ON "Stack"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Stack_name_key" ON "Stack"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stack_slug_key" ON "Stack"("slug");
