CREATE TABLE "books_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"images" text[] NOT NULL,
	"category" text NOT NULL,
	"condition" text NOT NULL,
	"price" integer NOT NULL,
	"semester" varchar(50),
	"location" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_sold" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
