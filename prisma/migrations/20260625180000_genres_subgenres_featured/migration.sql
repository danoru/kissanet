-- Move genre/subgenre to multi-value arrays, and add the face-out flag.

-- 1. Add the new columns (arrays default to empty, featured to false).
ALTER TABLE "Album" ADD COLUMN "genres" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Album" ADD COLUMN "subgenres" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Album" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- 2. Backfill: carry existing single values into the arrays (lowercased to
--    match the genre taxonomy). Blank/null values become empty arrays.
UPDATE "Album"
  SET "genres" = ARRAY[lower("genre")]
  WHERE "genre" IS NOT NULL AND btrim("genre") <> '';
UPDATE "Album"
  SET "subgenres" = ARRAY[lower("subgenre")]
  WHERE "subgenre" IS NOT NULL AND btrim("subgenre") <> '';

-- 3. Drop the old single-value columns.
ALTER TABLE "Album" DROP COLUMN "genre";
ALTER TABLE "Album" DROP COLUMN "subgenre";
