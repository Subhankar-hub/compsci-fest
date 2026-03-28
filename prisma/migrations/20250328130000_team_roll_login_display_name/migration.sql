-- DropUnique: login identity is roll number; "name" holds display name (may repeat).
DROP INDEX IF EXISTS "Team_name_key";

-- Legacy rows: copy former login name into roll number when missing.
UPDATE "Team" SET "rollNo" = "name" WHERE "rollNo" IS NULL;

ALTER TABLE "Team" ALTER COLUMN "rollNo" SET NOT NULL;
