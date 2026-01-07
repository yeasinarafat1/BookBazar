CREATE TYPE "public"."roles_enum" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "users_table" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."roles_enum";--> statement-breakpoint
ALTER TABLE "users_table" ALTER COLUMN "role" SET DATA TYPE "public"."roles_enum" USING "role"::"public"."roles_enum";