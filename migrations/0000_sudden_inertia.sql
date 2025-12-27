CREATE TABLE "profile_verifiacation_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerkId" varchar(255) NOT NULL,
	"verification_request_status" text DEFAULT 'pending',
	"name" text NOT NULL,
	"profile_pic" text NOT NULL,
	"document_pic" text NOT NULL,
	"roll_no" varchar(6) NOT NULL,
	"reg_no" varchar(10) NOT NULL,
	"semester" varchar(10) NOT NULL,
	"shift" varchar(10) NOT NULL,
	"department" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerkId" varchar(255) NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"profile_verification_status" text DEFAULT 'unverified',
	"name" text NOT NULL,
	"email" text NOT NULL,
	"profile_pic" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);
