-- Migration: Add email verification fields to users table
-- Created: 2025-12-02
-- Description: Adds _verified and _verificationtoken columns required by PayloadCMS auth.verify: true
-- 
-- These fields are automatically managed by PayloadCMS when auth.verify: true is enabled:
-- - _verified: boolean flag indicating if user's email is verified
-- - _verificationtoken: token sent in verification email

BEGIN;

-- Add _verified column to users table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = '_verified'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "_verified" boolean DEFAULT false;
  END IF;
END $$;

-- Add _verificationtoken column to users table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = '_verificationtoken'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "_verificationtoken" varchar;
  END IF;
END $$;

COMMIT;

-- Optional: Set existing users to verified=true (uncomment if you want to auto-verify existing users)
-- UPDATE "users" SET "_verified" = true WHERE "_verified" IS NULL;

