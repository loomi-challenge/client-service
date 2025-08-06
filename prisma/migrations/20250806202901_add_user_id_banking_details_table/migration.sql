/*
  Warnings:

  - You are about to drop the column `bankingDetailsId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `BankingDetails` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `BankingDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_bankingDetailsId_fkey";

-- DropIndex
DROP INDEX "public"."User_bankingDetailsId_key";

-- AlterTable
ALTER TABLE "public"."BankingDetails" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "bankingDetailsId";

-- CreateIndex
CREATE UNIQUE INDEX "BankingDetails_userId_key" ON "public"."BankingDetails"("userId");

-- AddForeignKey
ALTER TABLE "public"."BankingDetails" ADD CONSTRAINT "BankingDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
