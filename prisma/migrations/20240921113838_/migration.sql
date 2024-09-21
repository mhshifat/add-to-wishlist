/*
  Warnings:

  - Added the required column `styleVariables` to the `Customization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customization" ADD COLUMN     "styleVariables" TEXT NOT NULL;
