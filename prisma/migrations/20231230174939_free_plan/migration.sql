/*
  Warnings:

  - You are about to drop the column `promptId` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `modelName` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "promptId",
ADD COLUMN     "editsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "modelName" TEXT NOT NULL;
