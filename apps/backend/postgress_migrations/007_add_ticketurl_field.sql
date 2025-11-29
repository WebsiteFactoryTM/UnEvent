-- Add ticket_url field to events table
-- This allows events to have a URL where users can purchase tickets

BEGIN;

-- Add ticket_url column to events table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'ticket_url'
  ) THEN
    ALTER TABLE "events" ADD COLUMN "ticket_url" varchar;
  END IF;
END $$;

-- Add version_ticket_url column to _events_v version table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = '_events_v' AND column_name = 'version_ticket_url'
  ) THEN
    ALTER TABLE "_events_v" ADD COLUMN "version_ticket_url" varchar;
  END IF;
END $$;

COMMIT;

