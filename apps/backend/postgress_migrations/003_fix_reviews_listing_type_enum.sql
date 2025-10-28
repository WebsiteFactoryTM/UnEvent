-- Migration to fix reviews listing_type enum values
-- Update existing singular values to plural values before changing enum

-- Update existing records to use plural forms
UPDATE reviews SET listing_type = 'locations' WHERE listing_type = 'location';
UPDATE reviews SET listing_type = 'events' WHERE listing_type = 'event';
UPDATE reviews SET listing_type = 'services' WHERE listing_type = 'service';

-- Note: Payload will handle the enum alteration after this migration runs
