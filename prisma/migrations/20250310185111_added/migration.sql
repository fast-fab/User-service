/*
  Warnings:

  - Added the required column `qty` to the `Returns` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Returns" ADD COLUMN     "qty" INTEGER NOT NULL;
