CREATE TYPE "GirDirection" AS ENUM ('Long', 'Short', 'Left', 'Right');
ALTER TABLE "Hole" ADD COLUMN "girDirection" "GirDirection";
