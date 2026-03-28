-- AlterTable
ALTER TABLE "Team" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "rollNo" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

-- Existing rows: keep access until you revoke in admin.
UPDATE "Team" SET "verified" = true;

-- CreateIndex
CREATE UNIQUE INDEX "Team_rollNo_key" ON "Team"("rollNo");
