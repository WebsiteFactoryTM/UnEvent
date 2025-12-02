-- Migration: Verify existing users (especially admin accounts)
-- Created: 2025-12-02
-- Description: Sets _verified = true for existing users so they can log in after enabling verify: true
-- 
-- This is useful when enabling email verification on an existing system where users
-- were created before verification was required.

BEGIN;

-- Option 1: Verify a specific user by email (replace with your admin email)
UPDATE "users" 
SET "_verified" = true 
WHERE "email" = 'alex.nedelia@gmail.com'
  AND ("_verified" IS NULL OR "_verified" = false);

-- Option 2: Verify ALL existing users (uncomment if you want to auto-verify everyone)
-- UPDATE "users" 
-- SET "_verified" = true 
-- WHERE "_verified" IS NULL OR "_verified" = false;

COMMIT;

-- Verify the update
SELECT 
  id, 
  email, 
  "_verified" as verified,
  "_verificationtoken" as verification_token
FROM "users" 
WHERE "email" = 'alex.nedelia@gmail.com';

