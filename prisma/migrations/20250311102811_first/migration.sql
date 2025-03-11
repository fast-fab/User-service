/*
  Warnings:

  - You are about to drop the column `lang` on the `user` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Returns` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Returns" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "lang",
ADD COLUMN     "lat" TEXT;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
