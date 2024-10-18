-- CreateEnum
CREATE TYPE "UserActionType" AS ENUM ('LOCK', 'UNLOCK', 'ENABLE', 'DISABLE', 'ADD_AUTHORITY', 'REMOVE_AUTHORITY');

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
CREATE TABLE "Authority" (
    "id" SERIAL NOT NULL,
    "descriptor" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Authority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuthority" (
    "userId" INTEGER NOT NULL,
    "authorityId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" INTEGER NOT NULL,

    CONSTRAINT "UserAuthority_pkey" PRIMARY KEY ("userId","authorityId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "username" VARCHAR(55) NOT NULL,
    "avatarURL" TEXT,
    "avatarFilePath" TEXT,
    "bio" TEXT,
    "password" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
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
CREATE UNIQUE INDEX "Authority_descriptor_key" ON "Authority"("descriptor");

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Authority" ADD CONSTRAINT "Authority_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuthority" ADD CONSTRAINT "UserAuthority_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
