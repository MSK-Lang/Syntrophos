DROP INDEX IF EXISTS "idx_users_supabase_user_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_users_clerk_user_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "supabase_user_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_user_id";