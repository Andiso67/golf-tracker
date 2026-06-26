-- AlterTable: Add auth fields to Player
ALTER TABLE "Player" ADD COLUMN "email" TEXT;
ALTER TABLE "Player" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "Player" ADD COLUMN "emailVerified" TIMESTAMP(3);
ALTER TABLE "Player" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "Player" ADD COLUMN "resetPasswordToken" TEXT;
ALTER TABLE "Player" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateTable: VerificationToken
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE INDEX "VerificationToken_email_type_idx" ON "VerificationToken"("email", "type");
