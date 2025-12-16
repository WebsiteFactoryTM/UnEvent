ALTER TABLE "events" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
ALTER TABLE "_events_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
ALTER TABLE "locations" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
ALTER TABLE "_locations_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
ALTER TABLE "services" ALTER COLUMN "last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
ALTER TABLE "_services_v" ALTER COLUMN "version_last_viewed_at" SET DEFAULT '2025-12-16T12:04:12.229Z';
ALTER TABLE "listing_types" ADD COLUMN "is_public" boolean DEFAULT false;
