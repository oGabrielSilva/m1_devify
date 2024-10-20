-- CreateEnum
CREATE TYPE "UserActionType" AS ENUM ('LOCK', 'UNLOCK', 'ENABLE', 'DISABLE', 'ADD_AUTHORITY', 'REMOVE_AUTHORITY');

-- CreateEnum
CREATE TYPE "Authority" AS ENUM ('COMMON', 'EDITOR', 'HELPER', 'MODERATOR', 'ADMIN', 'ROOT');

-- CreateTable
CREATE TABLE "UserAction" (
    "actionById" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "reason" TEXT,
    "details" TEXT,
    "action" "UserActionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAction_pkey" PRIMARY KEY ("actionById","targetId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "name" VARCHAR(55) NOT NULL,
    "username" VARCHAR(55) NOT NULL,
    "avatarURL" TEXT,
    "avatarFilePath" TEXT,
    "bio" TEXT,
    "password" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "authorities" "Authority"[],
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Social" (
    "id" SERIAL NOT NULL,
    "identifier" VARCHAR(50) NOT NULL,
    "url" TEXT NOT NULL,
    "details" VARCHAR(30),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Social_identifier_key" ON "Social"("identifier");

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
