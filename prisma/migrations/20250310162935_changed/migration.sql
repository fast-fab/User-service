-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_id_fkey" FOREIGN KEY ("id") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
