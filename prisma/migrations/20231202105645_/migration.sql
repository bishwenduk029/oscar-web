/*
  Warnings:

  - Added the required column `category` to the `prompts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `prompts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL;
