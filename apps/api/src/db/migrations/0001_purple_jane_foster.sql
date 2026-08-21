ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "supabase_user_id" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_supabase_user_id" ON "users" USING btree ("supabase_user_id") WHERE "users"."deleted_at" IS NULL;