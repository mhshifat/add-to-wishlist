/*
  Warnings:

  - Added the required column `customerId` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "customerId" TEXT NOT NULL;
