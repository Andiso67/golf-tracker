-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName1" TEXT NOT NULL DEFAULT '',
    "lastName2" TEXT NOT NULL DEFAULT '',
    "emailVerified" TIMESTAMP(3),
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Migrate existing auth users from Player to User
INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName1", "lastName2", "emailVerified", "verificationToken", "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt")
SELECT "id", "email", "passwordHash", "firstName", "lastName1", "lastName2", "emailVerified", "verificationToken", "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt"
FROM "Player"
WHERE "email" IS NOT NULL;

-- Drop email unique index from Player
DROP INDEX IF EXISTS "Player_email_key";

-- Remove auth columns from Player
ALTER TABLE "Player" DROP COLUMN "email";
ALTER TABLE "Player" DROP COLUMN "passwordHash";
ALTER TABLE "Player" DROP COLUMN "emailVerified";
ALTER TABLE "Player" DROP COLUMN "verificationToken";
ALTER TABLE "Player" DROP COLUMN "resetPasswordToken";
ALTER TABLE "Player" DROP COLUMN "resetPasswordExpires";

-- Add userId column to Player and link to User
ALTER TABLE "Player" ADD COLUMN "userId" TEXT;
UPDATE "Player" SET "userId" = "id" WHERE "id" IN (SELECT "id" FROM "User");
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
