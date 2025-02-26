/*
  Warnings:

  - Added the required column `totalCost` to the `Returns` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Returns" ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL;
