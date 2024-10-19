/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Social` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Social_identifier_key" ON "Social"("identifier");
