-- Add all-time metrics fields to aggregates table
ALTER TABLE "aggregates"
  ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "impressions7d" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "impressions30d" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "impressions" INTEGER NOT NULL DEFAULT 0;

