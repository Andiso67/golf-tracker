-- AlterTable
ALTER TABLE "User" ADD COLUMN "sessionToken" TEXT;
CREATE UNIQUE INDEX "User_sessionToken_key" ON "User"("sessionToken");
CREATE INDEX "User_sessionToken_idx" ON "User"("sessionToken");
