CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'pending', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('none', 'pending', 'refunded');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chapa_tx_ref" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "refund_status" "refund_status" DEFAULT 'none' NOT NULL;