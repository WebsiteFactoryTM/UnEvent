-- Add all-time metrics fields to aggregates table
-- Matches Payload migration style (numeric type, nullable with default)
ALTER TABLE "aggregates"
  ADD COLUMN "views" numeric DEFAULT 0,
  ADD COLUMN "impressions7d" numeric DEFAULT 0,
  ADD COLUMN "impressions30d" numeric DEFAULT 0,
  ADD COLUMN "impressions" numeric DEFAULT 0;

