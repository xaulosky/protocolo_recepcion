-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "buzonBoxId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_buzonBoxId_key" ON "Conversation"("buzonBoxId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buzonBoxId_fkey" FOREIGN KEY ("buzonBoxId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
