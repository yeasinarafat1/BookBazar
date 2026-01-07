CREATE TYPE "public"."profile_verification_status" AS ENUM('verified', 'unverified');--> statement-breakpoint
CREATE TYPE "public"."verification_request_status" AS ENUM('verified', 'pending', 'rejected');--> statement-breakpoint
ALTER TABLE "profile_verifiacation_table" ALTER COLUMN "verification_request_status" SET DEFAULT 'pending'::"public"."verification_request_status";--> statement-breakpoint
ALTER TABLE "profile_verifiacation_table" ALTER COLUMN "verification_request_status" SET DATA TYPE "public"."verification_request_status" USING "verification_request_status"::"public"."verification_request_status";--> statement-breakpoint
ALTER TABLE "users_table" ALTER COLUMN "profile_verification_status" SET DEFAULT 'unverified'::"public"."profile_verification_status";--> statement-breakpoint
ALTER TABLE "users_table" ALTER COLUMN "profile_verification_status" SET DATA TYPE "public"."profile_verification_status" USING "profile_verification_status"::"public"."profile_verification_status";