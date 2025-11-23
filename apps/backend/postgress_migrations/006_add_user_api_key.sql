ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key_index" varchar;