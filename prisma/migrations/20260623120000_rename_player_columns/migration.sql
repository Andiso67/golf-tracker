-- Rename Player.name to firstName, add lastName1 and lastName2
ALTER TABLE "Player" RENAME COLUMN "name" TO "firstName";
ALTER TABLE "Player" ADD COLUMN "lastName1" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Player" ADD COLUMN "lastName2" TEXT NOT NULL DEFAULT '';
