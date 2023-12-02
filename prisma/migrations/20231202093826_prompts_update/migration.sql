/*
  Warnings:

  - You are about to drop the column `stripe_current_period_end` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_customer_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_price_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_subscription_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Plan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_planId_fkey";

-- DropIndex
DROP INDEX "Subscription_orderId_key";

-- DropIndex
DROP INDEX "Subscription_planId_lemonSqueezyId_idx";

-- DropIndex
DROP INDEX "users_stripe_customer_id_key";

-- DropIndex
DROP INDEX "users_stripe_subscription_id_key";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "promptId" TEXT,
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "planId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripe_current_period_end",
DROP COLUMN "stripe_customer_id",
DROP COLUMN "stripe_price_id",
DROP COLUMN "stripe_subscription_id";

-- DropTable
DROP TABLE "Plan";

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "prompts_id_key" ON "prompts"("id");

-- CreateIndex
CREATE INDEX "Subscription_lemonSqueezyId_idx" ON "Subscription"("lemonSqueezyId");
