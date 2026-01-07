CREATE TYPE "public"."profile_verification_status" AS ENUM('verified', 'unverified');--> statement-breakpoint
CREATE TYPE "public"."roles_enum" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_request_status" AS ENUM('verified', 'pending', 'rejected');