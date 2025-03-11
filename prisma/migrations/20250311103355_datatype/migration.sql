/*
  Warnings:

  - The `long` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lat` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "long",
ADD COLUMN     "long" DOUBLE PRECISION,
DROP COLUMN "lat",
ADD COLUMN     "lat" DOUBLE PRECISION;
