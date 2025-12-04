-- Migration: Add metrics fields to metrics_daily
-- Created: 2025-12-04
-- Description: Adds impressions, messages, and participations columns to metrics_daily table
-- 
-- These fields track additional engagement metrics for listings:
-- - impressions: Number of times listing was shown in feeds/search
-- - messages: Number of new message threads started from listing
-- - participations: Number of participations (e.g. clicked "Participă")

BEGIN;

ALTER TABLE "metrics_daily"
  ADD COLUMN IF NOT EXISTS "impressions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "messages" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "participations" INTEGER NOT NULL DEFAULT 0;

COMMIT;

-- Verify the update
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'metrics_daily' 
  AND column_name IN ('impressions', 'messages', 'participations');

