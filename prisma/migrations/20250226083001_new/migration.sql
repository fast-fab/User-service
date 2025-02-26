/*
  Warnings:

  - You are about to drop the column `cost` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `items` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ORDERED', 'DELIVERED', 'RETURNED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cost",
DROP COLUMN "itemId",
DROP COLUMN "items",
DROP COLUMN "qty";

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "status" "STATUS" NOT NULL DEFAULT 'ORDERED',

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Returns" (
    "id" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Status" "STATUS" NOT NULL DEFAULT 'RETURNED',
    "cost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Returns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
